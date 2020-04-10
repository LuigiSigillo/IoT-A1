import time
import ttn
import base64
import os
from azure.iot.device import IoTHubDeviceClient, Message

def read_properties(property_name):
     with open(os.path.dirname(__file__) + '/../properties.json') as json_file: 
        data = json.load(json_file)
        return data[property_name]


DEVICE_NAME = "mqtt-broker"
CONNECTION_STRING = read_properties("deviceConnectionStrings")[2]
APP_ID_TTN = "test_tutorial_iot"
ACCES_KEY_TTN = read_properties("accessKeyTTN")
x = 0


def uplink_callback(msg, client):
  print("Received uplink from ", msg.dev_id)
  payload = base64.b64decode(msg.payload_raw).decode()
  try:
    azure_client.send_message(Message(payload))
    print (payload,"\n successfully sent")
  except e:
    print("error ",e," sending message:\n",payload)


handler = ttn.HandlerClient(APP_ID_TTN, ACCES_KEY_TTN)

# using mqtt client
mqtt_client = handler.data()
mqtt_client.set_uplink_callback(uplink_callback)
mqtt_client.connect()
azure_client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)

while(True):
    #dummy operation to cycle
    x = x+1