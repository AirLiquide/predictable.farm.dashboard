var DbTable = require('./DbTable');

module.exports = function() {
	var self = this;

	var dbZone =  new DbTable('zone', true);
	var dbProbe = new DbTable('probe', true);
	var dbSensor = new DbTable('sensor', true);

	var zoneCache = []; // request cache
	var zoneTime = -1; // timestamp of the request
	var zoneLife = 10000; // lifetime of the data

	var probeCache = [];
	var probeTime = -1;
	var probeLife = 10000;

	var sensorCache = [];
	var sensorTime = -1;
	var sensorLife = 10000;

	var getCurrentTimestamp = function() {
		console.log(Math.floor(Date.now()/1000))
		console.log(Date.now())
		return Math.floor(Date.now()/1000);
	};

	var indexById = function(rows, identifier) {
		// console.log('result: ' + rows + identifier)
		var result = {};
		for (var i=0; i < rows.length; i++) {
			// console.log('on result loop')
			result[rows[i][identifier]] = rows[i];
		}
		// console.log('retun result ' + result)
		return result;
	};


	// TODO Get values from the database
	this.get = function() {
		result = {};
		result.zones = zoneCache;
		result.probes = probeCache;
		result.sensors = sensorCache;

		return result;
	};
	var t = this;
	this.loadZones = function() {
		dbZone.select({
			table : "zone",
			callback : function(err, result) {
				// For each zone we parse the 'dashboards' field which contains JSON
				// console.log('hi load zone');
				// console.log('result 55' + result);
				if (result){
					// console.log('we have result !');
					for (var i=0; i < result.length; i++) {
						// console.log('result nb: ' + i);
						result[i].dashboards = JSON.parse(result[i].dashboards);
					}
				} else {
					// console.log('loadzone needed');
					t.loadZones();
				}
				// console.log('hi result :' + result);
				if (result){
				zoneCache = indexById(result.rows, 'id_zone');
			} else {zoneCache  = []}
				zoneTime = Date.now();
				// console.log(zoneTime)
			}
		});
	};

	this.loadProbes = function() {
		// console.log('hi load probe');

		dbProbe.select({
			table : "probe",
			callback : function(err, result) {
				// console.log(result);
				// console.log('hi result :' + result);
				// 	console.log('we have result ! probe');
					if (result){
				probeCache = indexById(result.rows, 'id_probe');
				} else {probeCache  = []}
				// console.log('probe in cache'  + probeCache);
				probeTime = Date.now();
				// console.log(probeTime);
			}
		});
	};

	this.loadSensors = function() {
		 console.log('hi load sensor bug ?');
		dbSensor.select({
			table : "sensor",
			callback : function(err, result) {
				// console.log('sensor result: ' + result);
				if (result){

				sensorCache = indexById(result.rows, 'id_sensor');
				// console.log(sensorCache)
			} else {sensorCache = []}
				// console.log('sensorcache' + sensorCache );
				sensorTime = Date.now();
			}
		});
	};

	var refresh = function() {
		var now = Date.now();

		if (now - zoneTime > zoneLife) {
			self.loadZones();
		}

		if (now - probeTime > probeLife) {
			self.loadProbes();
		}

		if (now - sensorTime > sensorLife) {
			self.loadSensors();
		}
	};

	var _checkObject = function(object, config) {
		var checkConfig = function(configName) {
			return (
				typeof config[configName] === 'object'
				&& typeof config[configName].length === 'number'
				&& config[configName].length > 0
			);
		};

		var field;
		if (checkConfig('required')) {
			for (var i=0; i < config.required.length; i++) {
				field = config.required[i];
				if (typeof object[field] === 'undefined') {
					return false;
				}
			}
		}

		if (checkConfig['nonEmpty']) {
			for (var i=0; i < config.nonEmpty.length; i++) {
				field = config.nonEmpty[i];
				if (typeof object[field] === 'undefined' || object[field] === '') {
					return false;
				}
			}
		}

		if (checkConfig['number']) {
			for (var i=0; i < config.nonEmpty.length; i++) {
				field = config.number[i];
				if (typeof object[field] === 'number') {
					return false;
				}
			}
		}

		return true;
	};

	this.updateZone = function(zone, callback) {
		zone = _cleanZone(zone);


		if (_checkZone(zone)) {
			_saveZone(zone, callback);
		}
		else {
			callback(false);
		}
	};
	this.deleteProbe = function(probe_id, callback) {
		console.log('delete func')
		dbProbe.delete({
			table : 'probe',
			where :  'id_probe =' + "'" + probe_id + "'",

			callback : function(err, result) {
				if (err) {
					// console.log('insert ERREUR*************' + err)
					return;
				}
					// console.log('insert GOOD*************' + result)
					console.log('delete probe done !')

			}
		});



	};
	this.deleteSensor = function(sensor_id, callback) {
		console.log('delete sensor func' + sensor_id)
		dbSensor.delete({
			table : 'sensor',
			where :  'id_sensor =' + "'" + sensor_id + "'",
			callback : function(err, result) {
				if (err) {
					// console.log('insert ERREUR*************' + err)
					return;
				}
					// console.log('insert GOOD*************' + result)
					console.log('delete sensor done !')
			}
		});



	};

	var _checkZone = function(zone) {
		return _checkObject(zone, {
			required : ['id_zone', 'name', 'location', 'location_gps', 'dashboards'],
			nonEmpty : ['id_zone', 'name'],
			number   : ['id_zone']
		});
	};

	var _cleanZone = function(zone) {
		var zoneFields = { 'id_zone':1, 'name':1, 'location':1, 'location_gps':1, 'dashboards':1 };
		var dashFields = { 'name':1, 'blocks':1 };

		// removing unnecessary zone fields
		for (var field in zone) {
			if (typeof zoneFields[field] === 'undefined') {
				delete zone[field];
			}
		}

		// forcing id_zone to number
		zone.id_zone = parseInt(zone.id_zone);

		// removing unnecessary dashboard fields
		if (typeof zone.dashboards === 'object' && typeof zone.dashboards.length === 'number') {
			for (var i=0; i < zone.dashboards.length; i++) {
				for (var field in zone.dashboards[i]) {
					if (typeof dashFields[field] === 'undefined') {
						delete zone.dashboards[i][field];
					}
				}
			}

			// JSONifyication !
			zone.dashboards = JSON.stringify(zone.dashboards);
		}
		else {
			zone.dashboards = '[]';
		}

		return zone;
	};

	var _saveZone = function(zone, callback) {
		var values = JSON.parse(JSON.stringify(zone));
		delete values.id_zone;



		dbZone.update({
			set : "dashboards = '" + zone.dashboards + "'" ,
			values : values,
			where : 'id_zone= ' + zone.id_zone,
			zoneId : zone.id_zone,
			callback : function(err, result) {
				// Refresh zones cache
				 console.log('error: ' + err)
				 console.log('result: ' + result)
				self.loadZones();

				if (typeof callback === 'function') {
					callback();
				}
			}
		});
	};
	this.updateSensorRelay = function(device_id, sensor_type, sensor_value, id_sensor, sensor_mode, callback) {




		dbSensor.update({
			set : "last_value = " + "'" + sensor_value + "', " + "sensor_mode = "  + sensor_mode + ", last_time = " + "toTimestamp(now())" ,
			values : {
				last_value : sensor_value,
			},
			where : "id_sensor =" + "'" + id_sensor + "'" ,
			whereValues : { id_sensor : id_sensor }
		});
		callback();

	};
	this.updateProbe = function(probe, callback) {
		probe = _cleanProbe(probe);

		if (_checkProbe(probe)) {
			_saveProbe(probe, callback);
		}
		else {
			callback(false);
		}
	};

	var _checkProbe = function(probe) {
		return _checkObject(probe, {
			required : ['id_probe', 'id_zone', 'name'],
			nonEmpty : ['id_probe', 'id_zone', 'name'],
			number   : ['id_probe', 'id_zone']
		});
	};

	var _cleanProbe = function(probe) {
		var probeFields = { 'id_probe':1, 'id_zone':1, 'name':1 };

		// removing unnecessary zone fields
		for (var field in probe) {
			if (typeof probeFields[field] === 'undefined') {
				delete probe[field];
			}
		}

		return probe;
	};

	var _saveProbe = function(probe, callback) {
		var values = JSON.parse(JSON.stringify(probe));


		var whereValues = { id_probe : probe.id_probe };
		var whereWhere = 'id_probe= ' + "'" + probe.id_probe + "' "

		dbProbe.update({
			set :  "name= '" + values.name + "' ",
			what : 'saveProbe',
			values : values,
			where : whereWhere,
			whereValues : whereValues,
			callback : function() {
				// Refresh probes cache
				self.loadProbes();

				if (typeof callback === 'function') {
					callback();
				}
			}
		});
	};

	this.updateSensorSortOrder = function(id_sensor, sort_order, callback) {
		console.log('*********************** hi *******************************')
		dbSensor.update({
			table : 'sensor',
			set : "sort_order = " + sort_order  ,
			values : { sort_order : sort_order },
			where : 'id_sensor=' + " '"+ id_sensor + "'",
			whereValues : { id_sensor : id_sensor },
			callback : function() {
				// Refresh probes cache
				self.loadSensors();

				if (typeof callback === 'function') {
					callback();
				}
			}
		});
	};

	refresh();
	setInterval(refresh, 1000);
};
