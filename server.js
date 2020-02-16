require("dotenv").config()

const express = require("express");
const app = express();
const session = require('express-session')
const morgan = require('morgan')
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(morgan('tiny'))
const mongoUtil = require('./mongoUtil')
app.use(
  session({
    secret: 'taco cat',
    resave: false,
    saveUninitialized: false
  })
);

mongoUtil.connectToServer(function (err, client) {
    if (err) console.log(err);
    
    app.use('/', require('./routes/index'))
    app.use('/users', require('./routes/users'))

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  });
