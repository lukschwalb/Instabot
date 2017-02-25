var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logg = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require("assert");
var Log = require("./log.js");
var logger = new Log();
var _ = require('underscore');
var Promise = require('bluebird');
var sessionController = require('./sessionController.js');

var index = require('./routes/index');
var update = require('./routes/update');
var ajax = require('./routes/ajax');

logger.log("Starting App");
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logg('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/', update);
app.use('/', ajax);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

sessionController.init();

module.exports = app;



/*
var device = new Client.Device(username);
var storage = new Client.CookieFileStorage(__dirname + '/cookies/' + username + '.json');

var session = Client.Session.create(device, storage, username, password);
session.then(function(session)
{
  var like = new Instabot.Like.Like(session);
  like.likeByTag(67, "cute");
})
*/
