
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // update and create rows of the table
  function row(id, date, iotData) {
    var arg = [];
    var names = ["hum", "temp", "windD", "windI", "rain"];
    arg.push(iotData.humidity);
    arg.push(iotData.temperature);
    arg.push(iotData.wind_direction);
    arg.push(iotData.wind_intensity);
    arg.push(iotData.rain_height);
    console.log(iotData);
    var index = id.substr(id.length - 1);
    if (index == "e")
      index = 1;

    // update last hour of device
    var myTable = document.getElementById("Stats" + index);
    // insert new row. 
    var newRow = myTable.insertRow(1);
    newRow.insertCell(0).innerHTML = id;
    newRow.insertCell(1).innerHTML = date;
    for (var i = 0; i < 5; i++) {
      newRow.insertCell(i + 2).innerHTML = arg[i].toFixed(2);
    }


    // update last hour of sensor
    var i = 0;
    names.forEach(element => {
      var myTable = document.getElementById(element+ "History");
      
      // insert new row. 
      var newRow = myTable.insertRow(1);
      newRow.insertCell(0).innerHTML = id;
      newRow.insertCell(1).innerHTML = date;
      newRow.insertCell(2).innerHTML = arg[i].toFixed(2);
      i++;
    });
    var n = $(".card").css("height");
    x = Number(n.substring(0,3))
    $('.card').css("height" , x+14+"px");
  }


  //  update the latest value tile
  function updateLatestValue(index, messageData) {
    if (index == "e")
      index = 1;

    document.getElementById("temp" + index).innerHTML = "Temperature:" + messageData.IotData.temperature.toFixed(2) + " ºC";
    document.getElementById("hum" + index).innerHTML = "Humidity:" + messageData.IotData.humidity.toFixed(2) + "%";
    document.getElementById("windd" + index).innerHTML = "Wind direction:" + messageData.IotData.wind_direction.toFixed(2) + " degrees";
    document.getElementById("windi" + index).innerHTML = "Wind intensity:" + messageData.IotData.wind_intensity.toFixed(2) + " m/s";
    document.getElementById("rain" + index).innerHTML = "Rain height:" + messageData.IotData.rain_height.toFixed(2) + " mm/h";
  }

  // Find or create a cached device to hold the telemetry data
  function findOrCreateData(messageData) {
    var index = messageData.DeviceId.substr(messageData.DeviceId.length - 1);
    row(messageData.DeviceId, messageData.MessageDate, messageData.IotData);
    updateLatestValue(index, messageData);

  }

  var received = false;
  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  webSocket.onmessage = function onMessage(message) {
    try {

      if (message.data.startsWith('{"IotData"')) {
        const messageData = JSON.parse(message.data);
        //console.log(messageData);
        findOrCreateData(messageData)
      }
      else {
        if (!received) {
          const messageData = JSON.parse(message.data);
          messageData['table'].forEach(element => {
            findOrCreateData(element)
          });
          received = true;
          webSocket.send(JSON.stringify({
            id: "client1"
          }));
        }
        else
          webSocket.send('hello from the client!');

      }
    } catch (err) {
      console.error(err);
    }
  };
  /*
    setInterval(function () {
      reload(trackedDevices)
      $("div1").load(window.location.href + "div1");
      console.log("funzina?")
  }, 2000);
  */
});

function reload(dev) {
  console.log(typeof (dev))
  dev.forEach(element => {
    findOrCreateData(element)
  });
}