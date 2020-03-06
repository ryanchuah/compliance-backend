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
    const userID = req.session.passport.user; // this is the ID used in mongoDB

    try {
        var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(
            message,
            sessionID
        );
    } catch (err) {
        console.log(err);
    }

    switch (dialogflowResponse[0].queryResult.intent.displayName) {
        case "Email Conversation History":
            const user = await db
                .collection("user")
                .findOne({ _id: ObjectId(userID) });
            const userEmail = user.email;
            var transport = nodemailer.createTransport({
                host: "in-v3.mailjet.com",
                port: 587,
                auth: {
                    user: process.env.MAILJET_USER,
                    pass: process.env.MAILJET_PASSWORD
                }
            });
            const message = {
                from: "syseng.team39@gmail.com", // Sender address
                to: "recipient@gmail.com", // List of recipients
                subject: "Compliance Bot Conversation History", // Subject line
                text: "<History>" // Plain text body
            };
            transport.sendMail(message, function(err, info) {
                if (err) {
                    console.log(err);
                }
            });
    }
    console.log(dialogflowResponse[0]);

    const resultMessage =
        dialogflowResponse[0].queryResult.fulfillmentMessages[0].text.text[0];

    try {
        db.collection("userData").updateOne(
            { _id: new ObjectId(userID) },
            {
                $push: {
                    conversationHistory: { $each: [message, resultMessage] }
                }
            },
            { upsert: true }
        );
    } catch (err) {
        console.log(err);
    }

    res.json({
        message: resultMessage
    });
});

module.exports = router;
