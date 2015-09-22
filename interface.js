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
}, 1000);

