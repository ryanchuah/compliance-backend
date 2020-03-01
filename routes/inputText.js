//original code
"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
const Dialogflow = require("../dialogflowHandler");
const dialogflowHandler = new Dialogflow()

router.post("/", async (req, res) => {
    const message = req.body.message
    const sessionID = req.body.sessionID
    try {
        var dialogflowResponse = await dialogflowHandler.sendTextMessageToDialogFlow(message, sessionID)        
    } catch (err) {
        console.log(err);
    }
    const resultMessage = dialogflowResponse[0].queryResult.fulfillmentMessages[0].text.text[0]
 
    res.json({
        message: resultMessage
    })
});

module.exports = router;
