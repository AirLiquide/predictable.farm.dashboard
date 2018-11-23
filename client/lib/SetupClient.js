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

var SetupClient = function(_data, _config) {
	var self = this;
	function wait(ms){
		 var start = new Date().getTime();
		 var end = start;
		 while(end < start + ms) {
			 end = new Date().getTime();
		}
	}

	var convertIndexedObjectToArray = function(indexObject, sortBy) {
		var array = [];
		for (var i in indexObject) {
			array.push(indexObject[i]);
		}

		if (sortBy) {
			array.sort(function(a,b) {
				return a[sortBy] - b[sortBy];
			});
		}

		return array;
	};

	var _init = function() {
		if (typeof _data !== 'undefined') {
			self.setData(_data);
		}
	};

	this.setData = function(data) {
		_data = data;

		_updateLinks();
		_prepareDashboardList();
	};

	this.getData = function() {
		return _data;
	};

	// add data to the objects to make display easier
	var _updateLinks = function() {
		for (var id_sensor in _data.sensors) {
			var sensor = _data.sensors[id_sensor];
			console.log('sensors :' + sensor)
			console.log('probes :' + _data.probes[sensor.id_probe])

			var probe = _data.probes[sensor.id_probe];

			// add probe.uuid to sensors
			if (probe) {
			sensor.probe_uuid = probe.uuid;

			// add probe name to sensors
			sensor.probe_name = probe.name;

			// add probe.id_zone to sensors
			sensor.id_zone = probe.id_zone;
		}

			// add config informations
			if (typeof _config === 'object' && typeof _config[sensor.type] === 'object') {
				if (!!_config[sensor.type].label) {
					sensor.label = _config[sensor.type].label;
				}
				else {
					sensor.label = sensor.type;
				}

				if (!!_config[sensor.type].style) {
					sensor.style = _config[sensor.type].style;
				}
				else {
					sensor.style = '';
				}

				if (!!_config[sensor.type].class) {
					sensor.class = _config[sensor.type].class;
				}
				else {
					sensor.class = 'default';
				}
			}
			else {
				sensor.label = sensor.type;
				sensor.style = '';
				sensor.class = 'default';
			}
		}

		for (var id_probe in _data.probes) {
			// getting the sensors list in the right order (by 'sort_order')
			var sensors = self.getListSensorByProbe(id_probe);
			var sensors_ids = [];
			for (var i=0; i < sensors.length; i++) {
				sensors_ids.push(sensors[i].id_sensor);
			}

			_data.probes[id_probe].sensor_ids = sensors_ids.join(',');
		}
	};

	var _prepareDashboardList = function() {
		console.log(_data)

		for (var id_zone in _data.zones) {
			var zone = _data.zones[id_zone];
			console.log(zone.dashboards)
			if (typeof zone.dashboards !== 'object' ) {
				zone.dashboards = zone.dashboards.replace(/\\/g, '');
				console.log(zone.dashboards)
				zone.dashboards = JSON.parse(zone.dashboards)
			}


			for (var dash_i=0; dash_i < zone.dashboards.length; dash_i++) {
				var dash = _data.zones[id_zone].dashboards[dash_i];
				dash.id_zone = id_zone;
				dash.index = dash_i;

				if (dash.blocks){
					for (var block_i=0; block_i < dash.blocks.length; block_i++) {
						var block = dash.blocks[block_i];
						block.id_zone = id_zone;
						block.dashboard_index = dash_i;
						block.block_index = block_i;

						var sensor_ids = '';

						if (block.sensors != null){
							for (var sensor_i=0; sensor_i < block.sensors.length; sensor_i++) {


									if (_data.sensors[block.sensors[sensor_i].id_sensor]) {

										var cloneSensor = JSON.parse(JSON.stringify(_data.sensors[block.sensors[sensor_i].id_sensor]));
										cloneSensor.color = block.sensors[sensor_i].color;
										cloneSensor.sensor_index = sensor_i;
										block.sensors[sensor_i] = cloneSensor;

										sensor_ids += (sensor_ids == '' ? '' : ',');
										sensor_ids += cloneSensor.id_sensor;

								}
							}
						}



					block.sensor_ids = sensor_ids;
				}
			}
			}
		}
	};

	// Adds the values to a DataKiosk
	this.addLastValueToKiosk = function(kiosk) {
		var sensor;
		var kioskValue;
		var kioskValues = [];

		for (var id_sensor in _data.sensors) {
			sensor = _data.sensors[id_sensor];

			kioskValue = {
				id : (sensor.probe_uuid + ':' + sensor.type),
				device_id : sensor.probe_uuid,
				type : sensor.type,
				value : sensor.last_value,
				time : sensor.last_time
			};
			kioskValues.push(kioskValue);
		}
		kiosk.write(kioskValues);
	};

	/**********************/
	/* GETTERS / CHECKERS */
	/**********************/

	this.hasZone = function(id_zone) {
		return (typeof _data.zones[id_zone] === 'object');
	};

	this.getZone = function(id_zone) {
		return _data.zones[id_zone];

	};

	this.hasProbe = function(id_probe) {
		return (typeof _data.probes[id_probe] === 'object');
	};

	this.getProbe = function(id_probe) {
		return _data.probes[id_probe];
	};
	this.getProbes = function(id_probe) {
		return _data.probes;
	};

	this.hasSensor = function(id_sensor) {
		return (typeof _data.sensors[id_sensor ] === 'object');
	};

	this.getSensor = function(id_sensor) {
		console.log(_data.sensors)
		return _data.sensors[  id_sensor ];
	};
	this.getSensorChart = function(id_sensor) {
		console.log(_data.sensors)
		return _data.sensors[id_sensor];
	};
	this.getSensorCharty = function(id_sensor) {
		console.log(_data.sensors)
		return _data.sensors["'" + id_sensor + "'"];
	};

	this.hasDashboard = function(id_zone, index) {
		return (typeof _data.zones[id_zone].dashboards[index] === 'object');
	};

	this.getDashboard = function(id_zone, index) {
		console.log(index)
		console.log(id_zone)
		console.log(_data)
		return _data.zones[id_zone].dashboards[index];
	};

	this.getDashboardBlock = function(id_zone, dashboard_index, block_index) {
		return _data.zones[id_zone].dashboards[dashboard_index].blocks[block_index];
	};

	/**********************/
	/* SELECTION HANDLING */
	/**********************/

	var _selectedZone = -1;
	this.selectZone = function(id_zone) {
		self.unselectZone();

		if (typeof _data.zones[id_zone] === 'undefined') {
			return;
		}

		_selectedZone = id_zone;
		_data.zones[id_zone].selected = true;
	};

	this.unselectZone = function() {
		if (_selectedZone === -1) {
			return;
		}

		delete _data.zones[_selectedZone].selected;
		_selectedZone = -1;
	};

	this.getSelectedZone = function() {
		if (_selectedZone === -1) {
			return false;
		}

		return _data.zones[_selectedZone];
	};

	var _selectedProbe = -1;
	this.selectProbe = function(id_probe) {
		self.unselectProbe();

		if (typeof _data.probes[id_probe] === 'undefined') {
			return;
		}

		// select the probe
		_selectedProbe = id_probe;
		_data.probes[id_probe].selected = true;
	};

	this.unselectProbe = function() {
		if (_selectedProbe === -1) {
			return;
		}

		delete _data.probes[_selectedProbe].selected;
		_selectedProbe = -1;
	};

	this.getSelectedProbe = function() {
		if (_selectedProbe === -1) {
			return false;
		}

		return _data.probes[_selectedProbe];
	};

	var _selectedDashboard = false;
	this.selectDashboard = function(id_zone, index_dashboard) {
		self.unselectDashboard();

		if (typeof _data.zones[id_zone].dashboards[index_dashboard] === 'object') {
			_data.zones[id_zone].dashboards[index_dashboard].selected = true;
			_selectedDashboard = [id_zone, index_dashboard];
		}
	};

	this.unselectDashboard = function() {
		if (_selectedDashboard) {
			var id_zone = _selectedDashboard[0];
			var index_dashboard = _selectedDashboard[1];

			if (typeof _data.zones[id_zone].dashboards[index_dashboard] === 'object') {
				delete _data.zones[id_zone].dashboards[index_dashboard].selected;
			}

			_selectedDashboard = false;
		}
	};

	this.getSelectedDashboard = function() {
		if (_selectedDashboard === false) {
			return false;
		}

		var id_zone = _selectedDashboard[0];
		var index_dashboard = _selectedDashboard[1];

		return _data.zones[id_zone].dashboards[index_dashboard];
	};

	/****************/
	/* LIST QUERIES */
	/****************/

	this.getListZone = function(indexed) {
		if (typeof indexed === 'undefined') {
			indexed = false;
		}

		if (indexed) {
			return _data.zones;
		}
		else {
			return convertIndexedObjectToArray(_data.zones);
		}
	};

	this.getListProbeByZone = function(id_zone, indexed) {
		if (typeof indexed === 'undefined') {
			indexed = false;
		}

		var probes;

		if (typeof id_zone === 'undefined') {
			probes = _data.probes;
		}
		else {
			probes = {};
			for (var id_probe in _data.probes) {
				if (_data.probes[id_probe].id_zone == id_zone) {
					probes[id_probe] = _data.probes[id_probe];
				}
			}
		}

		if (indexed) {
			return probes;
		}
		else {
			return convertIndexedObjectToArray(probes);
		}
	};

	this.getListSensorByProbe = function(id_probe, indexed) {
		if (typeof indexed === 'undefined') {
			indexed = false;
		}

		var sensors;

		if (typeof id_probe === 'undefined') {
			sensors = _data.sensors;
		}
		else {
			sensors = {};
			for (var id_sensor in _data.sensors) {
				if (_data.sensors[id_sensor].id_probe == id_probe) {
					sensors[id_sensor] = _data.sensors[id_sensor];
				}
			}
		}

		if (indexed) {
			return sensors;
		}
		else {
			return convertIndexedObjectToArray(sensors, 'sort_order');
		}
	};

	this.getListSensorByZone = function(id_zone, indexed) {
		if (typeof indexed === 'undefined') {
			indexed = false;
		}

		var sensors;

		if (typeof id_zone === 'undefined') {
			sensors = _data.sensors;
		}
		else {
			sensors = {};
			for (var id_sensor in _data.sensors) {
				if (_data.sensors[id_sensor].id_zone == id_zone) {
					sensors[id_sensor] = _data.sensors[id_sensor];
				}
			}
		}

		if (indexed) {
			return sensors;
		}
		else {
			return convertIndexedObjectToArray(sensors, 'sort_order');
		}
	};

	/*************/
	/* MODIFIERS */
	/*************/

	this.addDashboard = function(id_zone, callback) {
		var newDashboard = {
			name : 'New Dashboard',
			blocks : []
		};

		_data.zones[id_zone].dashboards.push(newDashboard);

		_prepareDashboardList();

		self.updateZone(id_zone, function() {
			if (typeof callback === 'function') {
				callback(newDashboard);
			}
		});
	};

	this.addDashboardBlock = function(id_zone, dashboard_index, callback) {
		// Check zone

		if (typeof _data.zones[id_zone] !== 'object') {
			return false;

		}
		// Check dashboard
		if (typeof _data.zones[id_zone].dashboards[dashboard_index] !== 'object') {
			return false;

		}

		var newBlock = {
			type : 'sensors',
			name : 'New block',
			sensors : [],
			displayChart : true,
			displaySensor : true
		};

		_data.zones[id_zone].dashboards[dashboard_index].blocks.push(newBlock);

		_prepareDashboardList();

		self.updateZone(id_zone, function() {
			if (typeof callback === 'function') {
				callback(newBlock);
			}
		});

	};

	this.renameDashboardBlock = function(id_zone, dashboard_index, block_index, name, callback) {
		// Check zone
		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}
		// Check dashboard
		if (typeof _data.zones[id_zone].dashboards[dashboard_index] !== 'object') {
			return false;
		}
		// Check block
		if (typeof _data.zones[id_zone].dashboards[dashboard_index].blocks[block_index] !== 'object') {
			return false;
		}

		// rename the block
		_data.zones[id_zone].dashboards[dashboard_index].blocks[block_index].name = name;

		_prepareDashboardList();

		self.updateZone(id_zone, function() {
			if (typeof callback === 'function') {
				callback(newBlock);
			}
		});
	};

	this.deleteDashboardBlock = function(id_zone, dashboard_index, block_index, callback) {
		// Check zone
		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}
		// Check dashboard
		if (typeof _data.zones[id_zone].dashboards[dashboard_index] !== 'object') {
			return false;
		}
		// Check block
		if (typeof _data.zones[id_zone].dashboards[dashboard_index].blocks[block_index] !== 'object') {
			return false;
		}

		// destroy a block
		_data.zones[id_zone].dashboards[dashboard_index].blocks.splice(block_index, 1);

		_prepareDashboardList();

		self.updateZone(id_zone, function() {
			if (typeof callback === 'function') {
				callback(newBlock);
			}
		});
	};

	this.addSensorToDashboardBlock = function(id_zone, dashboard_index, block_index, id_sensor, callback) {

		var newSensor = {
			id_sensor : id_sensor,
			color : 'red'
		};

		_data.zones[id_zone].dashboards[dashboard_index].blocks[block_index].sensors.push(newSensor);

		_prepareDashboardList();

		self.updateZone(id_zone, function() {
			if (typeof callback === 'function') {
				callback(newSensor);
			}
		});
	};

	this.renameDashboard = function(id_zone, dashboard_index, name, callback) {
		// Check zone
		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}
		// Check dashboard
		if (typeof _data.zones[id_zone].dashboards[dashboard_index] !== 'object') {
			return false;
		}

		// Rename dashboard
		_data.zones[id_zone].dashboards[dashboard_index].name = name;

		self.updateZone(id_zone, callback);
	};

	this.deleteDashboard = function(id_zone, dashboard_index, callback) {
		// Check zone

		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}
		// Check dashboard
		if (typeof _data.zones[id_zone].dashboards[dashboard_index] !== 'object') {
			return false;
		}

		// Delete dashboard
		_data.zones[id_zone].dashboards.splice(dashboard_index, 1);

		self.updateZone(id_zone, callback);
	};
	this.deleteProbe = function(id_zone, probe_index, callback) {
		// Check zone

		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}

		// Check probe
		if (typeof _data.probes[probe_index] !== 'object') {
			return false;
		}

		// Delete probe
		delete _data.probes[probe_index];

		_deleteProbe(probe_index, callback);
	};
	this.deleteSensor = function(id_zone, probe_index, sensor_index, callback) {
		// Check zone

		if (typeof _data.zones[id_zone] !== 'object') {
			return false;
		}

		// Check probe
		if (typeof _data.probes[probe_index] !== 'object') {
			return false;
		}
		if (typeof _data.sensors[sensor_index] !== 'object') {
			return false;
		}

		// Delete probe
		delete _data.sensors[sensor_index];
		_deleteSensor(sensor_index, probe_index, callback)
	};
	this.renameProbe = function(id_probe, name, callback) {
		// Check probe
		if (typeof _data.probes[id_probe] !== 'object') {
			return false;
		}

		_data.probes[id_probe].name = name;

		_updateProbe(id_probe, callback);
	};

	// Change the order of the sensors
	this.sortSensors = function(sensorIds) {
		var sensorsOrder = {};
		for (var i=0; i < sensorIds.length; i++) {
			_data.sensors[sensorIds[i]].sort_order = i;
			sensorsOrder[sensorIds[i]] = i;
		}
		_updateLinks();

		// Update sensors
		_updateSensorsOrder(sensorsOrder);
	};

	this.sortDashboardBlockSensors = function(id_zone, dashboard_index, block_index, sensorIds) {
		var block = _data.zones[id_zone].dashboards[dashboard_index].blocks[block_index];

		var newSensorList = [];
		for (var i=0; i < sensorIds.length; i++) {
			for (var j=0; j < block.sensors.length; j++) {
				if (block.sensors[j].id_sensor == sensorIds[i]) {
					newSensorList.push(block.sensors[j]);
					break;
				}
			}
		}
		block.sensors = newSensorList;

		_prepareDashboardList();

		// update in database
		self.updateZone(id_zone);
	};

	/*******************/
	/* SERVER REQUESTS */
	/*******************/

	// Send an update query to the server db
	this.updateZone = function(id_zone, callback) {
		// Preparing the object for server sending
		var zone = self.getZone(id_zone);

		var xhr = new XMLHttpRequest();

		if (typeof callback === 'function') {
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4 || xhr.status != 200) {
					return;
				}

				callback();
			};
		}

		xhr.open('POST', '/update-zone', true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('zone=' + encodeURIComponent(JSON.stringify(zone)));
	};

	var _updateProbe = function(id_probe, callback) {
		// Preparing the object for server sending
		var probe = self.getProbe(id_probe);

		var xhr = new XMLHttpRequest();

		if (typeof callback === 'function') {
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4 || xhr.status != 200) {
					return;
				}

				callback();
			};
		}

		xhr.open('POST', '/update-probe', true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('probe=' + encodeURIComponent(JSON.stringify(probe)));
	};

	var _deleteProbe = function(id_probe, callback) {
		// Preparing the object for server sending



		var zone = setup.getZone(0)
		console.log('zone init:' + JSON.stringify(zone))

		for (i = 0; i < zone.dashboards.length; i++) {
			for (j = 0; j < zone.dashboards[i].blocks.length; j++) {
						//zone.dashboards[i].blocks.splice(j, 1);
						if (zone.dashboards[i].blocks[j].sensors.length > 0){
							for (k = 0; k < zone.dashboards[i].blocks[j].sensors.length  ; k++) {
								if (zone.dashboards[i].blocks[j].sensors[k].id_probe == id_probe ){
								zone.dashboards[i].blocks[j].sensors.splice(k, 1);
								}
							}
							for (k = 0; k < zone.dashboards[i].blocks[j].sensors.length  ; k++) {
								if (zone.dashboards[i].blocks[j].sensors[k].id_probe == id_probe ){
								zone.dashboards[i].blocks[j].sensors.splice(k, 1);
								//index_splice = index_splice + 1;
								}
							}
						}
			}
		}

		var zoneUpdate = zone //-probe
		var xhr = new XMLHttpRequest();

		if (typeof callback === 'function') {
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4 || xhr.status != 200) {
					return;
				}

				callback();
			};
		}
		console.log('zone : ' + JSON.stringify(zoneUpdate))
		xhr.open('POST', '/update-zone', true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('zone=' + encodeURIComponent(JSON.stringify(zoneUpdate)));

		_deleteProbeXHR(id_probe);
	};
	var _deleteProbeXHR = function(id_probe, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/delete-probe', true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('probe_id=' + encodeURIComponent(id_probe));
	}


	var _updateSensorsOrder = function(sensorsOrder, callback) {
		var xhr = new XMLHttpRequest();

		if (typeof callback === 'function') {
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4 || xhr.status != 200) {
					return;
				}

				callback();
			};
		}

		xhr.open('POST', '/update-sensors-order', true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send('sensors_order=' + encodeURIComponent(JSON.stringify(sensorsOrder)));
	};
	var _deleteSensor = function(id_sensor, id_probe, callback) {
			var zone = setup.getZone(0)
			console.log('zone init:' + JSON.stringify(zone))

			for (i = 0; i < zone.dashboards.length; i++) {
				for (j = 0; j < zone.dashboards[i].blocks.length; j++) {
							//zone.dashboards[i].blocks.splice(j, 1);
							if (zone.dashboards[i].blocks[j].sensors.length > 0){
								for (k = 0; k < zone.dashboards[i].blocks[j].sensors.length  ; k++) {
									if (zone.dashboards[i].blocks[j].sensors[k].id_sensor == id_sensor ){
									zone.dashboards[i].blocks[j].sensors.splice(k, 1);
									}
								}
								for (k = 0; k < zone.dashboards[i].blocks[j].sensors.length  ; k++) {
									if (zone.dashboards[i].blocks[j].sensors[k].id_sensor == id_sensor ){
									zone.dashboards[i].blocks[j].sensors.splice(k, 1);
									//index_splice = index_splice + 1;
									}
								}
							}
				}
			}

			var zoneUpdate = zone //-probe
			var xhr = new XMLHttpRequest();

			if (typeof callback === 'function') {
				xhr.onreadystatechange = function() {
					if (xhr.readyState != 4 || xhr.status != 200) {
						return;
					}

					callback();
				};
			}
			console.log('zone : ' + JSON.stringify(zoneUpdate))
			xhr.open('POST', '/update-zone', true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send('zone=' + encodeURIComponent(JSON.stringify(zoneUpdate)));
			wait(5000);
			var actualHash = $(location).attr('hash')
			console.log(actualHash)
			window.location.replace("/");
console.log('reload...')
		}

	_init();
};
