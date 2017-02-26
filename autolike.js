var Client = require('instagram-private-api').V1;
var _ = require('underscore');
var Promise = require('bluebird');
var mongo = require("./mongo.js");
var Log = require("./log.js");
var sessionController = require("./sessionController.js");
var logger = new Log();
var todayLikeCount = 0;
var today = new Date();


var likeByTag = function(session, instaSession, callback)
{
  mongo(function(db)
  {
    var tagName = session.source;
    var likeAmount = session.likeCount;
    var username = session.creator;
    var sessionId = session._id;

    var feed = new Client.Feed.TaggedMedia(instaSession, tagName);
    var likeDelay = 0;

    db.collection("accounts").findOne({username: username}, function(error, userObj)
    {
      var settings = userObj.settings.autoLike;

      var running = userObj.settings.autoComment.running;
      var lowCommentFrequency = parseInt(userObj.settings.autoComment.lowCommentFrequency);
      var maxCommentFrequency = parseInt(userObj.settings.autoComment.maxCommentFrequency);
      var commentList = userObj.settings.autoComment.commentList;

      commentData =
      {
        running: running,
        lowCommentFrequency: lowCommentFrequency,
        maxCommentFrequency: maxCommentFrequency,
        commentList: commentList,
        commentCounter: _.random(lowCommentFrequency, maxCommentFrequency)
      };

      var mediaArray = [];
      var medias = grabMedias(likeAmount, feed, mediaArray, 0, settings.dailyMaxLikeCount, userObj.username, function(medias)
      {
        medias.forEach(function(media)
        {
          db.collection("sessions").update({_id: sessionId}, {$addToSet: {mediaList: media.params.webLink}});
          var partDelay = _.random(parseInt(settings.likeDelayMin), parseInt(settings.likeDelayMax)) * 1000;
          setTimeout(likeMedia, likeDelay, media, instaSession, username, db, sessionId, commentData, callback);
          likeDelay += partDelay;
        });
      });
    });
  });
}


function grabMedias(mediaAmount, feed, mediaArray, mediaCount, dailyMaxLikeCount, username, callback)
{
    var more = true;
    Promise.map(_.range(0, 1), function()
    {
      return feed.get();
    }).then(function(medias)
    {
      for(var i = 0; i < medias[0].length; i++)
      {
        var media = medias[0][i];
        if(checkMedia(media, dailyMaxLikeCount, username))
        {
          mediaArray.push(media);
          mediaCount ++;
        }

        if(mediaCount >= mediaAmount)
        {
          more = false;
          callback(mediaArray);
          break;
        }
      }
      if(more)
      {
        grabMedias(mediaAmount, feed, mediaArray, mediaCount, callback);
      }
    })
}

function checkMedia(media, dailyMaxLikeCount, username)
{
  if(!media.params.hasLiked)
  {
    if(!media.params.likeCount <= 20)
    {
      if(checkTodayLikes(dailyMaxLikeCount, username))
      {
        return true;
      }
    }
  }

  return false;
}

function likeMedia(media, instaSession, username, db, sessionId, commentData, callback)
{
  db.collection("accounts").findOne({username: username}, function(error, userObj)
  {
    if(userObj.settings.autoLike.running)
    {
      db.collection("sessions").findOne({_id: sessionId}, function(error, session)
      {
        if(session)
        {
          db.collection("sessions").update({_id: sessionId}, {$pull: {mediaList: media.params.webLink}});
          db.collection("sessions").update({_id: sessionId}, {$inc: {likesDone: 1}});

          if(session.likesDone +1 >= session.likeCount)
          {
            logger.log("Like session done");
            db.collection("sessions").remove({_id: sessionId});
            callback(username);
          }
          Client.Like.create(instaSession, media.id);
          dailyMaxLikeCount ++;

          logger.log("Liked page " + media.params.webLink);

          if(commentData.running == "true")
          {
            commentData.commentCounter --;
            if(commentData.commentCounter <= 0)
            {
              var commentList = commentData.commentList.split("|");
              var comment = commentList[_.random(0, commentList.length - 1)];

              logger.log("Commented on " + media.params.webLink);

              Client.Comment.create(instaSession, media.id, comment);
              commentData.commentCounter = _.random(commentData.lowCommentFrequency, commentData.maxCommentFrequency);
            }
          }
        }
      });
    }
    else
    {
      db.collection("sessions").remove({_id: sessionId});
    }
  });
}

function checkTodayLikes(dailyMaxLikeCount, username)
{
  var date = new Date();
  console.log(todayLikeCount + "  " + dailyMaxLikeCount);
  if(today.getDay() == date.Day() && today.getMonth() == date.getMonth && today.getFullYear() == date.getFullYear())
  {
    if(todayLikeCount < dailyMaxLikeCount)
    {
      return true;
    }
  }
  else
  {
    today = new Date();
    todayLikeCount = 0;

    return true;
  }

  logger.log("Reached daily max likes")
  sessionController.cleanLikeSession();
  setInterval(function()
  {
    var date = new Date();
    if(today.getDay() != date.Day())
    {
      sessionController.newLikeSession(username);
      today = new Date();

    }
  }, 5000);
  return false;
}

module.exports =
{
  likeByTag: likeByTag
}
