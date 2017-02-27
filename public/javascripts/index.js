function sendAjax(params)
{
	var xhttp = getXhttp();

	xhttp.open("GET", "/update/?" + params, true);
	xhttp.send();
}

function getSession(type, username)
{
	var response = '';
	var xhttp = getXhttp();

	xhttp.onreadystatechange = function ()
	{
		if (this.readyState == 4 && this.status == 200)
		{
			if(this.responseText != "")
			{
				console.log(this.responseText+ "--");
				var response = this.responseText;
				var session = JSON.parse(this.responseText);
				if(session.executed)
				{
					getElement("noSession").style.display = "none";
					getElement("sessionActive").style.display = "inline";
					getElement("sessionScheduled").style.display = "none";

					var webLink = session.mediaList[0];
					if(typeof webLink == "undefined")
					{
						webLink = "no next picture";
					}
					getElement("nextImgLink").href = webLink;
					getElement("nextImgLink").innerHTML = webLink;

					var likesDone = session.likesDone;
					var percentage = Math.floor(likesDone / (session.likeCount / 100));
					getElement("likeProgress").style.width = percentage + "%";
					getElement("likeProgress").innerHTML = percentage + "%";
					getElement("sessionProgress").innerHTML = likesDone + " from " + session.likeCount + " likes are done";
				}
				else
				{
					getElement("noSession").style.display = "none";
					getElement("sessionActive").style.display = "none";
					getElement("sessionScheduled").style.display = "inline";

					var sessionDate = new Date(session.date);
					getElement("sessionDate").innerHTML = sessionDate.getHours() + ":" + sessionDate.getMinutes();
				}
			}
			else
			{
				getElement("noSession").style.display = "inline";
				getElement("sessionActive").style.display = "none";
				getElement("sessionScheduled").style.display = "none";
			}
		}
	}

	xhttp.open('GET', '/ajax/?type=' + type + "&username=" + username, true);
	xhttp.send(null);
}

function getXhttp()
{
	var xhttp;
	if (window.XMLHttpRequest)
	{
    	xhttp = new XMLHttpRequest();
    }
    else
    {
    	xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	return xhttp;
}

function updateRunning(obj, type, username)
{
	if(obj.innerHTML == "Running")
	{
		obj.className = "btn btn-danger";
		obj.innerHTML = "Stopped";
		sendAjax("username=" + username + "&command=updateStatus&type=" + type + "&state=false");
	}
	else if(obj.innerHTML == "Stopped")
	{
		obj.className = "btn btn-success";
		obj.innerHTML = "Running";
		sendAjax("username=" + username + "&command=updateStatus&type=" + type + "&state=true");
	}
}

function updateSettings(type, username)
{
	var fields = grabFields(type);
	var checkboxes = grabCheckboxes(type);

	sendAjax("username=" + username + "&command=updateSettings&type=" + type + fields + checkboxes);
}

function grabFields(type)
{
	var error = false;
	var num = 1;
	var ret = "";

	while(!error)
	{
		var elem = document.getElementById(type + num);
		if(elem)
		{
			ret = ret + "&field" + num + "=" + elem.value;
		}
		else
		{
			error = true;
		}
		num ++;
	}

	return ret;
}

function grabCheckboxes(type)
{
	var error = false;
	var num = 1;
	var ret = "";

	while(!error)
	{
		var elem = document.getElementById(type + "Box" + num);
		if(elem)
		{
			ret = ret + "&checkbox" + num + "=" + elem.checked;
		}
		else
		{
			error = true;
		}
		num ++;
	}

	return ret;
}

function getElement(id)
{
	return document.getElementById(id);
}

function changeUsername(oldUsername)
{
	var username = prompt("Enter a new username");

	var update = "command=updateUsername" + "&newUsername=" + username + "&oldUsername=" + oldUsername;
	sendAjax(update);
	window.location = ("?user=" + username)
}

function changePassword(username)
{
	var password = prompt("Enter a new password");

	var update = "command=updatePassword" + "&username=" + username + "&newPassword=" + newPassword;
	sendAjax(update);
}

function removeAccount(username)
{
	var conf = confirm("Are you sure you want to delete the account " + username + "?");
	if (conf)
	{
		var update = "command=removeAccount&username=" + username;
		sendAjax(update);
		location.reload();
	}
}

function addAccount()
{
	var username = prompt("Enter a username");
	var password = prompt("Enter a password");

	var update = "command=addAccount&username=" + username + "&password=" + password;
	sendAjax(update);
	window.location = "/";
}
