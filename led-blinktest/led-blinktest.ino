/** \file
 * Expose a function that allows the user to turn the LED on or off
 * and a variable with the current value.
 */

static const int LED_onboard = D7; // onboard LED
static const int LED_0 = D0; // external LED
static const int LED_1 = D1; // external LED
static int led_state_onboard = 0;
static int led_state_0 = 0;
static int led_state_1 = 0;

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
		led_name = LED_onboard; 
	} else if (command.startsWith("2"))
	{
		led_name = LED_0; 
	} else if (command.startsWith("3"))
	{
		led_name = LED_1; 
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
	pinMode(LED_onboard, OUTPUT);
	pinMode(LED_0, OUTPUT);
	pinMode(LED_1, OUTPUT);
	Spark.variable("led_state_onboard", &led_state_onboard, INT);
	Spark.variable("led_state_0", &led_state_0, INT);
	Spark.variable("led_state_1", &led_state_1, INT);
	Spark.function("set_led", set_led);
}


void loop()
{
	// each time through the loop, get the current
	// state of the LED (on or off)
	led_state_onboard = digitalRead(LED_onboard);
	led_state_0 = digitalRead(LED_0);
	led_state_1 = digitalRead(LED_1);
}
