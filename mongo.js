var MongoClient = require('mongodb').MongoClient;
var Log = require("./log.js");
var logger = new Log();

var instance;

module.exports = function(callback)
{
    var MONGO_DB_URL = process.env.MONGO_DB || "mongodb://localhost:8787/instabot";

    if (instance)
    {
        callback(instance);
        return;
    }

    MongoClient.connect(MONGO_DB_URL, function(error, connection)
    {
        logger.log("Connecting to Mongodb");
        if (error)
        {
            throw new Error(error);
        }
        instance = connection;

        callback(connection);
    });

};
