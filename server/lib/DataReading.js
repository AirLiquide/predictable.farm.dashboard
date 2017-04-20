var DbTable = require('./DbTable');

module.exports = function() {
	var dbReading = new DbTable('reading', false);

	//var self = this;

	var checkDatetime = function(datetime) {
		// TODO
	};

	var checkDatetimeOrder = function(before, after) {
		// TODO
	};

	var checkSensorList = function(sensors) {
		// TODO
	};

	this.getListReading = function(sensors, from, to, date_format, callback) {

		var columns = 'id_sensor, value';
		switch (date_format) {
			case 'utc':
				columns += ', CONCAT("Date.UTC(", YEAR(time), ",", MONTH(time)-1, ",", DAY(time), ",", HOUR(time), ",", MINUTE(time), ",", SECOND(time), ")") AS time';
			break;

			case 'datetimeT':
				columns += ', CONCAT(SUBSTR(time, 1, 10), "T", SUBSTR(time, 12, 8)) AS time';
			break;

			case 'timestamp':
				columns += ', UNIX_TIMESTAMP(time) AS time';
			break;

			case 'microtime':
				columns += ', UNIX_TIMESTAMP(time)*1000 AS time';
			break;

			case 'datetime':
			default:
				columns += ', time';
			break;
		}

		var where = 'id_sensor IN (' + sensors + ')';
		if (date_format === 'timestamp' || date_format === 'microtime') {
			where += ' AND UNIX_TIMESTAMP(time) >= :from AND UNIX_TIMESTAMP(time) <= :to';

			if (date_format === 'microtime') {
				from /= 1000;
				to /= 1000;
			}
		}
		else {
			where += ' AND time >= :from AND time <= :to';
		}
		
		where += ' ORDER BY id_sensor, time';

		dbReading.select({
			columns : columns,
			where : where,
			whereValues : {
				from : from,
				to : to
			},
			callback : function(err, rows) {
				if (err) {
					console.log(err);
					console.log(dbReading.lastRequest);
				}
				else {
					if (typeof callback === 'function') {
						callback(digestResultToJSON(rows, date_format));
					}
				}

				
			}
		});
	};

	var digestResult = function(rows) {
		var usableResult = {};

		var row;
		var lastMinute;
		for (var i=0; i < rows.length; i++) {
			row = rows[i];

			if (typeof usableResult[row.id_sensor] === 'undefined') {
				usableResult[row.id_sensor] = [];
				//lastMinute = '';
			}

			/*if (row.time.substr(0,16) != lastMinute) {
				usableResult[row.id_sensor].push([
					row.time.replace(' ', 'T'), // Convert MySQL datetime format to ~ISO format
					row.value
				]);

				lastMinute = row.time.substr(0,16);
			}
			*/

			usableResult[row.id_sensor].push([row.time, row.value]);
		}

		return usableResult;
	};

	var digestResultToJSON = function(rows, date_format) {
		var result = {};
		var json = '{';

		var row;
		var lastSensor = -1;
		var firstRecord = true;
		for (var i=0; i < rows.length; i++) {
			row = rows[i];

			if (row.id_sensor != lastSensor) {
				firstRecord = true;
				if (lastSensor != -1) {
					json += '],';
				}
				json += '"' + row.id_sensor + '":[';

				lastSensor = row.id_sensor;
			}

			if (!firstRecord) {
				json += ','
			}
			json += '[';
			if (date_format == 'utc' || date_format == 'microtime') {
				json += row.time;
			}
			else {
				json += '"' + row.time + '"';
			}
			json += ',';
			json += row.value;
			json += ']';

			firstRecord = false;
		}

		if (lastSensor != -1) {
			json += ']';
		}

		json += '}';

		return json;
	};
};