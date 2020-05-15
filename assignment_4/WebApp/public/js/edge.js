//make connection to the backend
var socket = io();

var mAccelCurrent = 0
var mAccel = 0;
let status = document.getElementById('status');

function edgeCompute(x, y, z) {
    mAccelLast = mAccelCurrent;
    mAccelCurrent = Math.sqrt(x * x + y * y + z * z);
    delta = mAccelCurrent - mAccelLast;
    mAccel = mAccel * 0.9 + delta;

    // Make this higher or lower according to how much
    // motion you want to detect
    if (mAccel > 2) {
        movement.innerHTML = 'You are moving!'
        socket.emit('accelerometer', { "type": "edge", "ismoving": true })
    }
    else {
        movement.innerHTML = 'You are standing still!';
        socket.emit('accelerometer', { "type": "edge", "ismoving": false })
    }
}

if ('Accelerometer' in window) {
    let sensor = new LinearAccelerationSensor({ frequency: 0.5 });
    sensor.addEventListener('reading', function (e) {
        x = e.target.x
        y = e.target.y
        z = e.target.z
        status.innerHTML = 'x: ' + e.target.x + '<br> y: ' + e.target.y + '<br> z: ' + e.target.z;
        edgeCompute(x, y, z)
    });

    sensor.start();
}
else
    status.innerHTML = 'Accelerometer not supported';



