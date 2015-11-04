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

#include "neopixel.h"

// A0 is pin 10 on the spark core
#define PIXEL_PIN 		A0
#define PIXEL_COUNT 	16
#define PIXEL_TYPE 		WS2812B

Adafruit_NeoPixel strip = Adafruit_NeoPixel(
	PIXEL_COUNT,
	PIXEL_PIN,
	PIXEL_TYPE
);

static const int LED = D7; // the onboard blue LED
static char time_str[32];
static char placeholder_variable[32];
static int current_epoch_time;
static int alarm_time = 0;
static int begin_sequence = 0;
static boolean alarm_is_set = false;
static const int LED_1 = D0;
static const int LED_2 = D1;

// These values will ramp up the LEDs at the correct rate,
// to look linear to human eyes.
static const int lookup[] = { 1, 1, 2, 3, 4, 5, 6, 8, 9, 10, 12,
	14, 16, 18 , 20, 22, 25, 28, 30, 33, 36, 39, 42, 46, 49,
	52, 56, 60, 64, 68, 72, 76, 81, 86,90, 95, 100, 105, 110,
	116, 121, 126, 132, 138, 144, 150, 156, 162,169, 176, 182,
	189, 196, 203, 210, 218, 225, 232, 240, 248, 255};

#define ONE_DAY_MILLIS (24*60*60*1000)

/******** implement later ***********
// Turn the lamp on
void turn_lamp_on(void)
{
	DDRC |= 2;
	PORTC |= 2;
	lamp_state = 1;
}


static void ramp_up(void)
{
	
}
************************************/

// All lights full on
void brightest_lights(void)
{
	for(int i = 0; i < PIXEL_COUNT; i++)
	{
		strip.setPixelColor(i, 255, 255, 255);
	}
	strip.show();
	
	//turn_lamp_on();	
}

int set_alarm( String incoming_time ) 
{
	Serial.print("in set_alarm");
	// format for alarm_time is 11:45 => 1446396300
	alarm_time = incoming_time.toInt();		
	begin_sequence = alarm_time - 60; // 60 sec before alarm_time
	Serial.print("alarm_time: ");
	Serial.println(alarm_time);
	Serial.print("begin_sequence: ");
	Serial.println(begin_sequence);
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
	// initialize LED strip
	strip.begin();

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
	brightest_lights();	

	static uint32_t last_sync; // static = holds value btwn fx calls
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
	
