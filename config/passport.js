const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoUtil = require("../mongoUtil");
const db = mongoUtil.getDbData();
var ObjectId = require("mongodb").ObjectId;

module.exports = function(passport) {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            (username, password, done) => {
                console.log(
                    "Login attempted with credentials: ",
                    username,
                    " ",
                    password
                );

                // Match user
                db.collection("user")
                    .findOne({
                        email: username
                    })
                    .then(user => {
                        if (!user) {
                            return done(null, false, {
                                message: "That username is not registered"
                            });
                        }

                        // Match password
                        bcrypt.compare(
                            password,
                            user.password,
                            (err, isMatch) => {
                                if (err) throw err;
                                if (isMatch) {
                                    return done(null, user);
                                } else {
                                    return done(null, false, {
                                        message: "Password incorrect"
                                    });
                                }
                            }
                        );
                    });
            }
        )
    );

    // takes user then stores it in req.session.passport
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // takes user id then stores it in req.user
    passport.deserializeUser(function(id, done) {
        id = new ObjectId(id);

        db.collection("user").findOne({ _id: id }, function(err, user) {
            done(err, user);
        });
    });
};
