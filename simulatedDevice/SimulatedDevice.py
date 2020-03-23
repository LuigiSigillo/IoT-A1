import random
import time
import json
import os.path
from azure.iot.device import IoTHubDeviceClient, Message
import sys
# The device connection string to authenticate the device with your IoT hub.
# Using the Azure CLI:
# az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
def read_properties():
     with open(os.path.dirname(__file__) + '/../properties.json') as json_file: 
        data = json.load(json_file)
        return data['deviceConnectionStrings']

connection_strings = read_properties()
# Define the JSON message to send to IoT Hub.
TEMPERATURE = 10.0
HUMIDITY = 50
WIND_DIR = 180
WIND_DIR = 50
RAIN_HEIGHT = 25
MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity}, "wind_direction":{wind_direction}, "wind_intensity":{wind_intensity}, "rain_height":{rain_height} }}'

def iothub_client_init(x):
    # Create an IoT Hub client
    client = IoTHubDeviceClient.create_from_connection_string(connection_strings[int(x)])
    return client

def iothub_client_telemetry_sample_run(x):

    try:
        client = iothub_client_init(x)
        print ( "IoT Hub device sending periodic messages, press Ctrl-C to exit" )
        while True:
            # Build the message with simulated telemetry values.
            temperature = TEMPERATURE + round(random.random() * 15,2)
            humidity = HUMIDITY + round(random.random() * 20,2)
            wind_dir = WIND_DIR + round(random.random() * 15,2)
            wind_int = WIND_DIR + round(random.random() * 20,2)
            rain_height = RAIN_HEIGHT + round(random.random() * 15,2)
            msg_txt_formatted = MSG_TXT.format(temperature=temperature, humidity=humidity, wind_direction=wind_dir, wind_intensity=wind_int, rain_height=rain_height)
            message = Message(msg_txt_formatted)

            # Add a custom application property to the message.
            # An IoT hub can filter on these properties without access to the message body.
            if temperature > 30:
              message.custom_properties["temperatureAlert"] = "true"
            else:
              message.custom_properties["temperatureAlert"] = "false"

            # Send the message.
            print( "Sending message: {}".format(message) )
            client.send_message(message)
            print ( "Message successfully sent" )
            time.sleep(3)

    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    print ( "Simulated device" )
    print ( "Press Ctrl-C to exit" )
    
    iothub_client_telemetry_sample_run(sys.argv[1])