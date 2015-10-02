/** \file
 * Keep track of the time on a Spark Core, and report the time on a webpage.
 */

/* To expose a variable (so that it can be accessed with GET and POST
 * Spark.variable("exposed_name", &local_name, TYPE);
 * Spark.function("exposed_name", local_name);
 */

/*  Question:
 * The documentation says to use unsigned long, not int, so:
 * unsigned long time = millis();
 * https://docs.particle.io/reference/firmware/photon/#time
 */

static const int LED = D7; // the onboard blue LED
static char time_str[32];
static char placeholder_variable[32];
static int current_epoch_time;
static int alarm_time = 0;
static boolean alarm_is_set = false;
static const int LED_1 = D0;
static const int LED_2 = D1;

#define ONE_DAY_MILLIS (24*60*60*1000)

int set_alarm( String incoming_time ) 
{
	Serial.print("in set_alarm");
	alarm_time = incoming_time.toInt();		
	alarm_is_set = true;
	return 1;
}

int cancel_alarm(String placeholder_variable)
{
	alarm_time = 0;
	digitalWrite(LED_1, 0);			
	alarm_is_set = false;
	return 1;
}

void setup()
{
	pinMode(LED, OUTPUT);
	Particle.variable("time", time_str, STRING);
	Particle.variable("epoch_time", &current_epoch_time, INT);
	Particle.variable("next_alarm", &alarm_time, INT);
	Particle.function("set_alarm", set_alarm);
	Particle.function("cancel_alarm", cancel_alarm);
	pinMode(LED_1, OUTPUT);
	pinMode(LED_2, OUTPUT);
	Serial.begin(9600);
}

void loop()
{
	static uint32_t last_sync; // static = don't initialize each time the function is called
	static uint32_t last_update;
	// millis() returns the number of milliseconds since the program started.
	// the value overflows (resets to zero) after 50 days.
	const uint32_t now_millis = millis();

	// If you haven't synced (the time) in a day, do it now.
	if (now_millis - last_sync > ONE_DAY_MILLIS)
	{
		Particle.syncTime();
		last_sync = millis();
		return;
	}
	
	// Once per second update the time string and publish the
	// current data.
	if (now_millis - last_update > 1000)
	{
		last_update = now_millis;
		
		// the exposed variable "time" should now contain the current time:
		//strncpy(time_str, "Hello", sizeof(time_str));
		strncpy(time_str, Time.timeStr(), sizeof(time_str));
		current_epoch_time = Time.now();
		//int difference = alarm_time - current_epoch_time;
		//Serial.print("difference: ");
		//Serial.print(difference);
		//Serial.print("\r\n");
	}

	// check to see if the alarm should go off
	if (current_epoch_time > alarm_time && alarm_is_set) 
	{
		Serial.print("suceeded test if we are past alarm time");
		digitalWrite(LED_1, 1);			
		alarm_is_set = false;	
	}
}
	
