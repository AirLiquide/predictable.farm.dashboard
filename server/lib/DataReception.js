var DbTable = require('./DbTable');

module.exports = function() {
	var dbProbe = new DbTable('probe', false);
	var dbSensor = new DbTable('sensor', false);
	var dbReading = new DbTable('reading', false);

	var probeCache = {};
	var sensorCache = {};
	var readingCache = {};

	var readingDelay = 60 // Delay (in seconds) between 2 reading registration in db

	var getCurrentTimestamp = function() {
		return Math.floor(Date.now()/1000);
	};

	this.processData = function(data) {
		var id_probe;
		var id_sensor;

		//console.log(data);

		var moveToCreateProbe = function () {
			createProbe({
				values : {
					uuid : data.device_id,
					id_zone : 0,
					name : 'New probe'
				},
				callback : function(err, rows) {
					id_probe = rows.info.insertId;

					moveToCreateSensor();
				}
			});
		};

		var moveToCreateSensor = function() {
			createSensor({
				values : {
					id_probe : id_probe,
					type : data.sensor_type,
					last_value : data.sensor_value
				},
				callback : function(err, rows) {
					id_sensor = rows.info.insertId;

					moveToCreateReading();
				}
			});
		};

		var moveToCreateReading = function() {
			createReading({
				values : { id_sensor : id_sensor, value : data.sensor_value }
			});
		};

		searchProbe({
			uuid : data.device_id,
			notFound : moveToCreateProbe,
			found : function(err, rows) {
				id_probe = rows[0].id_probe;

				searchSensor({
					id_probe : id_probe,
					type : data.sensor_type,
					notFound : moveToCreateSensor,
					found : function(err, rows) {
						id_sensor = rows[0].id_sensor;

						refreshSensor({
							values : {
								id_sensor : id_sensor,
								last_value : data.sensor_value
							}
						});

						moveToCreateReading();
					}
				});
			}
		});
	};

	// params : uuid, found, notFound
	var searchProbe = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		if (typeof params.uuid !== 'undefined') {
			// search probe in local cache
			if (typeof probeCache[params.uuid] !== 'undefined') {
				if (typeof params.found === 'function') {
					// found callback
					params.found(undefined, [{
						id_probe : probeCache[params.uuid],
						uuid : params.uuid
					}]);
				}

				return;
			}

			// search probe in db
			dbProbe.select({
				where : 'uuid=:uuid',
				whereValues : { uuid : params.uuid },
				callback : function(err, result) {
					var rows = result
					if (err) {
						return;
					}
				console.log('on probe callback' + result + 'hi:' + err)
					if (rows.length === 0) {
						if (typeof params.notFound === 'function') {
							params.notFound();
						}
					}
					else if (rows.length > 0) {
						if (typeof params.found === 'function') {
							// probe cache registering
							probeCache[rows[0].uuid] = rows[0].id_probe;

							// found callback
							params.found(err, rows);
						}
					}
				}
			});
		}
		else if (typeof params.notFound === 'function') {
			params.notFound();
		}
	};

	// params : id_probe, type, found, notFound
	var searchSensor = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		if (typeof params.id_probe !== 'undefined' && typeof params.type !== 'undefined') {
			// search sensor in local cache
			if (typeof sensorCache[params.id_probe] !== 'undefined' && typeof sensorCache[params.id_probe][params.type] !== 'undefined') {
				if (typeof params.found === 'function') {
					// found callback
					params.found(undefined, [{
						id_sensor : sensorCache[params.id_probe][params.type],
						id_probe : params.id_probe,
						type : params.type
					}]);
				}

				return;
			}

			// search sensor in db
			dbSensor.select({
				where : 'id_probe=:id_probe AND type=:type',
				whereValues : { id_probe : params.id_probe, type : params.type },
				callback : function(err, result) {
					var rows = result
					if (err) {
						return;
					}

					if (rows.length === 0) {
						if (typeof params.notFound === 'function') {
							params.notFound();
						}
					}
					else if (rows.length > 0) {
						if (typeof params.found === 'function') {
							// sensor cache registering
							if (typeof sensorCache[params.id_probe] === 'undefined') {
								sensorCache[params.id_probe] = {};
							}
							sensorCache[params.id_probe][params.type] = rows[0].id_sensor;

							// found callback
							params.found(err, rows);
						}
					}
				}
			});
		}
		else if (typeof params.notFound === 'function') {
			params.notFound();
		}
	};

	// params : value.id_zone, values.uuid, values.name,  callback
	var createProbe = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		dbProbe.insert({
			values : params.values,
			callback : function(err, rows) {
				if (err) {
					return;
				}

				if (typeof params.callback === 'function') {
					params.callback(err, rows);
				}
			}
		});
	};

	// params : values.id_probe, values.type, values.last_value, callback
	var createSensor = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		dbSensor.insert({
			values : {
				id_probe : params.values.id_probe,
				type : params.values.type,
				last_value : params.values.last_value
			},
			callback : function(err, rows) {
				if (err) {
					return;
				}

				if (typeof params.callback === 'function') {
					params.callback(err, rows);
				}
			}
		});
	};

	// params : values.id_sensor, values.value, callback
	var createReading = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		var now = getCurrentTimestamp();

		// if the last registered value was less than X seconds ago, we don't record the new one
		if ((readingCache[params.values.id_sensor] + readingDelay) >= now) {
			return;
		}
		// else we update the cache to remember a value was recorded
		else {
			readingCache[params.values.id_sensor] = now;
		}

		dbReading.insert({
			values : {
				id_sensor : params.values.id_sensor,
				value : params.values.value
			},
			callback : function(err, rows) {
				if (err) {
					return;
				}

				if (typeof params.callback === 'function') {
					params.callback(err, rows);
				}
			}
		});
	};

	// params : id_sensor, last_value
	var refreshSensor = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		dbSensor.update({
			values : {
				last_value : params.values.last_value,
			},
			where : 'id_sensor = :id_sensor',
			whereValues : { id_sensor : params.values.id_sensor }
		});
	};
};
