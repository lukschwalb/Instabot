var Client = require('instagram-private-api').V1;
var mongo = require("./mongo.js");
var assert = require("assert");
var sessions = [];
var usernames = [];

var addSession = function(username, password, callback)
{
  var device = new Client.Device(username);
  var storage = new Client.CookieFileStorage(__dirname + '/cookies/' + username + '.json');

  var session = Client.Session.create(device, storage, username, password);
  session.then(function(session)
  {
    usernames.push(username);
    sessions.push(session);
    callback(session);
  }).catch(function(error)
  {
    callback(error);
  });
}

var getSession = function(username, callback)
{
  for(var i = 0; i < usernames.length; i++)
  {
    if(usernames[i] == username)
    {
      callback(sessions[i]);
      return;
    }
  }

  mongo(function(db)
  {
    var password = db.collection("accounts").findOne({username: username}, function(error, data)
    {
      assert.equal(null, error);

      if(data)
      {
        addSession(username, data.password, callback);
        return;
      }
      else
      {
        callback(-1);
        return;
      }
    });
  });
}

module.exports =
{
  getSession: getSession
}
