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
		console.log('hi send function new')
		this.connection = new Cassandra.Client({
			contactPoints: 'db',
				keyspace: "predictablefarm"
		});

		this.connection.execute("UPDATE sensor SET last_value= ? WHERE id_sensor = ?", {sensor_value: sensor_value , id_sensor: id_sensor}, console.log('hi send function'));
		if (typeof _sockets[device_id] !== 'object') {
		callback('error socket.io')
		console.log('error socket.io')
	} else{
			console.log('socket device find')
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
