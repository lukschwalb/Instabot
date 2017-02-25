var fs = require("fs");

module.exports = Log;

function Log(logPath)
{
	this.logPath = logPath || "./log";
}

Log.prototype.writeToFile = function(out, level)
{
	fs.appendFile(this.logPath, level + " " + out + "\n", function(error)
	{
		if(error)
		{
			this.writeToConsole(error, "error");
		}
	});
}

Log.prototype.writeToConsole = function(out, level)
{
	var prefix = "\x1b[37m";
	switch(level)
	{
		case "error":
			prefix = "\x1b[31m";
			break;
		case "warning":
			prefix = "\x1b[33m";
			break;
	}

	console.log(prefix, out);
}

Log.prototype.log = function(msg)
{
	var out = Log.pasteMsg(msg);
	this.writeToConsole(out, "info");
	this.writeToFile(out, "info");
}

Log.prototype.error = function(msg)
{
	var out = Log.pasteMsg(msg);
	this.writeToConsole(out, "error");
	this.writeToFile(out, "error");
}

Log.prototype.warning = function(msg)
{
	var out = Log.pasteMsg(msg);
	this.writeToConsole(out, "warning");
	this.writeToFile(out, "warning");
}

Log.pasteMsg = function(msg)
{
	var out = Log.getTime() + " " + msg;

	return out;
}

Log.getTime = function() 
{
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}