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
			// console.log('move probe :' + data.device_id);
			createProbe({
				values : {
					uuid : data.device_id,
					id_zone : 0,
					name : 'New probe'
				},
				callback : function(err, result) {
					// console.log('create probe ' + err + result)
					id_probe = data.device_id;
					// console.log('create probe');
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
				callback : function(err, result) {
					id_sensor = data.device_id + data.sensor_type;
					// console.log('create sensor');
					moveToCreateReading();
				}
			});
		};

		var moveToCreateReading = function() {
			// console.log('move reading');
			createReading({
				values : { id_sensor : id_sensor, value : data.sensor_value }
			});
		};
		// console.log('**********************************Start Reading probe socket');
		searchProbe({
			uuid : data.device_id,
			notFound : moveToCreateProbe,
			found : function(err, result) {
				// console.log(JSON.stringify(result.rows) );
				id_probe = result[0].id_probe;

				searchSensor({
					id_probe : id_probe,
					type : data.sensor_type,
					notFound : moveToCreateSensor,
					found : function(err, result) {
						// console.log('******sensor found result : ' + JSON.stringify(result) + result.rows + JSON.stringify(result.rows));
						id_sensor = result[0].id_sensor;
						// console.log('sensor found');
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
			// console.log('on search probe not a object')
			return;
		}
		// console.log('on search probe callback')
		if (typeof params.uuid !== 'undefined') {
			// search probe in local cache
			// console.log('on search probe not undefff  ' + probeCache[params.uuid] + '************' + params.found + '//////////' + params.uuid)
			if (typeof probeCache[params.uuid] !== 'undefined') {
				if (typeof params.found === 'function') {
					// found callback
					// console.log('on search probe found')
					params.found(undefined, [{
						id_probe : probeCache[params.uuid],
						uuid : params.uuid
					}]);
				}

				return;
			}

			// search probe in db
			dbProbe.select({
				table : 'probe',
				where : 'uuid= ' + "'" + params.uuid  + "' ALLOW FILTERING",
				whereValues : { uuid : params.uuid },
				callback : function(err, result) {
					var rows = result
					if (err) {
						// console.log('on select ERREUR $$$$$***********' + err + '*****' + result)
						return;
					}
				// console.log('on probe callback' + result + 'hi err:' + err)
					if (result.rows.length === 0) {
						if (typeof params.notFound === 'function') {
							// console.log('on select ERREUR not found $$$$$***********')
							params.notFound();
						}
					}
					else if (result.rows.length > 0) {
						if (typeof params.found === 'function') {
							// probe cache registering
							probeCache[result.rows[0].uuid] = result.rows[0].id_probe;
							// console.log('on select found **********$$$$$***********')
							// found callback
							params.found(err, result.rows);
						}
					}
				}
			});
		}
		else if (typeof params.notFound === 'function') {
			// console.log('on select not found ERREUR $$$$$***********')
			params.notFound();
		}
	};

	// params : id_probe, type, found, notFound
	var searchSensor = function(params) {
		if (typeof params !== 'object') {
			// console.log('on search sensor ERREUR not object ***************$$$$$***********')
			return;
		}

		if (typeof params.id_probe !== 'undefined' && typeof params.type !== 'undefined') {
			// search sensor in local cache
			if (typeof sensorCache[params.id_probe] !== 'undefined' && typeof sensorCache[params.id_probe][params.type] !== 'undefined') {
				if (typeof params.found === 'function') {
					// found callback
					// console.log('on search sensor found')
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
				table : 'sensor',
				where : "id_probe=" + "'" + params.id_probe + "'" +  " AND type='" + params.type + "' " + "ALLOW FILTERING" ,
				whereValues : { id_probe : params.id_probe, type : params.type },
				callback : function(err, result) {
					var rows = result
					if (err) {
						// console.log('ERREUR on select sensor **********//////////////' + err)
						return;
					}
					// console.log('on sensor select callback' + result + 'hi err:' + err)
					if (result.rows.length === 0) {
						if (typeof params.notFound === 'function') {
							// console.log('not found on select sensor **********//////////////')
							params.notFound();
						}
					}
					else if (result.rows.length > 0) {
						if (typeof params.found === 'function') {
							// sensor cache registering
							// console.log('found sensor')
							if (typeof sensorCache[params.id_probe] === 'undefined') {
								sensorCache[params.id_probe] = {};
								// console.log('found sensor 2')
							}
							sensorCache[params.id_probe][params.type] = result.rows[0].id_sensor;
							// console.log('found sensor 3')

							// found callback
							params.found(err, result.rows);
						}
					}
				}
			});
		}
		else if (typeof params.notFound === 'function') {
			// console.log('not found sensor *************')
			params.notFound();
		}
	};

	// params : value.id_zone, values.uuid, values.name,  callback
	var createProbe = function(params) {
		// console.log('createProbe *************')
		if (typeof params !== 'object') {
			// console.log('createProbe not object *************')
			return;
		}


		dbProbe.insert({
			values : params.values,
			set :  "'" + params.values.uuid + "', " + "'" + params.values.uuid + "', "  + " 0 ," + "'" + "New probe" + "' ",
			listValue : "(id_probe, uuid, id_zone, name)",
			callback : function(err, result) {
				if (err) {
					// console.log('insert ERREUR*************' + err)
					return;
				}
					// console.log('insert GOOD*************' + result)
				if (typeof params.callback === 'function') {
					// console.log('insert callback is function *************' + err + result)
					params.callback(err, result.rows);
				}
			}
		});
	};

	// params : values.id_probe, values.type, values.last_value, callback
	var createSensor = function(params) {
		if (typeof params !== 'object') {
			// console.log('createSensor not object *************')
			return;
		}

		dbSensor.insert({
			set :   "'" + params.values.id_probe + params.values.type + "'"  + ", '" + params.values.id_probe + "', " + "'" + params.values.type + "', " + "'" + params.values.last_value + "', " + "toTimestamp(now())",
			listValue : "(id_sensor, id_probe, type, last_value, last_time)",
			values : {
				id_probe : params.values.id_probe,
				type : params.values.type,
				last_value : params.values.last_value
			},
			callback : function(err, result) {
				// console.log('createSensor callback result *************' + result)
				// console.log('createSensor callback err *************' + err)
				if (err) {
					return;
				}

				if (typeof params.callback === 'function') {
					params.callback(err, result);
				}
			}
		});
	};

	// params : values.id_sensor, values.value, callback
	var createReading = function(params) {
			return;
	};

	// params : id_sensor, last_value
	var refreshSensor = function(params) {
		if (typeof params !== 'object') {
			return;
		}

		dbSensor.update({
			//UPDATE cycling.popular_count SET popularity = popularity + 2 WHERE id = 6ab09bec-e68e-48d9-a5f8-97e6fb4c9b47;
			set : "last_value = " + "'" + params.values.last_value + "'",
			values : {
				last_value : params.values.last_value,
			},
			where : "id_sensor =" + "'" + params.values.id_sensor + "'" ,
			whereValues : { id_sensor : params.values.id_sensor }
		});
	};
};
