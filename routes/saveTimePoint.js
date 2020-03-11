//original code
"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("../mongoUtil");
var db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;

function padZero(num) {
    var result;
    if (num < 10) {
    result = "0" + num;
} else {
    result = "" + num;
}
    return result;
}

function getTimeStr() {
    var d = new Date();
    var res = "**" + d.getFullYear() + "/" + padZero(d.getMonth() + 1) + 
    "/" + padZero(d.getDate()) + " " + padZero(d.getHours()) + ":" + 
    padZero(d.getMinutes()) + ":" + padZero(d.getSeconds());
    return res;
}

router.post("/", async (req, res) => {
    const userID = req.session.passport.user; // this is the ID used in mongoDB

    try {
        db.collection("userData").updateOne(
            { _id: new ObjectId(userID) },
            { $push: { conversationHistory: getTimeStr() } },
            { upsert: true }
        );
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
