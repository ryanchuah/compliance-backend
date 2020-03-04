const MongoClient = require("mongodb").MongoClient;

// Connection URL
const url = require("./config/keys").mongoURI;
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var state = { dbData: undefined };

module.exports = {
    connectToServer: function(callback) {
        client.connect(function(err, client) {
            if (err) console.log(err);
            state.dbData = client.db("compliance");
            return callback(err, client);
        });
    },

    getDbData: function() {
        return state.dbData;
    }
};
