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
//static String time_str;

#define ONE_DAY_MILLIS (24*60*60*1000)

void setup()
{
	pinMode(LED, OUTPUT);
	Spark.variable("time", &time_str, STRING);
}

void loop()
{
	static uint32_t last_sync; // static = don't initialize each time the function is called
	static uint32_t last_update;
	// millis() returns the number of milliseconds since the program started.
	// the value overflows (resets to zero) after 50 days.
	const uint32_t now_millis = millis();

	if (now_millis - last_sync > ONE_DAY_MILLIS)
	{
		Spark.syncTime();
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
	}
}
	
