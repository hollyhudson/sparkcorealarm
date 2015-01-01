/*************************************
 * Sunrise Alarm Clock for Spark Core
 * by Holly Hudson
 * Thanks to the following for help
 * and/or their posted example code:
 * Trammell Hudson
 * Peter Chaivre
**************************************/


// This #include statement was automatically added by the Spark IDE.
#include "SparkTime.h"

UDP UDPClient;
SparkTime rtc;

unsigned long currentTime;
char time_str[64];
int ledY = D0;
int ledX = D1;
int pinStates[2] = {0,0};

void setup() {
    Spark.function("led", ledControl);
    Spark.variable("time", &time_str, STRING);
    Spark.variable("states", &pinStates, INT);
    pinMode(ledX, OUTPUT);
    pinMode(ledY, OUTPUT);
    
    // initialize both LEDs to off
    digitalWrite(ledX, LOW);
    digitalWrite(ledY, LOW);
    // let's track the state of the pins
    // so that we can use one button to toggle them
    //pinStates = {0,0};
    
    rtc.begin(&UDPClient, "north-america.pool.ntp.org");
    rtc.setTimeZone(-5); // gmt offset
}

void loop() {
    currentTime = rtc.now();
    String now = rtc.ISODateString(currentTime);
    now.toCharArray(time_str, sizeof(time_str));
    
    // Ensures a timestamp has been returned
    // rather than the year. (There's a bug?)
    if (currentTime < 9999) return;
}

int ledControl(String command)
{
    int state = 0;
    
    // find out the pin number and convert ascii to integer
    int pinNumber = (command.charAt(1) - '0') - 1;
    
    // sanity check to see if pin numbers are within range
    if (pinNumber == 0)
      pinNumber = ledX;
    else
    if (pinNumber == 1)
      pinNumber = ledY;
    else
      return -1;
    
    // find out the state of the LED
    // substring(start, end) where start and end refer to the start
    // and end of the part of the string you want to examine
    // Full command is l1,HIGH or l2,LOW
    if (command.substring(3,7) == "HIGH") state = 1;
    else if (command.substring(3,6) == "LOW") state = 0;
    else return -1;
    
    // Write to the appropriate pin
    digitalWrite(pinNumber, state);
    // record new state for pin
    // pinStates[pinNumer] = state;
    return 1;
    
}


