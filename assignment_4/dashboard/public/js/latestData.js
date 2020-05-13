
// update and create rows of the table
function row(date, iotData, isCloud) {
  if (isCloud) {
    var arg = [];
    var names = ["x", "y", "z", "ismov"];
    arg.push(iotData.x);
    arg.push(iotData.y);
    arg.push(iotData.z);
    arg.push(iotData.IsMoving);
    // update last hour of device
    var myTable = document.getElementById("Stats1");
    // insert new row. 
    var newRow = myTable.insertRow(1);
    newRow.insertCell(0).innerHTML = date;
    for (var i = 0; i < 4; i++) {
      try {
        arg[i].toFixed(2);
        newRow.insertCell(i + 1).innerHTML = arg[i].toFixed(2);
      }
      catch (err) {
        newRow.insertCell(i + 1).innerHTML = arg[i];
      }
    }
  }

  else {
       // update last hour of device
       var myTable = document.getElementById("Stats2");
       // insert new row. 
       var newRow = myTable.insertRow(1);
       newRow.insertCell(0).innerHTML = date;
       newRow.insertCell(1).innerHTML = iotData.IsMoving;
  }
}


//  update the latest value tile
function updateLatestValue(messageData, isCloud) {
  if (isCloud) {

  
  document.getElementById("x1").innerHTML = "x: " + messageData.AccData.x.toFixed(2);
  document.getElementById("y1").innerHTML = "y: " + messageData.AccData.y.toFixed(2);
  document.getElementById("z1").innerHTML = "z: " + messageData.AccData.z.toFixed(2);
  document.getElementById("ismoving1").innerHTML = "Is moving ? " + messageData.AccData.IsMoving;
  document.getElementById("timestamp1").innerHTML = "TimeStamp: " + messageData.MessageDate;
}
else {
  if ( messageData.AccData.IsMoving == "Yes")
    var str = "He or She is currently moving";
  else 
    var str = "He or She is standing still" 
  document.getElementById("ismoving2").innerHTML = str
  document.getElementById("timestamp2").innerHTML = "TimeStamp: " + messageData.MessageDate;
}
}

function findOrCreateData(messageData,isCloud) {
  if (messageData.AccData.IsMoving == true)
    messageData.AccData.IsMoving = "Yes"
  else
    messageData.AccData.IsMoving = "No"
  row(messageData.MessageDate, messageData.AccData, isCloud);
  updateLatestValue(messageData, isCloud);

}

/*   webSocket.onmessage = function onMessage(message) {
    console.log("START")
    try {
        const messageData = JSON.parse(message.data);
        console.log(messageData);
        messageData['list'].forEach(element => {
          findOrCreateData(element)
        });

    } catch (err) {
      console.error(err);
    }
  }; */

var socket = io();
var idListEdge = []
var idListCloud = []
console.log('connection made')
socket.on('last values', function (msg) {
  console.log(msg);
});

socket.on('database values cloud=true', function (data) {
  if (!idListCloud.includes(data.Id)) {
    idListCloud.push(data.Id)
    var payload = {
      AccData: data,
      MessageDate: data.DateOfArrival || Date.now().toISOString()
    };
    findOrCreateData(payload, true)
    console.log(data);
  }
  else
    socket.emit('msgs received', { "stopCloud":  idListCloud[idListCloud.length -1]});

});

socket.on('database values cloud=false', function (data) {
  if (!idListEdge.includes(data.Id)) {
    idListEdge.push(data.Id)
    var payload = {
      AccData: data,
      MessageDate: data.DateOfArrival || Date.now().toISOString()
    };
    findOrCreateData(payload, false)
    console.log(data)
  }
  else
    socket.emit('msgs received', { "stopEdge": idListEdge[idListEdge.length -1] });

});

//test()

function reload(dev) {
  console.log(typeof (dev))
  dev.forEach(element => {
    findOrCreateData(element)
  });
}

