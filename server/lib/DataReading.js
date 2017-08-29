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

	this.getListReading = function(sensors, sensorsList, from, to, date_format, callback) {
//SELECT * FROM sensorlog WHERE ts >= '2013-01-01 00:00:00+0200' AND  ts <= '2013-08-13 23:59:00+0200' AND token(user_id) > previous_token LIMIT 100 ALLOW FILTERING;
		console.log('from reading: ******' + from)
		console.log('to reading: ******' + to)
		console.log('from reading: ******' + sensors)
		console.log('from reading: ******' + date_format)
		console.log('sensorList : //////' + sensorsList)
		console.log(typeof sensorList)
		console.log('sensorList : //////' + JSON.stringify(sensorsList))
		var objetSensors = {}
		objetSensors = JSON.parse( '[' +sensorsList + ']');
		console.log(objetSensors + typeof objetSensors)

		sensorsList = objetSensors;
		console.log('sensorList : //////' + sensorsList)
		console.log('sensorList type : //////' + typeof sensorsList)
		var sensorHash = {}
		//
		// var listSensor = dbReading.select({
		// 	table : 'sensor',
		// 	callback : function(err, result) {
		// 		if (err) {
		// 			console.log(err);
		// 		}
		// 		console.log(result);
		// 		console.log(result.rows);
		// 		return result.rows
		// 	}});
		// 	console.log(listSensor)
		// for (var i=0; i < sensors.length; i++) {
		// 	console.log(i)
		// 	sensorHash[i] = sensors.id_sensor[sensors[i]];
		// }
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
		var timeBegin ="";
		var timeEnd ="";


			if (date_format === 'microtime') {
				var from1 = new Date(from *1000 );
				var to1 = new Date(to *1000);
				var from2 = new Date(from1 / 1000).toISOString();
				var to2 = new Date(to1 / 1000).toISOString();
			}
			console.log('from reading: ******' + from1 )
			console.log('to reading: ******' + to1 )
			console.log('from2 reading: ******' + from2 )
			console.log('to2 reading: ******' + to2 )
			var whereDevice_ids = Array();
			var whereSensor_types = Array();
			for (var i=0; i < sensorsList.length; i++) {
				whereDevice_ids.push( "'" + sensorsList[i].id_probe + "'");
				whereSensor_types.push( "'" + sensorsList[i].type + "'");
			}
			var WhereDevices = "AND device_id in (" + whereDevice_ids.join(',') + ")"
			var WhereTypes = "AND sensor_type in (" + whereSensor_types.join(',') + ")"
			console.log(WhereTypes);
			console.log(WhereDevices);


			var where = "created_at >=  '" + from2 + "' AND  created_at <= '" + to2  + "' " + WhereDevices + WhereTypes  + "  ALLOW FILTERING ";

			columns = 'device_id, sensor_type, sensor_value, created_at';
 		console.log('/////////where: ' + where )
		dbReading.select({
			table : 'sensorlog',
			columns : columns,
			where : where,
			whereValues : {
				from : from,
				to : to
			},
			callback : function(err, result) {
				if (err) {
					console.log(err);

				}
				else {
					console.log('result : ' + JSON.stringify(result.rows))
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
		var tempRows =  {};
		// for (var i=0; i < rows.length; i++) {
		// 	 tempRows['4air'].push(rows[i]);
		//
		// }


		var result = {};
		var json = '{';

		var row;
		var lastSensor = -1;
		var firstRecord = true;
		console.log( rows.length)
		for (var i=0; i < rows.length; i++) {
			row = rows[i];


			if (row.device_id != lastSensor) {
				firstRecord = true;
				if (lastSensor != -1) {
					json += '],';
				}
				json += '"' + row.device_id + row.sensor_type + '":[';

				lastSensor = row.device_id + row.sensor_type;
			}

			if (!firstRecord) {
				json += ','
			}
			json += '[';
			if (date_format == 'utc' || date_format == 'microtime') {
				json += '"' + row.created_at.toISOString() + '"';
			}
			else {
				json += '"' + row.created_at.toISOString() + '"';
			}
			json += ',';
			json += row.sensor_value;
			json += ']';

			firstRecord = false;
		}

		if (lastSensor != -1) {
			json += ']';
		}

		json += '}';
 console.log(json);
		return json;
	};
};
