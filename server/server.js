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
console.log(dataSender)

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
		req.query.sensorsList,
		req.query.from,
		req.query.to,
		date_format,
		function(result) {
			if (callback !== false) {
				res.end(callback + '(' + result + ');');
			}
			else {
				res.end(result);
			}

		}
	);
});

app.post('/update-zone', urlencodedParser, function(req, res) {
	if (typeof req.body.zone !== 'undefined') {
		setup.updateZone(JSON.parse(req.body.zone), function() {
			res.end('done');
		});
	}
});

app.post('/update-probe', urlencodedParser, function(req, res) {
	if (typeof req.body.probe !== 'undefined') {
		setup.updateProbe(JSON.parse(req.body.probe), function() {
			res.end('done');
		});
	}
});
app.post('/update-sensor-relay', urlencodedParser, function(req, res) {
	if (typeof req.body.sensor !== 'undefined') {
		setup.updateSensorRelay(JSON.parse(req.body.sensor), function() {
			res.end('done');
		});
	}
});
app.post('/delete-probe', urlencodedParser, function(req, res) {

	if (typeof req.body.probe_id !== 'undefined') {
		setup.deleteProbe(req.body.probe_id, function() {
			res.end('done');
		})




	}
});

app.post('/update-sensors-order', urlencodedParser, function(req, res) {

	var sensors_order = JSON.parse(req.body.sensors_order);
	if (typeof sensors_order == 'object') {
		for (var id_sensor in sensors_order) {
			setup.updateSensorSortOrder(id_sensor, sensors_order[id_sensor]);
		}

		res.end('done');
	}
});

app.get('/change-relay', urlencodedParser, function(req, res) {

	// check required parameters
	var params = ['device_id', 'sensor_type', 'sensor_value' , 'sensor_mode'];

	for (var i=0; i < params.length; i++) {
		if (typeof req.query[params[i]] === 'undefined') {
			res.end('fail');
			return;
		}
	}

		dataSender.send(
			req.query.device_id,
			req.query.sensor_type,
			req.query.sensor_value,
			req.query.id_sensor,
			req.query.sensor_mode,
			server, io
			, function(text) {
				res.end(text);
			});
			if (typeof req.query.device_id !== 'undefined') {
				setup.updateSensorRelay(
					req.query.device_id,
					req.query.sensor_type,
					req.query.sensor_value,
					req.query.id_sensor,
					req.query.sensor_mode,
					function() {
					res.end('done');
				});
			}
});

app.get('/delete-sensor', urlencodedParser, function(req, res) {
	// check required parameters
	var params = ['probe_id', 'sensor_id'];

	for (var i=0; i < params.length; i++) {
		if (typeof req.query[params[i]] === 'undefined') {
			res.end('fail');

			return;
		}
	}


		setup.deleteSensor(
			req.query.sensor_id
			, function(text) {
				callback();
				res.end(text);
			});

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
