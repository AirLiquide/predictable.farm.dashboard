// modules
var express = require('express');
var http = require('http');
var morgan = require('morgan');

var session = require('cookie-session');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended : false });

// configuration files
var configServer = require('./lib/config/server');

var SetupServer = require('./lib/SetupServer.js');
var setup = new SetupServer();

var DataReading = require('./lib/DataReading.js');
var dataReading = new DataReading();

var dataSender = require('./lib/DataSending.js');

// app parameters
var app = express();
app.set('port', configServer.httpPort);
app.set('views', './views');

console.log('hi')
app.use(express.static(configServer.staticFolder));
app.use(morgan('dev'));

app.get('/', function(req, res) {


	var RouteNavURL = 'dashboard'
	res.render( 'nav.ejs', {
		'setup' : setup.get(),
		RouteNavURL: RouteNavURL
	});


});
app.get('/recipies', function(req, res) {
	//console.log('app.get(/)');
	res.redirect('http://ecf-berlin.predictable.farm/recipies/');

});

app.get('/general', function(req, res) {
	console.log('app.get(/general)');
});

// http://server.local:8080/get-list-reading?sensors=1,2,3&from=2016-10-01_10:10:10&to=2016-12-12_12:12:12
// http://server.local:8080/get-list-reading?sensors=1,2,3&from=[timestamp]&to=[timestamp]&dateformat=[date_format]&callback=XXXXXXXX

// [date_format] values
// datetime : 2016-01-16 11:46:02
// datetimeT : 2016-01-16T11:46:02
// utc : Date.UTC(2016,0,16,11,46,2);
// timestamp : 21324534687

// [callback] distinguish JSON request from JSONP request
// json : { id_sensor : [[time, value], [time, value], ...] }
// jsonp : callback([json_result]);

app.get('/get-list-reading', function(req, res) {
	var date_format = 'datetimeT';
	if (typeof req.query.date_format !== 'undefined') {
		date_format = req.query.date_format;
	}

	var callback = false;
	if (typeof req.query.callback !== 'undefined') {
		callback = req.query.callback;
	}

	var before = new Date().getTime();

	dataReading.getListReading(
		req.query.sensors,
		req.query.from,
		req.query.to,
		date_format,
		function(result) {
			console.log('Res : ' + ((new Date().getTime()) - before) + 'ms');

			if (callback !== false) {
				res.end(callback + '(' + result + ');');
			}
			else {
				res.end(result);
			}

			console.log('End : ' + ((new Date().getTime()) - before) + 'ms');
		}
	);
});

app.post('/update-zone', urlencodedParser, function(req, res) {
	//console.log('app.post(/update-zone)');
	//console.log(req.body);

	// TODO check login & user rights

	if (typeof req.body.zone !== 'undefined') {
		setup.updateZone(JSON.parse(req.body.zone), function() {
			res.end('done');
		});
	}
});

app.post('/update-probe', urlencodedParser, function(req, res) {
	//console.log('app.post(/update-probe)');
	//console.log(req.body);

	// TODO check login & user rights

	if (typeof req.body.probe !== 'undefined') {
		setup.updateProbe(JSON.parse(req.body.probe), function() {
			res.end('done');
		});
	}
});

app.post('/update-sensors-order', urlencodedParser, function(req, res) {
	//console.log('app.post(/update-sensors-order)');
	//console.log(req.body);
	//console.log(JSON.parse(req.body.sensors_order));

	// TODO check login & user rights

	var sensors_order = JSON.parse(req.body.sensors_order);
	if (typeof sensors_order == 'object') {
		for (var id_sensor in sensors_order) {
			setup.updateSensorSortOrder(id_sensor, sensors_order[id_sensor]);
		}

		res.end('done');
	}
});

app.get('/change-relay', urlencodedParser, function(req, res) {
	// device_id
	// sensor_type
	// sensor_value

	// check required parameters
	var params = ['device_id', 'sensor_type', 'sensor_value'];
	for (var i=0; i < params.length; i++) {
		if (typeof req.query[params[i]] === 'undefined') {
			res.end('fail');
			return;
		}
	}

	if (!dataSender.know(req.query.device_id)) {
		res.end('unknown');
	}
	else {
		dataSender.send(
			req.query.device_id,
			req.query.sensor_type,
			req.query.sensor_value
		);

		res.end('done');
	}
});

// serve index
require('./lib/routes').serveIndex(app, configServer.staticFolder);

// HTTP server
var server = http.createServer(app);
server.listen(app.get('port'), function () {
	console.log('HTTP server listening on port ' + app.get('port'));
});

// WebSocket server
var io = require('socket.io')(server);
io.on('connection', require('./lib/routes/socket'));

module.exports.app = app;
