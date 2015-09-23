/*
 * Once the list of devices has been fetched, one will be
 * selected and stored in this global.
 */
var device;

/*
 * Log us in and get a list of devices (spark cores).
 *
 * As soon as the page loads, call the sparkLogin() function
 * to put a login box in the "spark-login" div.
 * Once a successful login has occured, the login box will be
 * hidden and the controls made visible. An attempt to get the
 * list of devices will then be made.
 *
 * login_success is called when a successful login happens, passing in data
 * captured on login.
 */
function login_success(data) {
	// hide the login button and show the controls
	document.getElementById("spark-login").style.display = "none";
	document.getElementById("controls").style.display = "inline-block";
	console.log(data);
	// get the user's list of devices
	spark.listDevices().then(handle_devices, alert);
};

sparkLogin(login_success);

/*
 * handle_devices is called once the login has completed and
 * requested the list of devices from the spark.io server.
 * It will generate the radio boxes for the available cores,
 * marking the first online one by default.
 */
function handle_devices(devices_arg)
{
	devices = devices_arg;
	console.log(devices);
	var div = document.getElementById("devices");
	for (i in devices)
	{
		var d = devices[i];
		var sel = document.createElement('input');
		var lab = document.createElement('label');
		sel.setAttribute('type', 'radio');
		sel.setAttribute('name', 'device');
		lab.setAttribute('for', d.id + '');
		lab.innerHTML = d.name + (d.connected ? "" : " (Offline)") + "<br/>";

		lab.onclick = sel.onclick = function() { device = d };
		if (!device && d.connected)
		{
			device = d;
			sel.checked = true;
		}

		div.appendChild(sel);
		div.appendChild(lab);
	}
}

/* The setInterval() method calls a function or evaluates an expression
 * at specified intervals (in milliseconds).
 *
 * The setInterval() method will continue calling the function until
 * clearInterval() is called, or the window is closed.
 */

/*
 * Read the current time every 1 second, 
 * but only if there is a currently selected device.
 * Q: why do we need to set it to a variable?
 */
var interval = setInterval(function() {
	if (!device)
		return;

	device.getVariable('time', function(err,data) {
		if (err) return alert(err);

		// the element labeled "time", make the html inside that tag set
		// contain the result of querying the time variable.
		console.log(data);
		document.getElementById("time").innerHTML = data.result;
	});	
	device.getVariable('epoch_time', function(err,data) {
		if (err) return alert(err);

		// the element labeled "time", make the html inside that tag set
		// contain the result of querying the time variable.
		document.getElementById("epoch").innerHTML = data.result;
		var epoch_time = new Date(data.result*1000); // Date wants millisec
		
		var day = "unknown";
		switch (epoch_time.getDay()) {
			case 0:
				day = "zondag";
				break;
			case 1:
				day = "maandag";
				break;
			case 2:
				day = "dinsdag";
				break;
			case 3:
				day = "woensdag";
				break;
			case 4:
				day = "donderdag";
				break;
			case 5:
				day = "vrijdag";
				break;
			case 6:
				day = "zaterdag";
				break;
		}

		var month = "unknown";
		switch (epoch_time.getMonth()) {
			case 0:
				month = "januari";
				break;
			case 1:
				month = "februari";
				break;
			case 2:
				month = "mars";
				break;
			case 3:
				month = "april";
				break;
			case 4:
				month = "mei";
				break;
			case 5:
				month = "juni";
				break;
			case 6:
				month = "juli";
				break;
			case 7:
				month = "augustus";
				break;
			case 8:
				month = "september";
				break;
			case 9:
				month = "oktober";
				break;
			case 10:
				month = "november";
				break;
			case 11:
				month = "december";
				break;
		}

		document.getElementById("day").innerHTML = day; 
		document.getElementById("month").innerHTML = month; 
		document.getElementById("date").innerHTML = epoch_time.getDate();
		document.getElementById("year").innerHTML = epoch_time.getFullYear();
		document.getElementById("hours").innerHTML = ("0" + epoch_time.getHours()).slice(-2); // add leading 0
		document.getElementById("minutes").innerHTML = ("0" + epoch_time.getMinutes()).slice(-2); // add leading 0
		document.getElementById("clock_time").innerHTML = epoch_time.getTime();
	});	
}, 1000);



