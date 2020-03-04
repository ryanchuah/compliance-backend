//original code
"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;
const Dialogflow = require("../dialogflowHandler");
const dialogflowHandler = new Dialogflow();

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
    const resultMessage =
        dialogflowResponse[0].queryResult.fulfillmentMessages[0].text.text[0];

    try {
        db.collection("userData").update(
            { _id: new ObjectId(userID) },
            { $push: { conversationHistory: { $each: [message, resultMessage] } } },
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
