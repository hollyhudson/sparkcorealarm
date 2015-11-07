/*
 * Once the list of devices has been fetched, one will be
 * selected and stored in this global.
 */
var device;

// time the user wants the alarm set for, string from html, array [hrs,min]
var time_to_set; 
var eight_hrs_default_text; // default text for textbox used to set alarm
var start_rampup; // time to start the ramp up sequence
var ramping_up;  // holds the state of whether or not we're in the rampup seq

/*
 * As soon as the page loads, call the sparkLogin() function
 * to populate the "spark-login" div with the login box.
 * Once a successful login has occured, the login box will be 
 * hidden and the controls made visible.  An attempt to get the list of 
 * devices will then be made.
 */
var cookies = document.cookie;
var access_token = cookies.replace(/(?:(?:^|.*;\s*)sparkcore_token\s*\=\s*([^;]*).*$)|^.*$/, "$1");

if (access_token)
{
	spark.login({accessToken: access_token}).then(successful_login, logout);
} else {
	sparkLogin(successful_login);
}

function successful_login(data)
{
	// hide the login button and show the controls
	document.getElementById("spark-login").style.display = "none";
	document.getElementById("controls").style.display = "inline-block";
	console.log(data);

	// store the access token in a cookie so that we don't have to
	// require a login every time. Only set the cookie if we are passed
	// a token as an argument.
	if (data.access_token)
			document.cookie = "sparkcore_token=" + data.access_token;

	// get the user's list of devices
	spark.listDevices().then(handle_devices, alert);
}

/*
 * Delete the access token cookie and should force a refresh
 */
function logout()
{
	document.cookie = "sparkcore_token=; max-age=0"
	location.reload();
}

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
function login_success(data) {
	// hide the login button and show the controls
	document.getElementById("spark-login").style.display = "none";
	document.getElementById("controls").style.display = "inline-block";
	console.log(data);
	// get the user's list of devices
	spark.listDevices().then(handle_devices, alert);
};

sparkLogin(login_success);
 */

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
 * Set the alarm.
 */
function set_alarm()
{
	time_to_set = (document.getElementById("timebox").value).split(":");

	// new Date(year, month, day, hours, minutes, seconds, milliseconds)
	device.getVariable('epoch_time', function(err,data) {
		if (err) return alert(err);

		// get current date to create full alarm set time
		var current_time = new Date(data.result*1000); // Date wants millisec
		var current_year = current_time.getFullYear();
		var current_month = current_time.getMonth();
		var current_date = current_time.getDate();
		var current_hour = current_time.getHours();
		var current_min = current_time.getMinutes();
		var hour_to_set = parseInt(time_to_set[0]);
		var min_to_set = parseInt(time_to_set[1]);

		// construct a complete wake up time with it, assuming current day:
		var next_alarm = new Date(current_year, current_month, current_date, hour_to_set, min_to_set, 0, 0);

		// if it's before midnight (current time > alarm set time)
		// make the alarm go off the next day
		if (current_hour > hour_to_set) {
			// this does not handle all cases.. for instance daylight savings
			// setting the alarm +23 hrs in the future, etc.
			next_alarm = new Date(next_alarm.getTime() + (24*60*60*1000));
		}

		next_alarm = next_alarm.getTime()/1000; //convert to epoch time

		device.callFunction('set_alarm', next_alarm, function(err, data) {
			if (err) {
				console.log('An error occurred:', err);
			} else {
				console.log('Function set_alarm called succesfully:', data);
			}
		});
	});
}

/*
 * Cancel the Alarm and turn off any lights/beeping/etc
 */
function cancel_alarm()
{
	device.callFunction('cancel_alarm', function(err, data){
		if (err) {
			console.log('An error occurred:', err);
		} else {
			console.log('Function set_alarm called succesfully:', data);
			document.getElementById("next_alarm").innerHTML = device.getVariable('alarm_time', function(err, data){
				if (err) return alert(err);
			});
		}
	});
}

/*
 * Refresh the time in the textbox to 8 hrs from current time
 * to aid in setting the alarm.
 */
function refresh_textbox()
{
	document.getElementById("timebox").value = eight_hrs_default_text;
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

	// Report next alarm time according to core
	device.getVariable('next_alarm', function(err, data){
		if (err) return alert(err);
	
		//console.log("next_alarm ", data);
		if (data.result == 0){
			document.getElementById("next_alarm").innerHTML = "not set";	
		} else {
			document.getElementById("next_alarm").innerHTML = new Date(data.result*1000);
		}
	});
	
	device.getVariable('epoch_time', function(err,data) {
		// Prepare and display default textbox value of 8 hrs from now.
		var millis_eight_fromnow = (data.result + (60*60*8)) * 1000;
		var eight_hrs_from_now = new Date(millis_eight_fromnow);
		eight_hrs_default_text = add_leading_zero(eight_hrs_from_now.getHours()) + ":" + add_leading_zero(eight_hrs_from_now.getMinutes());
		// Display current date and time:
		if (err) return alert(err);
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
		//document.getElementById("year").innerHTML = epoch_time.getFullYear();
		document.getElementById("hours").innerHTML = add_leading_zero(epoch_time.getHours());
		document.getElementById("minutes").innerHTML = add_leading_zero(epoch_time.getMinutes());

	});	
}, 1000);

function add_leading_zero(two_digit_num) {
	return ("0" + two_digit_num).slice(-2);
}

