const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var ObjectId = require("mongodb").ObjectId;

router.get(
    // "/history",
    // passport.authenticate("basic", { session: false }),
    // async function(req, res) {
    //     const userID = req.query.userid;
        // try {
        //     var userData = await db
        //     .collection("userData")
        //     .findOne({ _id: ObjectId(userID)});
        // } catch (err) {
        //     console.log(err);
        // }
        // res.json(userData.conversationHistory)
    // }
    "/history",
    async (req, res) => {
        // console.log(req.user);
        const userID = req.user._id
        if (req.user){
            
            try {
                var userData = await db
                .collection("userData")
                .findOne({ _id: ObjectId(userID)});
            } catch (err) {
                console.log(err);
            }
            res.json(userData.conversationHistory)
        } 
    }
);

//Login page
router.post("/login", passport.authenticate("local"), (req, res) => {
    console.log(req);

    var userInfo = {
        name: req.user.name
    };
    res.send(userInfo);
});

//Register page
router.post("/register", async (req, res, next) => {
    const newUser = req.body;

    try {
        const salt = await bcrypt.genSalt(10);

        newUser.hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            });
        });
    } catch (error) {
        console.log(error);

        res.status(500).json(error);
    }

    try {
        const response = await db.collection("user").insertOne({
            name: newUser.name,
            email: newUser.email,
            password: newUser.hashedPassword
        });

        res.status(200).json(response);
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

router.post("/logout", (req, res) => {
    if (req.user) {
        req.logout();
        res.send({ msg: "logging out" });
    } else {
        res.send({ msg: "no user to log out" });
    }
});

module.exports = router;
