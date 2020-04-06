const express = require("express");
const router = express.Router();
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Login page
router.get("/stats", passport.authenticate("basic"), async (req, res) => {
    const result = [];
    try {
        const data = await db
            .collection("userData")
            .find({})
            .project({ _id: 0, mhraClass: 1 }) //return only mhraClass without _id field
            .toArray();
        const classDict = {
            "Class I": 0,
            "Class IIa": 0,
            "Class IIb": 0,
            "Class III": 0
        };
        for (let i = 0; i < data.length; i++) {
            // count occurrence of each MHRA class
            if (data[i] && data[i].mhraClass) {
                const currMhraClass = data[i].mhraClass;
                
                if (currMhraClass in classDict) {
                    classDict[currMhraClass] = classDict[currMhraClass] + 1;
                } else {
                    console.log("Invalid value in DB Data of mhraClass");
                }
            }
        }

        // get max and min occurrence of MHRA classes
        const max = Math.max.apply(null, Object.values(classDict));
        const min = Math.min.apply(null, Object.values(classDict));

        const localResult = {
            classCount: classDict,
            mostFrequent: Object.keys(classDict).filter(
                // return only MHRA class that has occurrence equal to "const max"
                key => classDict[key] == max
            ),
            leastFrequent: Object.keys(classDict).filter(
                // return only MHRA class that has occurrence equal to "const min"
                key => classDict[key] == min
            )
        };
        result.push({mhraClass: localResult})
    } catch (err) {
        console.log(err);
    }
    res.json(result)
});

router.post("/register", async (req, res, next) => {
    // register an admin account

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
