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
		if(req.query.type)
		{
      var type = req.query.type;
			db.collection("sessions").findOne({type: type}, function(error, data)
      {
        assert.equal(null, error);
        res.send(data);
      });
		}
	});
});

module.exports = router;
