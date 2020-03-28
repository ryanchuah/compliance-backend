const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;

router.get("/history", async (req, res) => {
    console.log(req);
    const userID = req.user._id;
    if (req.user) {
        try {
            var userData = await db
                .collection("userData")
                .findOne({ _id: ObjectId(userID) });
        } catch (err) {
            console.log(err);
        }
        res.json(userData.conversationHistory);
    }
});

router.get("/suggestionData", async (req, res) => {
    // console.log(req.user);
    // const userID = req.user._id;
    // if (req.user) {
    //     try {
    //         var userData = await db
    //             .collection("userData")
    //             .findOne({ _id: ObjectId(userID) })
    //             .project({ mhraClass: 1 }) //return only mhraClass without _id field
    //             .toArray();
    //     } catch (err) {
    //         console.log(err);
    //     }
    //     console.debug(JSON.stringify(userData.conversationHistory));
    //     res.json(userData.conversationHistory);
    // }

        try {
            var userData = await db
                .collection("userData")
                .find({ _id: ObjectId("5e63c31d7b17c634d3a1a5f7") })
                .project({ mhraClass: 1 }) //return only mhraClass without _id field
                .toArray();
            console.log(userData);
            
        } catch (err) {
            console.log(err);
        }
        res.json(userData[0]);
    
});

module.exports = router;
