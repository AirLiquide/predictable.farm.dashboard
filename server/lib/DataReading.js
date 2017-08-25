var DbTable = require('./DbTable');

module.exports = function() {
	var dbReading = new DbTable('sensorlog', false);

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
//SELECT * FROM sensorlog WHERE ts >= '2013-01-01 00:00:00+0200' AND  ts <= '2013-08-13 23:59:00+0200' AND token(user_id) > previous_token LIMIT 100 ALLOW FILTERING;
		var columns = 'device_id, value';
		// switch (date_format) {
		// 	case 'utc':
		// 		columns += ', CONCAT("Date.UTC(", YEAR(time), ",", MONTH(time)-1, ",", DAY(time), ",", HOUR(time), ",", MINUTE(time), ",", SECOND(time), ")") AS time';
		// 	break;
		//
		// 	case 'datetimeT':
		// 		columns += ', CONCAT(SUBSTR(time, 1, 10), "T", SUBSTR(time, 12, 8)) AS time';
		// 	break;
		//
		// 	case 'timestamp':
		// 		columns += ', UNIX_TIMESTAMP(time) AS time';
		// 	break;
		//
		// 	case 'microtime':
		// 		columns += ', UNIX_TIMESTAMP(time)*1000 AS time';
		// 	break;
		//
		// 	case 'datetime':
		// 	default:
		// 		columns += ', time';
		// 	break;
		// }
		var timeBegin =;
		var timeEnd =;
		var where = 'created_at >=  ' + ;
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

		where += ' ORDER BY device_id, time';
 console.log('/////////where: ' + where +  'columns : ' + columns )
		dbReading.select({
			columns : columns,
			where : where,
			whereValues : {
				from : from,
				to : to
			},
			callback : function(err, result) {
				if (err) {
					console.log(err);
					console.log(dbReading.lastRequest);
				}
				else {
					if (typeof callback === 'function') {
						callback(digestResultToJSON(result.rows, date_format));
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

			if (typeof usableResult[row.device_id] === 'undefined') {
				usableResult[row.device_id] = [];
				//lastMinute = '';
			}

			/*if (row.time.substr(0,16) != lastMinute) {
				usableResult[row.device_id].push([
					row.time.replace(' ', 'T'), // Convert MySQL datetime format to ~ISO format
					row.value
				]);

				lastMinute = row.time.substr(0,16);
			}
			*/

			usableResult[row.device_id].push([row.time, row.value]);
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

			if (row.device_id != lastSensor) {
				firstRecord = true;
				if (lastSensor != -1) {
					json += '],';
				}
				json += '"' + row.device_id + '":[';

				lastSensor = row.device_id;
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
