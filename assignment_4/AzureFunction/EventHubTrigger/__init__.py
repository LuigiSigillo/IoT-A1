import logging
import pyodbc
import datetime
import azure.functions as func
import math
import json 

def main(event: func.EventHubEvent):
    logging.info('Python EventHub trigger processed an event: %s', event.get_body().decode('utf-8'))
    log_list = json.loads(event.get_body().decode('utf-8')) 
    single_log = log_list[0]
    #if edge
    try:
        if single_log['data']["type"] == "edge":
            insert_row(single_log['data']['ismoving'], False)
    #else is a list
    except:
        current = single_log['data'][0]
        last = single_log['data'][1]
        insert_row(is_moving(last,current), True, current["x"], current["y"], current["z"])
        

def calculate_acc(x,y,z):
    return math.sqrt(x * x + y * y + z * z)

def is_moving(last, current):
    mAccel = 0
    mAccelLast = calculate_acc(last["x"], last["y"], last["z"])
    mAccelCurrent = calculate_acc(current["x"], current["y"], current["z"])
    delta = mAccelCurrent - mAccelLast
    mAccel = mAccel * 0.9 + delta
    if (mAccel > 2):
        return 1
    else:
        return 0
        
def connect_to_db():
    server = 'webappacc.database.windows.net'
    database = 'webapp'
    username = 'luigi'
    password = ''
    driver= '{ODBC Driver 17 for SQL Server}'
    logging.info("tryng to coonnect")
    cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)
    logging.info("connected")
    return cnxn

def insert_row(is_moving,is_cloud,x=0,y=0,z=0):
    conn = connect_to_db()
    cursor = conn.cursor()
    if is_moving == "true" or is_moving == True:
        is_moving = 1
    else:
        is_moving = 0

    if not is_cloud:
        insert_string = "INSERT INTO dbo.EdgeComputingAcceloremeter (IsMoving, DateOfArrival) OUTPUT INSERTED.Id VALUES (?, CURRENT_TIMESTAMP);"
        cursor.execute(insert_string, is_moving)
    else:
        insert_string = "INSERT INTO dbo.Accelerometer (x, y, z, IsMoving, DateOfArrival) OUTPUT INSERTED.Id VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);"
        cursor.execute(insert_string, x, y, z, is_moving)
    try:
        conn.commit()
    except e:
        logging.info("error", e)
    logging.info("row successfully added")
    conn.close()





