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

/*
 * Update the displayed LED state on the web page. This is called
 * periodically by the setInterval() callback as well as when ever
 * the on/off button callback returns.
 */
function update_led_state(which_led, val)
{
	if (which_led == "1"){
		var html = document.getElementById("led_state_onboad");
	} else if (which_led == "2"){
		var html = document.getElementById("led_state_0");
	} else if (which_led == "3"){
		var html = document.getElementById("led_state_1");
	}
	if (val == 0)
		html.innerHTML = "OFF";
	else if (val == 1)
		html.innerHTML = "ON";
	else
		html.innerHTML = "???";
}

/*
 * This function is called by the buttons when they are clicked.
 * If the button is pushed before the device global is assigned,
 * nothing will happen.
 */
function set_led(value)
{
	if (!device)
		return;

	device.callFunction("set_led", value, function(err,data) {
		if (err) return alert(err);
		console.log("SUCCESS: ", data);
		which_led = value[0];
		update_led_state(which_led, data.return_value);
	});
}

/*
 * Start a timer every 1 second to check the state of the LED,
 * but only if there is a currently selected device.
 */
setInterval(function() {
	if (!device)
		return;

	device.getVariable('led_state_onboard', function(err,data) {
		if (err) return alert(err);
		which_led = 1;
		update_led_state(which_led, data.result);
	})
	device.getVariable('led_state_0', function(err,data) {
		if (err) return alert(err);
		which_led = 2;
		update_led_state(which_led, data.result);
	})
	device.getVariable('led_state_1', function(err,data) {
		if (err) return alert(err);
		which_led = 3;
		update_led_state(which_led, data.result);
	})

}, 1000);
