var mongo = require("./mongo.js");
var assert = require("assert");
var autolike = require("./autolike.js");
var instaSessionController = require("./instaSessionController.js");
var _ = require('underscore');
var Log = require("./log.js");
var logger = new Log();
var db;
var sessions;

var init = function()
{
  mongo(function(_db)
  {
    db = _db;
    sessions = _db.collection("sessions");
    cleanAllLikeSession();
    setNotRunning();
    setInterval(checkSessions, 2000);
    logger.log("SessionController initialized");
  });
}


var newLikeSession = function(creator)
{
  var accounts = db.collection("accounts");
  cleanLikeSession(creator);
  accounts.findOne({username: creator}, function(error, user)
  {
    assert.equal(null, error);

    if(user)
    {
      var dateNow = new Date();
      var minutes = _.random(parseInt(user.settings.autoLike.sessionDelayMin), parseInt(user.settings.autoLike.sessionDelayMax));
      var sessionDate = new Date(dateNow.getTime() + minutes * 60000);

      if(user.settings.autoLike.likeByTagList)
      {
        var tags = user.settings.autoLike.likeByTagList.split(" ");
        var tag = tags[_.random(0, tags.length - 1)];
        var likeCountMin = parseInt(user.settings.autoLike.likeCountMin);
        var likeCountMax = parseInt(user.settings.autoLike.likeCountMax);
        var likeCount = _.random(likeCountMin, likeCountMax);

        var sessionObject =
    		{
    			date: sessionDate,
    			type: "Likebot",
    			sourceType: "tag",
          source: tag,
    			likeCount: likeCount,
    			creator: creator,
          executed: false,
          mediaList: [],
          likesDone: 0
    		};

        logger.log("Initializing new like session");
        db.collection("sessions").insert(sessionObject);
      }
    }
  })
}

var cleanLikeSession = function(username)
{
  var sessions = db.collection("sessions");
  sessions.remove({type: "Likebot", creator: username});
}

var cleanAllLikeSession = function()
{
  var sessions = db.collection("sessions");
  sessions.remove({type: "Likebot"});
}

function checkSessions()
{
  sessions.find({}, function(error, data)
  {
    assert.equal(null, error);
    if(data)
    {
      var date = new Date();
      data.forEach(function(session)
      {
        var sessionDate = new Date(session.date);
        if(sessionDate.getMinutes() == date.getMinutes() && sessionDate.getHours() == date.getHours() && !session.executed)
        {
          var type = session.type;
          logger.log("Found session to execute, type: " + type);
          
          if(type == "Likebot")
          {
            var sourceType = session.sourceType;

            if(sourceType == "tag")
            {
              instaSessionController.getSession(session.creator, function(instaSession)
              {
                exp =
                {
                  newLikeSession: newLikeSession,
                  cleanLikeSession: cleanLikeSession
                }

                logger.log("Initializing new like session");

                autolike.likeByTag(session, instaSession, exp);
              });
            }
          }

          db.collection("sessions").update({_id: session._id}, {$set : {executed: true}}, function(){});
        }
      });
    }
  });
}

function setNotRunning()
{
  db.collection("accounts").updateMany({}, {$set: {"settings.autoLike.running": false}});
}


module.exports =
{
  newLikeSession: newLikeSession,
  init: init,
  cleanLikeSession: cleanLikeSession
}
