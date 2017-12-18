// This class in a Singleton
var DataSending = function() {
	var _sockets = {
			// uuid : socket
		};



	this.register = function(device_id, socket) {
		// register the socket

		if (typeof socket === 'object') {
			// console.log('hi register' + socket)
			_sockets[device_id] = socket;
		}
	};

	this.know = function(device_id) {
		// console.log('hi')
		return (typeof _sockets[device_id] === 'object');

	};

	this.send = function(device_id, sensor_type, sensor_value, id_sensor, sensor_mode, server, io, callback) {


		// io.on('connection', function (msg) {
		// 	console.log({
		// 		 device_id : device_id,
		// 		 sensor_id : '-',
		// 		 sensor_type : sensor_type,
		// 		 sensor_value : sensor_value,
		// 		 sensor_mode : "1"
		// 	})

		// io.emit('receive-sensor', function(msg) {
		// 	//console.log(data.device_id + ':' + data.sensor_type + " = "+data.sensor_value);
		//
		// 		msg = {
		// 				 device_id : device_id,
		// 				 sensor_id : '-',
		// 				 sensor_type : sensor_type,
		// 				 sensor_value : sensor_value,
		// 				 sensor_mode : "1"
		// 			};
		//
		// });
		// io.on('receive-sensor', function(msg) {
		// 	//console.log(data.device_id + ':' + data.sensor_type + " = "+data.sensor_value);
		//
		// 		msg = {
		// 				 device_id : device_id,
		// 				 sensor_id : '-',
		// 				 sensor_type : sensor_type,
		// 				 sensor_value : sensor_value,
		// 				 sensor_mode : "1"
		// 			};
		//
		// });

		// console.log(_sockets[device_id])
		_sockets[device_id].emit('sensor-receive',JSON.stringify({
			device_id : device_id,
			sensor_id : '-',
			sensor_type : sensor_type,
			sensor_value : sensor_value,
			sensor_mode :  sensor_mode
		}))



		// })

	}
	this.test = function() {
		// console.log(_sockets);
	};
};

var sender = new DataSending();
module.exports = sender;
