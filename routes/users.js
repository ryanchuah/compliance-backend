const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Login page
router.post("/login", passport.authenticate("local"), (req, res) => {
    console.log("logged in", req.user);
    var userInfo = {
        username: req.user.username
    };
    res.send(userInfo);
});

//Register page
router.post("/register", async (req, res) => {
    console.log(req.body);
    const newUser = req.body;

    try {
        const salt = await bcrypt.genSalt(10);

        newUser.hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                resolve(hash);
            });
        });
    } catch (error) {
        console.log(error);

        res.status(500).json(error);
    }

    try {
        const response = await db.collection("test").insertOne({
            username: newUser.username,
            password: newUser.hashedPassword
        });

        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

module.exports = router;