// This class in a Singleton
var DataSending = function() {
	var _sockets = {
		// uuid : socket
	};

	this.register = function(device_id, socket) {
		// register the socket
		if (typeof socket === 'object') {
			_sockets[device_id] = socket;
		}
	};

	this.know = function(device_id) {
		return (typeof _sockets[device_id] === 'object');
	};

	this.send = function(device_id, sensor_type, sensor_value) {
		if (typeof _sockets[device_id] !== 'object') {
			return false;
		}

		_sockets[device_id].emit('sensor-receive', JSON.stringify({
			device_id : device_id,
			sensor_id : '-',
			sensor_type : sensor_type,
			sensor_value : sensor_value
		}));
	};

	this.test = function() {
		console.log(_sockets);
	};
};

var sender = new DataSending();
module.exports = sender;