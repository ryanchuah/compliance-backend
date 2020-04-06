// connect frontend to DialogFlow API
// the reason why the frontend does not just hit Dialogflow's detectIntent API directly
// is because we would not be able to identify users based on authentication
"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;
const Dialogflow = require("../dialogflowHandler");
const dialogflowHandler = new Dialogflow();
const nodemailer = require("nodemailer");

router.post("/", async (req, res, next) => {
    async function getRecentContextsFromDb(userID) {
        const result = await db
            .collection("userData")
            .findOne(
                { _id: ObjectId(userID) },
                { projection: { _id: 0, recentContexts: 1 } }
            );
        if (result && result.recentContexts) {
            const recentContexts = result.recentContexts;
            return recentContexts;
        }
        return [];
    }

    async function getDialogflowResponse(
        message,
        sessionID,
        isStartOfNewSession,
        userID
    ) {
        try {
            if (isStartOfNewSession && !isVisitor) {
                var recentContexts = await getRecentContextsFromDb(userID);
            } else {
                var recentContexts = null;
            }
            var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(
                message,
                sessionID,
                recentContexts
            );

            if (
                !(
                    dialogflowResponse &&
                    dialogflowResponse[0].queryResult.fulfillmentMessages
                )
            ) {
                // if empty response from dialogflow, retry once
                var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(
                    message,
                    sessionID,
                    recentContexts
                );
                if (
                    !(
                        dialogflowResponse &&
                        dialogflowResponse[0].queryResult.fulfillmentMessages
                    )
                ) {
                    // if still no response after retry, send error message then quit
                    res.json({
                        message:
                            "I'm sorry. Something went wrong with my internal server. Please resend your message or try again later",
                    });
                    return;
                }
            }
            return dialogflowResponse[0];
        } catch (err) {
            console.log(err);
        }
    }

    async function handleParameters(dialogflowResponse) {
        // post parameter values to database

        const parameter = dialogflowResponse.queryResult.parameters.fields;

        if (parameter["full-name"]) {
            function titleCase(str) {
                const words = str.split(" ");
                const result = [];
                for (const word of words) {
                    result.push(
                        word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                    );
                }
                return result.join(" ");
            }

            const givenNames = [];
            for (const val of parameter["full-name"].listValue.values) {
                givenNames.push(titleCase(val.stringValue));
            }

            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { name: givenNames.join(" ") },
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
        } else if (parameter["address"]) {
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { address: parameter["address"].stringValue },
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
        } else if (parameter["company"]) {
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { company: parameter["company"].stringValue },
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
        } else if (parameter["email"]) {
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { email: parameter["email"].stringValue },
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
        }
    }

    async function handleIntentName(dialogflowResponse) {
        // perform actions if certain intents are matched
        const intentName = dialogflowResponse.queryResult.intent.displayName;
        switch (intentName) {
            case "Email Conversation History":
                var transport = nodemailer.createTransport({
                    host: "in-v3.mailjet.com",
                    port: 587,
                    auth: {
                        user: process.env.MAILJET_USER,
                        pass: process.env.MAILJET_PASSWORD,
                    },
                });
                try {
                    var userData = await db
                        .collection("userData")
                        .findOne(
                            { _id: ObjectId(userID) },
                            { projection: { _id: 0, conversationHistory: 1 } }
                        );
                } catch (err) {
                    console.log(err);
                }

                var htmlBody = "";
                var prevMessageTime = "";
                var n = 0;
                for (let i = 0; i < userData.conversationHistory.length; i++) {
                    if (i == 3 * n) {
                        const messageTime = userData.conversationHistory[i];
                        const messageDate = messageTime.substring(0, 10);
                        const messageHoursMinutes = messageTime.substring(
                            11,
                            16
                        );
                        if (
                            messageDate + messageHoursMinutes !==
                            prevMessageTime
                        ) {
                            prevMessageTime = messageDate + messageHoursMinutes;
                            htmlBody += `<h4>${
                                messageDate + " " + messageHoursMinutes
                            }</h4>`;
                        }
                    } else if (i == 3 * n + 1) {
                        htmlBody += `<p><b>${req.user.name}:</b> ${userData.conversationHistory[i]}</p>`;
                    } else {
                        n += 1;
                        htmlBody += `<p><b>Bot:</b> ${userData.conversationHistory[i]}</p>`;
                    }
                }

                const message = {
                    from: "syseng.team39@gmail.com", // Sender address
                    to: req.user.email, // List of recipients
                    subject: "Compliance Bot Conversation History", // Subject line
                    html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                    </head>
                    <body>
                        <h2>Compliance Bot Conversation History</h2>
                        ${htmlBody}
                    </body>
                    </html>`,
                };

                transport.sendMail(message, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Email response: ", info);
                    }
                });

                break;

            case "1Provideurl - No":
                //user can not provide URL
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                provideURL: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "2Contact-Organisation - No" || "2Contact-Organisation - No 2":
                // users can not get contact with the organisation via the product
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                contactOrganisation: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "4Confirm-Use-Of-Branding - No":
                // User do not have th permission to use NHSD branding
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                NHSDBranding: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "6Confirm-With-Gpc - No":
                // User can not confirm that they have registered with GPC when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                confirmGPC: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "8Confirm-Healthcare-Registration - No":
                // User can not confirm the recent healthcare registration when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                confirmHealthcareReg: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "9Provide-A-Guest-Login - No" ||
                "9Provide-A-Guest-Login - No 2" ||
                "9Provide-A-Guest-Login - No 3":
                // It does not provide a Guest Login in the product
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                guestLogin: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "11Confirm-Registration-With-Cqc - No":
                // User can not confirm registration with CQC
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                confirmRegWithCQC: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "12Provide-Cqc-Number - No":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                provideCQCnumber: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "13Provide-Recent-Cqc-Registration - No":
                // User are not able to provide the recent CQC registration
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                provdieReCQC: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "16Provide-Description - No" ||
                "16Provide-Description - No 2" ||
                "16Provide-Description - No 3":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                provideDescrip: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "20Confirm-Replace-A-Nhs-Service - No" ||
                "20Confirm-Replace-A-Nhs-Service - No 2":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                confirmReplNHSservice: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "24Provide-Detail-Of-The-Trial - No":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                provideTrial: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "26Confirm-Where-To-Process - No":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                confirmWhereProcessPD: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "28Provide-Platform-Number - No":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                versionNumber: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "29Confirm-Type-Of-Pharmacy - No" ||
                "29Confirm-Type-Of-Pharmacy - No 2" ||
                "29Confirm-Type-Of-Pharmacy - No 3":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                typeOfPharmacy: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "31Provide-Evidence-Of-Clinical-Benefits - No":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                evidenceOfClicBenefit: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "32Provide-The-Url-Of-Clinical-Benefits-D11 - No" ||
                "32Provide-The-Url-Of-Clinical-Benefits-D11 - No 2":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                URLofBenefits: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "33Provide-The-Reason-Of-Not-Have-Clinical-Benefits - No" ||
                "33Provide-The-Reason-Of-Not-Have-Clinical-Benefits - No 2":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                reasonNotClinicBenefit: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "37Confirm-Reason-Not-Have-Behavioural-Benefits - No" ||
                "37Confirm-Reason-Not-Have-Behavioural-Benefits - No 2":
                // User can not provide CQC number when required
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                reasonNotBehaBenefits: false,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "Downloaded-Or-Purchased - Yes" ||
                "Downloaded-Or-Purchased - Yes 2" ||
                "Downloaded-Or-Purchased - Yes 3" ||
                "Downloaded-Or-Purchased - Yes 4":
                //
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                downloadedORpurchased: true,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "1-System-Service - Yes"||"1-System-Service - Yes 2":
                //
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                Tier1: true,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "2-Inform - Yes" ||
                "2-Simple-Monitoring - Yes" ||
                "2-Communicate - Yes":
                //
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                Tier2: true,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "3A-Behaviour-Change - Yes" || "3A-Self_Manage - Yes":
                //
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                Tier3a: true,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;

            case "3B-Treat - Yes" ||
                "3B-Acitve_Monitoring - Yes" ||
                "3B-Calculate - Yes" ||
                "3B-Diagnose - Yes":
                //
                try {
                    await db.collection("userData").updateOne(
                        { _id: new ObjectId(userID) },
                        {
                            $set: {
                                Tier3b: true,
                            },
                        },
                        { upsert: true }
                    );
                } catch (err) {
                    console.log(err);
                }
                break;
        }
    }

    function getRecentContexts(dialogflowResponse) {
        // get an array of the most recent contexts

        function getContextName(ctx) {
            const words = ctx.name.split("/");
            return words[words.length - 1];
        }

        const contexts = dialogflowResponse.queryResult.outputContexts;

        const mostRecent = [];
        var maxLifespanCount = -1;
        for (const ctx of contexts) {
            if ("lifespanCount" in ctx) {
                if (ctx.lifespanCount > maxLifespanCount) {
                    maxLifespanCount = ctx.lifespanCount;
                    mostRecent.length = 0;
                    ctx.name = getContextName(ctx);
                    mostRecent.push(ctx);
                } else if (ctx.lifespanCount === maxLifespanCount) {
                    ctx.name = getContextName(ctx);
                    mostRecent.push(ctx);
                }
            }
        }

        return mostRecent;
    }

    const message = req.body.message;
    const sessionID = req.body.sessionID;
    const isStartOfNewSession = req.body.isStartOfNewSession;

    if (req.session.passport && req.session.passport.user) {
        // user is logged in
        var userID = req.user._id; // this is the user ID used in mongoDB
        var isVisitor = false;
    } else {
        var isVisitor = true;
    }

    const dialogflowResponse = await getDialogflowResponse(
        message,
        sessionID,
        isStartOfNewSession,
        userID
    );

    var resultMessage =
        dialogflowResponse.queryResult.fulfillmentMessages[0].text.text[0];

    if (isVisitor) {
        res.json({
            message: resultMessage,
        });
        return;
    }

    // perform actions if certain intents are matched
    handleIntentName(dialogflowResponse);

    // post parameter values to database
    handleParameters(dialogflowResponse);

    const recentContexts = getRecentContexts(dialogflowResponse);

    // update MHRA class if class has been determined
    const mhraClasses = ["Class I", "Class IIa", "Class IIb", "Class III"];
    var updatedConvHistory = false;
    for (const mhraClass of mhraClasses) {
        const regex = RegExp(`\\s${mhraClass}[^a-zA-Z0-9]`);
        if (regex.test(resultMessage)) {
            // if user's MD is of var mhraClass, update convHistory and mhraClass
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { mhraClass, recentContexts },
                        $push: {
                            conversationHistory: {
                                $each: [
                                    new Date().toISOString(),
                                    message,
                                    resultMessage,
                                ],
                            },
                        },
                    },
                    { upsert: true }
                );
                updatedConvHistory = true;
            } catch (err) {
                console.log(err);
            }
            break;
        }
    }
    if (!updatedConvHistory) {
        // if the conv history hasn't been updated at this point, update conv history
        try {
            db.collection("userData").updateOne(
                { _id: new ObjectId(userID) },
                {
                    $set: { recentContexts },
                    $push: {
                        conversationHistory: {
                            $each: [
                                new Date().toISOString(),
                                message,
                                resultMessage,
                            ],
                        },
                    },
                },
                { upsert: true }
            );
        } catch (err) {
            console.log(err);
        }
    }

    res.json({
        message: resultMessage,
    });

    next();
});

module.exports = router;
