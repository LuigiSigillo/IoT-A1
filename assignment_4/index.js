const express = require('express');
const socket = require('socket.io');
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;
var fs = require('fs')
var http = require("http")
var https = require("https")

const app = express();

var httpsOptions = {
    key: fs.readFileSync('conf/key.pem'),
    cert: fs.readFileSync('conf/cert.pem'),
    ca: fs.readFileSync('conf/ca-cert.pem')
};

//static resources
app.use(express.static('public'));

//IoT hub Connection
var connectionString = "";
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// //create a server
// var server = app.listen(3000, function(){
//     console.log('server is listening on port',3000)
// })

//http.createServer(app).listen(8888);
var server = https.createServer(httpsOptions, app).listen(4433);

var io = socket(server);

io.on('connection', function(socket){
    console.log('made socket connection');

    socket.on('accelerometer', function(data){
        var message = new Message(JSON.stringify({data}));
        console.log('Sending message: ' + message.getData());

        // Send the message.
    client.sendEvent(message, function (err) {
        if (err) {
        console.error('send error: ' + err.toString());
        } else {
        console.log('message sent');
        }
    });
    })
});