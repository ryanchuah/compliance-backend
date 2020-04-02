const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;

router.get("/history", async (req, res) => {
    const userID = req.user._id;
    if (req.user) {
        try {
            var userData = await db
                .collection("userData")
                .findOne({ _id: ObjectId(userID) });
        } catch (err) {
            console.log(err);
        }
        if (userData && userData.conversationHistory){
            res.json(userData.conversationHistory);
        } else{
            res.json([])
        }
    }
});

router.get("/suggestionData", async (req, res) => {
    // console.log(req.user);
    const userID = req.user._id;
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
    const path = require("path");
    const jsonfile = require("jsonfile");
    const suggestionsFile = path.join(
        __dirname,
        "../",
        "resources",
        "suggestions.json"
    );

    const suggestionReferenceObj = await jsonfile.readFile(suggestionsFile);
    console.log(suggestionReferenceObj);
    const suggestionResult = [];
    try {
        var userSuggestionData = await db
            .collection("userData")
            .findOne(
                { _id: userID },
                { projection: { _id: 0, mhraClass: 1 } }
            );

    } catch (err) {
        console.log(err);
    }

    if (userSuggestionData){
        for (const obj of suggestionReferenceObj.mhra.class) {
            if (obj.value === userSuggestionData.mhraClass) {
                suggestionResult.push([
                    obj.situation,
                    obj.actionNeeded,
                    obj.source,
                    obj.resource
                ]);
            }
        }

    }
    res.json(suggestionResult);
});

module.exports = router;
