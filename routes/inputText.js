//original code
"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;
const Dialogflow = require("../dialogflowHandler");
const dialogflowHandler = new Dialogflow();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
    const message = req.body.message;
    const sessionID = req.body.sessionID;
    console.log("sessionID: " + req.body.sessionID);
    console.log("user: " + JSON.stringify(req.user));

    if (req.session.passport && req.session.passport.user) {
        // user is logged in
        var userID = req.session.passport.user; // this is the user ID used in mongoDB
        // TODO: change to req.user._id ^
        var isVisitor = false;
    } else {
        var isVisitor = true;
    }

    try {
        var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(
            message,
            sessionID
        );

        if (
            !(
                dialogflowResponse &&
                dialogflowResponse[0].queryResult.fulfillmentMessages
            )
        ) {
            //retry once
            var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(
                message,
                sessionID
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
                        "I'm sorry. Something went wrong with my internal server. Please resend your message or try again later"
                });
                return;
            }
        }
        var resultMessage =
            dialogflowResponse[0].queryResult.fulfillmentMessages[0].text
                .text[0];
    } catch (err) {
        console.log(err);
    }

    if (isVisitor) {
        res.json({
            message: resultMessage
        });
        return;
    }

    const intentName = dialogflowResponse[0].queryResult.intent.displayName;

    switch (intentName) {
        case "Email Conversation History":
            var transport = nodemailer.createTransport({
                host: "in-v3.mailjet.com",
                port: 587,
                auth: {
                    user: process.env.MAILJET_USER,
                    pass: process.env.MAILJET_PASSWORD
                }
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
            for (let i = 0; i < userData.conversationHistory.length; i++) {
                if (i % 3 == 0) {
                    const messageTime = userData.conversationHistory[i];
                    const messageDate = messageTime.substring(0, 10);
                    const messageHoursMinutes = messageTime.substring(11, 16);
                    if (messageDate + messageHoursMinutes !== prevMessageTime) {
                        prevMessageTime = messageDate + messageHoursMinutes;
                        htmlBody += `<h4>${messageDate +
                            " " +
                            messageHoursMinutes}</h4>`;
                    }
                } else if (i % 2 == 0) {
                    htmlBody += `<p><b>${req.user.name}:</b> ${userData.conversationHistory[i]}</p>`;
                } else {
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
                </html>`
            };

            // transport.sendMail(message, function(err, info) {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         console.log("Email response: ", info);
            //     }
            // });
            console.log(`<!DOCTYPE html>
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
            </html>`);

            break;
        case "Email Address - Initial":
            try {
                await db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: {
                            contactName:
                                dialogflowResponse[0].queryResult.parameters[
                                    "given-name"
                                ]
                        }
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
            break;
    }

    const mhraClasses = ["Class I", "Class IIa", "Class IIb", "Class III"];
    var updatedConvHistory = false;
    for (const mhraClass of mhraClasses) {
        const regex = RegExp(`\\s${mhraClass}[^a-zA-Z0-9]`);
        // if (resultMessage.includes(mhraClass)) {
        if (regex.test(resultMessage)) {
            // if user's MD is of var mhraClass, update convHistory and mhraClass
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { mhraClass },
                        $push: {
                            conversationHistory: {
                                $each: [
                                    new Date().toISOString(),
                                    message,
                                    resultMessage
                                ]
                            }
                        }
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
        try {
            db.collection("userData").updateOne(
                { _id: new ObjectId(userID) },
                {
                    $push: {
                        conversationHistory: {
                            $each: [
                                new Date().toISOString(),
                                message,
                                resultMessage
                            ]
                        }
                    }
                },
                { upsert: true }
            );
        } catch (err) {
            console.log(err);
        }
    }

    if (resultMessage == "Great! You’ve gone through all required questions!") {
        console.log(1);
    }

    res.json({
        message: resultMessage
    });
});

module.exports = router;
