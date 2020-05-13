//make connection to the backend
var socket = io();

var isCloud;
var mAccelCurrent = 0
var mAccel = 0;
let status = document.getElementById('status');
var buffer = []


if ('Accelerometer' in window) {
  let sensor = new LinearAccelerationSensor({ frequency: 0.5 });
  sensor.addEventListener('reading', function (e) {
    x = e.target.x
    y = e.target.y
    z = e.target.z
    status.innerHTML = 'x: ' + e.target.x + '<br> y: ' + e.target.y + '<br> z: ' + e.target.z;
    buffer.push({ "type": "cloud", "x": x, "y": y, "z": z })

    if (buffer.length > 1) {
      socket.emit('accelerometer', buffer)
      buffer = []
    }
  });
  sensor.start();
}
else
  status.innerHTML = 'Accelerometer not supported';
