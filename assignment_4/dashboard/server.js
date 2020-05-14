const express = require('express')
const DBHandler = require("./db/dbhandler.js")
const socket = require('socket.io');
const bodyParser = require('body-parser');


// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var server = app.listen(process.env.PORT || '3000', () => {
    console.log('Listening on %d.', server.address().port);
});

var dbHandler = new DBHandler()

var io = socket(server)


io.on('connection', function (socket) {
    console.log('made socket connection');
    var lastEdge = 0;
    var lastCloud = 0;

    // update the first values retrived by DBs
    var refreshIntervalId = setInterval(function () {
        //dbHandler.read("SELECT * FROM [dbo].[Accelerometer] WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE())", socket, true);
        dbHandler.read("SELECT * FROM [dbo].[EdgeComputingAcceloremeter] WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE())", socket, false); // WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE())
    }, 5000);


    // Updates in real time
    var refreshIntervalId2 = setInterval(function () {
        if (lastCloud >= 0)
            dbHandler.read("SELECT * FROM [dbo].[Accelerometer] WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE()) AND Id>" + lastCloud, socket, true);
        if (lastEdge >= 0)
            dbHandler.read("SELECT * FROM [dbo].[EdgeComputingAcceloremeter] WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE()) AND Id>" + lastEdge, socket, false); // WHERE DateOfArrival > DATEADD(HOUR, -1, GETDATE())
    }, 10000);

    socket.on("last id", function (data) {
        if ("stopEdge" in data)
            lastEdge = data.stop;
        else
            lastCloud = data.stop;
    })

});



//retrieveData()