var express = require('express');
var router = express.Router();
var mongo = require("../mongo.js");
var assert = require("assert");
var username;
var page = "General";

/* GET home page. */
router.get('/ajax', function(req, res, next)
{
	mongo(function(db)
	{
		if(req.query.type && req.query.username)
		{
      var type = req.query.type;
			var username = req.query.username;
			db.collection("sessions").findOne({type: type, creator: username}, function(error, data)
      {
        assert.equal(null, error);
        res.send(data);
      });
		}
	});
});

module.exports = router;
