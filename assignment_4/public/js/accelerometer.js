//make connection to the backend
var socket = io();

var isCloud = true

var mAccelCurrent = 0
var mAccel = 0;
let status = document.getElementById('status');
var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
var buffer = []

function cloudCompute(buf) {
  socket.emit('accelerometer', buf)
}


if ('Accelerometer' in window) {
  let sensor = new LinearAccelerationSensor({ frequency: 0.5 });
  sensor.addEventListener('reading', function (e) {
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    x = e.target.x
    y = e.target.y
    z = e.target.z
    status.innerHTML = 'x: ' + e.target.x + '<br> y: ' + e.target.y + '<br> z: ' + e.target.z;
    if (!isCloud) {
      mAccelLast = mAccelCurrent;
      mAccelCurrent = Math.sqrt(x * x + y * y + z * z);
      delta = mAccelCurrent - mAccelLast;
      mAccel = mAccel * 0.9 + delta;
      
      // Make this higher or lower according to how much
      // motion you want to detect
      if (mAccel > 2) {
        movement.innerHTML = 'You are moving!'
        socket.emit('accelerometer', { ismoving: true })
      }
      else {
        movement.innerHTML = 'You are still';
        socket.emit('accelerometer', { ismoving: false })
      }
    }
    else {
      buffer.push({
        "x": x,
        "y": y,
        "z": z
      })
    }
    if (buffer.length > 1) {
      cloudCompute(buffer)
      buffer = []
    }
  });


  sensor.start();
}
else
  status.innerHTML = 'Accelerometer not supported';


