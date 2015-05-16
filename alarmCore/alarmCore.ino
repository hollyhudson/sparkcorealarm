/** \file
 * Demo 2:
 * Expose a function that allows the user to turn the LED on or off
 * and a variable with the current value.
 */

static const int LED_1 = D7; // onboard LED
static const int LED_2 = D0; // external LED
static const int LED_3 = D1; // external LED
static int led_state1 = 0;
static int led_state2 = 0;
static int led_state3 = 0;

// set_led() both sets the LED, and returns what it has been set to.
// format of command is led_num and ON or OFF.  Examples:  1ON  2OFF 3OFF  
static int
set_led(
	String command
)
{
	int led_name;
	
	if (command.startsWith("1")) // which LED
	{
		led_name = LED_1; 
	} else if (command.startsWith("2"))
	{
		led_name = LED_2; 
	} else if (command.startsWith("3"))
	{
		led_name = LED_3; 
	}
	
	if (command.endsWith("F"))  // OFF
	{
		// digitalWrite() and digitalRead() are defined in the 
		// SparkCore docs on their site
		digitalWrite(led_name, 0);
		return 0;
	} else
	if (command.endsWith("N")) // ON
	{
		digitalWrite(led_name, 1);
		return 1;
	} else {
		return -1;
	}
}


/*
 * Variables and functions can be "exposed" through the Spark Cloud
 * so that you can call them with GET:
 * 	GET /v1/devices/{DEVICE_ID}/{VARIABLE}
 * and POST:
 * 	POST device/{FUNCTION}
 */
void setup()
{
	pinMode(LED_1, OUTPUT);
	pinMode(LED_2, OUTPUT);
	pinMode(LED_3, OUTPUT);
	Spark.variable("led_state1", &led_state1, INT);
	Spark.variable("led_state2", &led_state2, INT);
	Spark.variable("led_state3", &led_state3, INT);
	Spark.function("set_led", set_led);
}


void loop()
{
	// each time through the loop, get the current
	// state of the LED (on or off)
	led_state1 = digitalRead(LED_1);
	led_state2 = digitalRead(LED_2);
	led_state3 = digitalRead(LED_3);
}
