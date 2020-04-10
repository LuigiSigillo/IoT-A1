/*
 * Copyright (C) 2018 Inria
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     examples
 * @{
 *
 * @file
 * @brief       Example demonstrating the use of LoRaWAN with RIOT
 *
 * @author      Alexandre Abadie <alexandre.abadie@inria.fr>
 *
 * @}
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

#include "msg.h"

#include "fmt.h"



#include "hts221.h"
#include "hts221_params.h"
#include "periph/rtc.h"

#include "net/loramac.h"
#include "semtech_loramac.h"

/* Messages are sent every 20s to respect the duty cycle on each channel */
#define PERIOD              (20U)


#ifndef EMCUTE_ID
#define EMCUTE_ID           ("testing2020")
#endif



semtech_loramac_t loramac;

static hts221_t hts221;
static uint8_t deveui[LORAMAC_DEVEUI_LEN];
static uint8_t appeui[LORAMAC_APPEUI_LEN];
static uint8_t appkey[LORAMAC_APPKEY_LEN];



void generate_payload(char * example) {
    //int temp = rand() % 50 +1;
    //int hum = rand() % 100 +1 ;
    int win_dir = rand() % 360 +1 ;
    int win_int = rand()% 100 +1 ;
    int rain = rand() % 50 +1 ;

    uint16_t humidity = 0;
    int16_t temperature = 0;
    if (hts221_read_humidity(&hts221, &humidity) != HTS221_OK) {
        puts(" -- failed to read humidity!");
    }
    if (hts221_read_temperature(&hts221, &temperature) != HTS221_OK) {
        puts(" -- failed to read temperature!");
    }

    sprintf(example,"{\"humidity\":\"%d\",\"temperature\":\"%d\",\"wind_direction\":\"%d\",\"wind_intensity\":\"%d\",\"rain_height\":\"%d\",\"device_id\":\"%s\"}",humidity%100,temperature%50,win_dir,win_int,rain,EMCUTE_ID);
    
}


static void _send_message(void)
{
    char message[400]; 
    generate_payload(message);
    printf("Sending: %s\n", message);

    /* Try to send the message */
    semtech_loramac_send(&loramac,(uint8_t *)message, strlen(message));
    /*if (ret != SEMTECH_LORAMAC_TX_DONE)  {
        printf("Cannot send message '%s', ret code: %d\n", message, ret);
        return;
    }*/
    //semtech_loramac_recv(&loramac);
}

int main(void)
{
    puts("LoRaWAN Class A low-power application");
    puts("=====================================");

    /* Convert identifiers and application key */
    fmt_hex_bytes(deveui, DEVEUI);
    fmt_hex_bytes(appeui, APPEUI);
    fmt_hex_bytes(appkey, APPKEY);

    /* Initialize the loramac stack */
    semtech_loramac_init(&loramac);
    semtech_loramac_set_deveui(&loramac, deveui);
    semtech_loramac_set_appeui(&loramac, appeui);
    semtech_loramac_set_appkey(&loramac, appkey);

    /* Use a fast datarate, e.g. BW125/SF7 in EU868 */
    semtech_loramac_set_dr(&loramac, LORAMAC_DR_5);

    /* Real sensors */
    if (hts221_init(&hts221, &hts221_params[0]) != HTS221_OK) {
        puts("Sensor initialization failed");
        LED3_TOGGLE;
        return 1;
    }
    if (hts221_power_on(&hts221) != HTS221_OK) {
        puts("Sensor initialization power on failed");
        LED3_TOGGLE;
        return 1;
    }
    if (hts221_set_rate(&hts221, hts221.p.rate) != HTS221_OK) {
        puts("Sensor continuous mode setup failed");
        LED3_TOGGLE;
        return 1;
    }


    /* Start the Over-The-Air Activation (OTAA) procedure to retrieve the
     * generated device address and to get the network and application session
     * keys.
     */
    puts("Starting join procedure");
    if (semtech_loramac_join(&loramac, LORAMAC_JOIN_OTAA) != SEMTECH_LORAMAC_JOIN_SUCCEEDED) {
        puts("Join procedure failed");
        return 1;
    }
    puts("Join procedure succeeded");


    /* trigger the send */
    while (1) {
        _send_message();
        puts("sleeping\n");
        xtimer_sleep(10);
        puts("slept!\n");
    }
    return 0;
}
