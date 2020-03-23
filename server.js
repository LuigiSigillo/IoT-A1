const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventHubReader = require('./scripts/event-hub-reader.js');
const fs = require('fs');
var loaded = false

const iotHubConnectionString = process.env.IotHubConnectionString;
const eventHubConsumerGroup = process.env.EventHubConsumerGroup;
//const iotHubConnectionString = readData("properties.json").iotHubConnectionString;
//const eventHubConsumerGroup = "test";
// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



var dataToBeVisualized;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    //console.log('received: %s', message);
    //clearInterval(refreshIntervalId);
  });
});



wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        //console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};



server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

(async () => {
  await eventHubReader.startReadMessage((message, date, deviceId) => {
    try {

      const payload = {
        IotData: message,
        MessageDate: date || Date.now().toISOString(),
        DeviceId: deviceId,
      };
      writeData(payload);
      wss.broadcast(JSON.stringify(payload));

    } catch (err) {
      console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
  });
})().catch();



/******functions to handle the persistence */
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}


function writeData(data) {
  var obj;
  if (isEmptyObject(dataToBeVisualized))
    obj = {
      table: []
    };
  else
    obj = JSON.parse(dataToBeVisualized);
  obj.table.push(data);
  var json_string = JSON.stringify(obj);
  fs.writeFileSync('temp.json', json_string);
  dataToBeVisualized = json_string;
}

function readData(filename) {
  data = fs.readFileSync(filename, 'utf8');
  obj = JSON.parse(data); //now it an object
  return obj;
}

function emptyData() {
  var obj = {
    table: []
  }
  var json = JSON.stringify(obj);
  fs.writeFileSync('temp.json', json);
}

/************************************** */


function supportBcast() {
  dataToBeVisualized = fs.readFileSync('temp.json', 'utf8');
  var table;
  if (isEmptyObject(dataToBeVisualized)) {
    table = {
      table: []
    };
  }
  else
    table = JSON.parse(dataToBeVisualized);
  lastHourTable = {
    table: []
  };
  var now = new Date().getTime();

  table['table'].forEach(element => {
    if (element.MessageDate != undefined) {
      var time = new Date(element.MessageDate).getTime();
      if ((now - time) < 3600000)
        lastHourTable.table.push(element);
    }
  });

  //emptyData();
  fs.writeFileSync('temp.json', JSON.stringify(lastHourTable));
  dataToBeVisualized = JSON.stringify(lastHourTable);       //fs.readFileSync('temp.json', 'utf8');

  wss.broadcast(dataToBeVisualized);
  //console.log(wss.clients)
}



refreshIntervalId = setInterval(supportBcast, 5000)
//setInterval(emptyData, 3600000)