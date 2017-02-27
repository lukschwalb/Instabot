var express = require('express');
var router = express.Router();
var mongo = require("../mongo.js");
var assert = require("assert");
var sessionController = require("../sessionController.js");
var Log = require("../log.js");
var logger = new Log();

/* GET home page. */
router.get('/update', function(req, res, next)
{
	mongo(function(db)
	{
		var query = req.query;
		if(query.command)
		{
			var command = query.command;
			if(command == "updateStatus")
			{
				if(query.type && query.state && query.username)
				{
					var type = query.type;
					if(type == "Likebot")
					{
						db.collection("accounts").update({username: query.username}, {$set: {"settings.autoLike.running": query.state}});
						logger.log("Changed state of " + type + " to " + query.state);
						if(query.state == "true")
						{
							sessionController.cleanLikeSession(query.username);
							sessionController.newLikeSession(query.username);
						}
						else
						{
							sessionController.cleanLikeSession(query.username);
						}
					}
					else if(type == "AutoComment")
					{
						db.collection("accounts").update({username: query.username}, {$set: {"settings.autoComment.running": query.state}});
						logger.log("Changed state of " + type + " to " + query.state);

						db.collection("accounts").findOne({username: query.username}, function(error, userObj)
						{
							assert.equal(null, error);

							if(userObj.settings.autoLike.running == "true" && query.state == "true")
							{
								sessionController.newLikeSession(query.username);
							}
							else
							{
								sessionController.cleanLikeSession(query.username);
							}
						});
					}
				}
			}
			else if(command == "updateSettings")
			{
				if(query.username && query.type)
				{
					var type = query.type;
					if(type == "Likebot")
					{
						if(query.field1 && query.field2 && query.field3 && query.field4 && query.field5 && query.field6 && query.field7 && query.field8 && query.checkbox1)
						{
							db.collection("accounts").update({username: query.username}, {$set: {
								"settings.autoLike.sessionDelayMin": query.field1,
								"settings.autoLike.sessionDelayMax": query.field2,
								"settings.autoLike.likeCountMin": query.field3,
								"settings.autoLike.likeCountMax": query.field4,
								"settings.autoLike.likeDelayMin": query.field5,
								"settings.autoLike.likeDelayMax": query.field6,
								"settings.autoLike.dailyMaxLikeCount": query.field7,
								"settings.autoLike.likeByTagList": query.field8,
								"settings.autoLike.likeByTag": query.checkbox1
							}});
							logger.log("Likebot settings updated");
							sessionController.cleanLikeSession(query.username);
							db.collection("accounts").findOne({username: query.username}, function(error, userObj)
						  {
								assert.equal(null, error);

								if(userObj.settings.autoLike.running == "true")
								{
									sessionController.newLikeSession(query.username);
								}
							});
						}
					}
					else if(type == "AutoComment")
					{
						if(query.field1 && query.field2 && query.field3)
						{
							db.collection("accounts").update({username: query.username}, {$set: {
								"settings.autoComment.lowCommentFrequency": query.field1,
								"settings.autoComment.maxCommentFrequency": query.field2,
								"settings.autoComment.commentList": query.field3
							}});
							logger.log("AutoComment settings updated");
							sessionController.cleanLikeSession(query.username);
							db.collection("accounts").findOne({username: query.username}, function(error, userObj)
						  {
								assert.equal(null, error);

								if(userObj.settings.autoLike.running == "true")
								{
									sessionController.newLikeSession(query.username);
								}
							});
						}
					}
				}
			}
			else if(command == "updateUsername")
			{
				if(query.newUsername && query.oldUsername)
				{
					db.collection("accounts").update({username: query.oldUsername}, {$set: {username: query.newUsername}});
				}
			}
			else if(command == "updatePassword")
			{
				if(query.username && query.newPassword)
				{
					db.collection("accounts").update({username: query.username}, {$set: {password: query.newPassword}});
				}
			}
			else if(command == "removeAccount")
			{
				if(query.username)
				{
					db.collection("accounts").remove({username: query.username});
				}
			}
			else if(command == "addAccount")
			{
				if(query.username && query.password)
				{
					var userObj = getAccountObject(query.username, query.password);
					db.collection("accounts").save(userObj, function(error, saved)
					{
						if(error || !saved)
						{
							logger.error(error);
						}
						else
						{
							logger.log("Created new account " + user.username);
						}
					})
				}
			}
		}
	});
});

function getAccountObject(username, password)
{
	user =
	{
		username: username,
		password: password,
		settings:
		{
			autoLike:
			{
				running: false,
				likeByTag: true,
				likeByTagList: "insta",
				likeByUserFollowers: false,
				likeByUserFollowersList: "",
				sessionDelayMin: 30,
				sessionDelayMax: 80,
				likeCountMin: 40,
				likeCountMax: 80,
				likeDelayMin: 2,
				likeDelayMax: 4,
				dailyMaxLikeCount: 500
			},
			autoComment:
			{
				running: false,
				lowCommentFrequency: 3,
				maxCommentFrequency: 8,
				commentList: ""
			}
		}
	};
	return user;
}

module.exports = router;


//"command=status&type=" + type + "&state=running");
