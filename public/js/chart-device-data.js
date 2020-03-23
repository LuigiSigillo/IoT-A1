
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);
  var received = false;
  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
      this.windDirData = new Array(this.maxLen);
      this.windIntData = new Array(this.maxLen);
      this.RainData = new Array(this.maxLen);
    }

    addData(time, temperature, humidity, windd, windi, rain) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);
      this.windDirData.push(windd);
      this.windIntData.push(windi);
      this.RainData.push(rain);


      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
        this.windDirData.shift();
        this.windIntData.shift();
        this.RainData.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      }
    ]
  };

  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'right',
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.temperatureData;
    chartData.datasets[1].data = device.humidityData;
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);


  function row(id, date, iotData) {
    arg = []
    arg.push(iotData.humidity);
    arg.push(iotData.temperature);
    arg.push(iotData.wind_direction);
    arg.push(iotData.wind_intensity);
    arg.push(iotData.rain_height);
    console.log(iotData);
    var index = id.substr(id.length - 1);
    if (index == "e")
      index = 1;
    var myTable = document.getElementById("Stats" + index);
    // insert new row. 
    var newRow = myTable.insertRow(1);
    newRow.insertCell(0).innerHTML = id;
    newRow.insertCell(1).innerHTML = date;
    for (var i = 0; i < 5; i++) {
      newRow.insertCell(i + 2).innerHTML = arg[i].toFixed(2);
    }

  }

  function updateLatestValue(index,messageData) {
    if (index == "e")
      index = 1;

    document.getElementById("temp" + index).innerHTML = "Temperature:" + messageData.IotData.temperature.toFixed(2) + " ºC";
    document.getElementById("hum" + index).innerHTML = "Humidity:" + messageData.IotData.humidity.toFixed(2) + "%";
    document.getElementById("windd" + index).innerHTML = "Wind direction:" + messageData.IotData.wind_direction.toFixed(2) + " degrees";
    document.getElementById("windi" + index).innerHTML = "Wind intensity:" + messageData.IotData.wind_intensity.toFixed(2) + " m/s";
    document.getElementById("rain" + index).innerHTML = "Rain height:" + messageData.IotData.rain_height.toFixed(2) + " mm/h";
  }

  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  function findOrCreateData(messageData) {
    // find or add device to list of tracked devices
    const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);
    var index = messageData.DeviceId.substr(messageData.DeviceId.length - 1);
    if (existingDeviceData) {
      existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity);
      row(messageData.DeviceId, messageData.MessageDate, messageData.IotData);
      updateLatestValue(index,messageData);
    }
    else {
      const newDeviceData = new DeviceData(messageData.DeviceId);
      trackedDevices.devices.push(newDeviceData);
      const numDevices = trackedDevices.getDevicesCount();
      deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
      newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity);
      row(messageData.DeviceId, messageData.MessageDate, messageData.IotData);
      updateLatestValue(index,messageData);
      // add device to the UI list
      const node = document.createElement('option');
      const nodeText = document.createTextNode(messageData.DeviceId);
      node.appendChild(nodeText);
      listOfDevices.appendChild(node);

      // if this is the first device being discovered, auto-select it
      if (needsAutoSelect) {
        needsAutoSelect = false;
        listOfDevices.selectedIndex = 0;
        OnSelectionChange();
      }
    }
    myLineChart.update();
  }


  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  webSocket.onmessage = function onMessage(message) {
    try {

      if (message.data.startsWith('{"IotData"')) {
        const messageData = JSON.parse(message.data);
        console.log(messageData);
        // time and either temperature or humidity are required
        if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
          return;
        }
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
          webSocket.send('hello from the client! dall else');

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