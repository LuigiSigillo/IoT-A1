const express = require('express')
const DBHandler = require("./db/dbhandler.js")
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const dbHandler = new DBHandler();

server.listen(process.env.PORT || '3000', () => {
    console.log('Listening on %d.', server.address().port);
  });

//dbHandler.queryDatabase("SELECT * FROM [dbo].[Accelerometer] WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE())");


wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        console.log("broadcast??")
        if (client.readyState === WebSocket.OPEN) {
            try {
                console.log(`Broadcasting data ${data}`);
                client.send(data);
            } catch (e) {
                console.error(e);
            }
        }
    });
};

function retrieveData() {
    var data = {
        Id: 22,
        x: 3,
        y: 2,
        z: 1,
        IsMoving: false,
        DateOfArrival: "2020-05-12T16:41:50.280Z"
      }
    try {
        const payload = {
            AccData: data,
            MessageDate: data.DateOfArrival || Date.now().toISOString()
        };
        wss.broadcast(JSON.stringify(payload));
        
    } catch (err) {
        console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
}

retrieveData()