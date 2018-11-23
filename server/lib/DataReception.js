/*
  Copyright (C) Air Liquide S.A,  2017-2018
  Author: Sébastien Lalaurette and Cyril Ferté, La Factory, Creative Foundry
  This file is part of Predictable Farm project.

  The MIT License (MIT)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
   
  See the LICENSE.txt file in this repository for more information.
*/

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

		var moveToCreateProbe = function () {
			createProbe({
				values : {
					uuid : data.device_id,
					id_zone : 0,
					name : 'New probe'
				},
				callback : function(err, result) {
					id_probe = data.device_id;
					moveToCreateSensor();
				}
			});
		};

		var moveToCreateSensor = function() {
			createSensor({
				values : {
					id_probe : id_probe,
					type : data.sensor_type,
					last_value : data.sensor_value,
					sensor_mode : data.sensor_mode
				},
				callback : function(err, result) {
					id_sensor = data.device_id + data.sensor_type;
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
			found : function(err, result) {
				id_probe = result[0].id_probe;

				searchSensor({
					id_probe : id_probe,
					type : data.sensor_type,
					notFound : moveToCreateSensor,
					found : function(err, result) {

						id_sensor = result[0].id_sensor;

						if  (data.sensor_mode){
							refreshSensor({
								values : {
									id_sensor : id_sensor,
									last_value : data.sensor_value,
									sensor_mode : data.sensor_mode
								}
							});
						}else {
							refreshSensor({
								values : {
									id_sensor : id_sensor,
									last_value : data.sensor_value
								}
							});

						}


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
				table : 'probe',
				where : 'uuid= ' + "'" + params.uuid  + "' ALLOW FILTERING",
				whereValues : { uuid : params.uuid },
				callback : function(err, result) {
					var rows = result
					if (err) {
						return;
					}
					if (result.rows.length === 0) {
						if (typeof params.notFound === 'function') {
							params.notFound();
						}
					}
					else if (result.rows.length > 0) {
						if (typeof params.found === 'function') {
							// probe cache registering
							probeCache[result.rows[0].uuid] = result.rows[0].id_probe;
							// found callback
							params.found(err, result.rows);
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
				table : 'sensor',
				where : "id_probe=" + "'" + params.id_probe + "'" +  " AND type='" + params.type + "' " + "ALLOW FILTERING" ,
				whereValues : { id_probe : params.id_probe, type : params.type },
				callback : function(err, result) {
					var rows = result
					if (err) {
						return;
					}
					if (result.rows.length === 0) {
						if (typeof params.notFound === 'function') {
							params.notFound();
						}
					}
					else if (result.rows.length > 0) {
						if (typeof params.found === 'function') {

							if (typeof sensorCache[params.id_probe] === 'undefined') {
								sensorCache[params.id_probe] = {};
							}
							sensorCache[params.id_probe][params.type] = result.rows[0].id_sensor;
							// found callback
							params.found(err, result.rows);
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
			set :  "'" + params.values.uuid + "', " + "'" + params.values.uuid + "', "  + " 0 ," + "'" + "New probe" + "' ",
			listValue : "(id_probe, uuid, id_zone, name)",
			callback : function(err, result) {
				if (err) {
					return;
				}
				if (typeof params.callback === 'function') {
					params.callback(err, result.rows);
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
			set :   "'" + params.values.id_probe + params.values.type + "'"  + ", '" + params.values.id_probe + "', " + "'" + params.values.type + "', " + "'" + params.values.last_value + "', " + "toTimestamp(now())",
			listValue : "(id_sensor, id_probe, type, last_value, last_time)",
			values : {
				id_probe : params.values.id_probe,
				type : params.values.type,
				last_value : params.values.last_value
			},
			callback : function(err, result) {
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
		if (params.values.sensor_mode){
			dbSensor.update({
				//UPDATE cycling.popular_count SET popularity = popularity + 2 WHERE id = 6ab09bec-e68e-48d9-a5f8-97e6fb4c9b47;
				set : "last_value = " + "'" + params.values.last_value + "', " + "sensor_mode = "  + params.values.sensor_mode + ", last_time = " + "toTimestamp(now())" ,
				values : {
					last_value : params.values.last_value,
				},
				where : "id_sensor =" + "'" + params.values.id_sensor + "'" ,
				whereValues : { id_sensor : params.values.id_sensor }
			});
		} else{
			dbSensor.update({
				//UPDATE cycling.popular_count SET popularity = popularity + 2 WHERE id = 6ab09bec-e68e-48d9-a5f8-97e6fb4c9b47;
				set : "last_value = " + "'" + params.values.last_value + "', " + " last_time = " + "toTimestamp(now())" ,
				values : {
					last_value : params.values.last_value,
				},
				where : "id_sensor =" + "'" + params.values.id_sensor + "'" ,
				whereValues : { id_sensor : params.values.id_sensor }
			});
		}

	};
};
