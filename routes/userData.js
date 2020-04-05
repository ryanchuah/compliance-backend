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
        if (userData && userData.conversationHistory) {
            res.json(userData.conversationHistory);
        } else {
            res.json([]);
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
        var userSuggestionData = await db.collection("userData").findOne(
            { _id: userID },
            {
                projection: {
                    _id: 0,
                    mhraClass: 1,
                    providURL: 1,
                    contactOrganisation: 1,
                    NHSDBranding: 1,
                    confirmGPC: 1,
                    confirmHealthcareReg: 1,
                    guestLogin: 1,
                    confirmRegWithCQC: 1,
                    provideCQCnumber: 1,
                    provdieReCQC: 1,
                    provideDescrip: 1,
                    confirmReplNHSservice: 1,
                    provideTrial: 1,
                    confirmWhereProcessPD: 1,
                    versionNumber: 1,
                    typeOfPharmacy: 1,
                    evidenceOfClicBenefit: 1,
                    URLofBenefits: 1,
                    reasonNotClinicBenefit: 1,
                    reasonNotBehaBenefits: 1,
                    downloadedORpurchased: 1,
                    Tier1: 1,
                    Tier2: 1,
                    Tier3a: 1,
                    Tier3b: 1
                }
            }
        );
    } catch (err) {
        console.log(err);
    }

    if (userSuggestionData) {
        // get highest NICE tier
        if (userSuggestionData.Tier3b) {
            var niceTier = "Tier 3b";
        } else if (userSuggestionData.Tier3a) {
            var niceTier = "Tier 3a";
        } else if (userSuggestionData.Tier2) {
            var niceTier = "Tier 2";
        } else if (userSuggestionData.Tier1) {
            var niceTier = "Tier 1";
        }

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
        for (const obj of suggestionReferenceObj.nice.class) {
            if (obj.value === niceTier) {
                suggestionResult.push([
                    obj.situation,
                    obj.actionNeeded,
                    obj.source,
                    obj.resource
                ]);
            }
        }
        for (const key in suggestionReferenceObj.nhsd){
            if (userSuggestionData.key){
                suggestionResult.push([
                    suggestionReferenceObj[key].situation,
                    suggestionReferenceObj[key].actionNeeded,
                    suggestionReferenceObj[key].source,
                    suggestionReferenceObj[key].resource
                ]);
            }
        }
    }
    res.json(suggestionResult);
});

module.exports = router;
