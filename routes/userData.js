const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;

router.get("/history", async (req, res) => {
    // console.log(req.user);
    const userID = req.user._id;
    if (req.user) {
        try {
            var userData = await db
                .collection("userData")
                .findOne({ _id: ObjectId(userID) });
        } catch (err) {
            console.log(err);
        }
        console.debug(JSON.stringify(userData.conversationHistory));
        res.json(userData.conversationHistory);
    }
});

module.exports = router;
