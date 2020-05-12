
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // update and create rows of the table
  function row(date, iotData) {
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

/*
    // update last hour of sensor
    var i = 0;
    names.forEach(element => {
      var myTable = document.getElementById(element + "History");

      // insert new row. 
      var newRow = myTable.insertRow(1);
      newRow.insertCell(0).innerHTML = id;
      newRow.insertCell(1).innerHTML = date;
      try {
        arg[i].toFixed(2);
        newRow.insertCell(2).innerHTML = arg[i].toFixed(2);
      }
      catch (err) {
        newRow.insertCell(2).innerHTML = arg[i];
      }
      i++;
    });
    var n = $(".card").css("height");
    x = Number(n.substring(0, 3))
    $('.card').css("height", x + 25 + "px");
    */
  }


  //  update the latest value tile
  function updateLatestValue(messageData) {
      document.getElementById("x1").innerHTML = "x: " + messageData.AccData.x.toFixed(2);
      document.getElementById("y1").innerHTML = "y: " + messageData.AccData.y.toFixed(2) ;
      document.getElementById("z1").innerHTML = "z: " + messageData.AccData.z.toFixed(2) ;
      document.getElementById("ismoving1").innerHTML = "Is moving ? " + messageData.AccData.IsMoving;
      document.getElementById("timestamp1").innerHTML = "TimeStamp: " + messageData.MessageDate;
  }
  


  function findOrCreateData(messageData) {
    if (messageData.AccData.IsMoving == "1")
      messageData.AccData.IsMoving = "Yes"
    else 
      messageData.AccData.IsMoving = "No"
    row(messageData.MessageDate, messageData.AccData);
    updateLatestValue(messageData);

  }

  webSocket.onmessage = function onMessage(message) {
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
  };

  function test() {
    var data = {
      Id: 22,
      x: 3,
      y: 2,
      z: 1,
      IsMoving: 0,
      DateOfArrival: "2020-05-12T16:41:50.280Z"
    }
    var payload = {
      AccData: data,
      MessageDate: data.DateOfArrival || Date.now().toISOString()
  };
    findOrCreateData(payload)
  }
  
  test()


});

function reload(dev) {
  console.log(typeof (dev))
  dev.forEach(element => {
    findOrCreateData(element)
  });
}

