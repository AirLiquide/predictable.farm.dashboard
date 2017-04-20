var DataReception = require('../DataReception.js');
var dataReceiver = new DataReception();

var dataSender = require('../DataSending.js');

// WebSocket communications
module.exports = function (socket) {
	socket.on('hello', function() {
		console.log('Client connected : ' + socket.handshake.address);
		socket.emit('init', {});
	});

	socket.on('sensor-emit', function(data) {
		//console.log(data.device_id + ':' + data.sensor_type + " = "+data.sensor_value);
		if (typeof data !== 'object') {
			if (data.length < 50) {
				return;
			}

			data = JSON.parse(data);
		}

		if (typeof data.device_id === 'undefined') {
			return;
		}

		// register the probe's uuid
		dataSender.register(data.device_id, socket);

		// saves the data in db
		dataReceiver.processData(data);

		// broadcast the data to all clients
		socket.broadcast.emit('data-update', data);
	});
};
