// This class in a Singleton
var DataSending = function() {
	var _sockets = {
		 //uuid : socket
	};

	this.register = function(device_id, socket) {
		// register the socket
		if (typeof socket === 'object') {
			_sockets[device_id] = socket;
		}
	};

	this.know = function(device_id) {
		console.log('hi')
		return (typeof _sockets[device_id] === 'object');

	};

	this.send = function(device_id, sensor_type, sensor_value, id_sensor, callback) {
		console.log('hi send function')
		var MariaSql = require('mariasql');
		this.connection = new MariaSql({
				host : 'localhost',
				user : 'predictableuser',
				password : 'predictable',
				db : 'predictabledata'
		});
		console.log(_sockets)
		console.log(device_id)
		console.log(_sockets[device_id])
		console.log(_sockets[id_sensor])
		this.connection.query("UPDATE sensor SET last_value= :sensor_value WHERE id_sensor = :id_sensor",
								          {sensor_value: sensor_value},
													{id_sensor: id_sensor})
													console.log('hi send function 3')
		if (typeof _sockets[device_id] !== 'object') {
		callback('error socket.io')
		console.log('error socket.io')
	} else{
			console.log('soscket device find')
			_sockets[device_id].emit('sensor-receive', JSON.stringify({
				device_id : device_id,
				sensor_id : '-',
				sensor_type : sensor_type,
				sensor_value : sensor_value
			}));
			console.log('soscket device send')
			callback('done');
		};
	}
	this.test = function() {
		console.log(_sockets);
	};
};

var sender = new DataSending();
module.exports = sender;
