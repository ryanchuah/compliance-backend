require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const morgan = require("morgan");
const mongoUtil = require("./mongoUtil");
const passport = require("passport");

mongoUtil.connectToServer(function(err, client) {
    if (err) console.log(err);

    require("./config/passport")(passport);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan("dev"));

    app.use(
        session({
            secret: "taco cat",
            resave: false,
            store: new MongoStore({ client }),
            saveUninitialized: false
        })
    );

    app.use(passport.initialize());
    app.use(passport.session()); // calls serializeUser and deserializeUser

    app.use("/", require("./routes/index"));
    app.use("/user", require("./routes/user"));
    app.use((req, res, next) => {
        console.log("req.session", req.session);
        console.log("req.user", req.user);
        next();
    });
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
