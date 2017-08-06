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
		return Math.floor(Date.now()/1000);
	};

	var indexById = function(rows, identifier) {
		var result = {};
		for (var i=0; i < rows.length; i++) {
			result[rows[i][identifier]] = rows[i];
		}
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

	this.loadZones = function() {
		dbZone.select({
			callback : function(err, rows) {
				// For each zone we parse the 'dashboards' field which contains JSON
				for (var i=0; i < rows.length; i++) {
					rows[i].dashboards = JSON.parse(rows[i].dashboards);
				}

				zoneCache = indexById(rows, 'id_zone');
				zoneTime = Date.now();
			}
		});
	};

	this.loadProbes = function() {
		dbProbe.select({
			callback : function(err, rows) {
				probeCache = indexById(rows, 'id_probe');
				probeTime = Date.now();
			}
		});
	};

	this.loadSensors = function() {
		dbSensor.select({
			callback : function(err, rows) {
				sensorCache = indexById(rows, 'id_sensor');
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
		console.log('lol')

		if (_checkZone(zone)) {
			_saveZone(zone, callback);
		}
		else {
			callback(false);
		}
	};
	this.deleteProbe = function(probe_id, callback) {
		var MariaSql = require('mariasql');
		this.connection = new MariaSql({
				host : 'localhost',
				user : 'predictableuser',
				password : 'predictable',
				db : 'predictabledata'
		});

		this.connection.query("DELETE FROM probe WHERE id_probe = :ProbeID",
                     			{ProbeID: probe_id})
		this.connection.query("DELETE FROM sensor WHERE id_probe = :ProbeID",
								          {ProbeID: probe_id})


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

		var whereValues = { id_zone : zone.id_zone };

		dbZone.update({
			values : values,
			where : 'id_zone=:id_zone',
			whereValues : whereValues,
			callback : function() {
				// Refresh zones cache
				self.loadZones();

				if (typeof callback === 'function') {
					callback();
				}
			}
		});
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
		delete values.id_probe;

		var whereValues = { id_probe : probe.id_probe };

		dbProbe.update({
			values : values,
			where : 'id_probe=:id_probe',
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
		dbSensor.update({
			values : { sort_order : sort_order },
			where : 'id_sensor=:id_sensor',
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
