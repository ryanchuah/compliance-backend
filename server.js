require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const morgan = require("morgan");
const mongoUtil = require("./mongoUtil");
const passport = require("passport");

// open mongodb connection to get mongodb client
mongoUtil.connectToServer(function(err, client) {
    if (err) console.log(err);

    // initialise passport config
    require("./config/passport")(passport);
    require("./config/passportAdmin")(passport);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // route logger to log HTTP requests
    app.use(morgan("dev"));

    // use express sessions
    app.use(
        session({
            secret: "taco cat",
            resave: false,
            store: new MongoStore({ client, dbName: "compliance" }),
            saveUninitialized: false
        })
    );

    app.use(passport.initialize());
    app.use(passport.session()); // calls serializeUser and deserializeUser

    // route for Dialogflow Fulfillment to connect to
    app.use("/api/agent", require("./routes/agent"));

    // route to connect frontend
    app.use("/api/inputText", require("./routes/inputText"));

    // user authentication
    app.use("/user", require("./routes/user"));

    app.use("/api/userData", require("./routes/userData"));
    app.use("/api/developer", require("./routes/developer"));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
