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
    var t = this;
    this.loadZones = function() {
        dbZone.select({
            table : "zone",
            callback : function(err, result) {
                // For each zone we parse the 'dashboards' field which contains JSON
                if (result){
                    for (var i=0; i < result.length; i++) {
                        result[i].dashboards = JSON.parse(result[i].dashboards);
                    }
                } else {
                    t.loadZones();
                }
                if (result){
                zoneCache = indexById(result.rows, 'id_zone');
            } else {zoneCache  = []}
                zoneTime = Date.now();
            }
        });
    };

    this.loadProbes = function() {

        dbProbe.select({
            table : "probe",
            callback : function(err, result) {
                    if (result){
                probeCache = indexById(result.rows, 'id_probe');
                } else {probeCache  = []}
                probeTime = Date.now();
            }
        });
    };

    this.loadSensors = function() {
        dbSensor.select({
            table : "sensor",
            callback : function(err, result) {
                if (result){

                sensorCache = indexById(result.rows, 'id_sensor');
            } else {sensorCache = []}
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


        if (_checkZone(zone)) {
            _saveZone(zone, callback);
        }
        else {
            callback(false);
        }
    };
    this.deleteProbe = function(probe_id, callback) {
        dbProbe.delete({
            table : 'probe',
            where :  'id_probe =' + "'" + probe_id + "'",

            callback : function(err, result) {
                if (err) {
                    // console.log('insert ERREUR*************' + err)
                    return;
                }
            }
        });



    };
    this.deleteSensor = function(sensor_id, callback) {
        dbSensor.delete({
            table : 'sensor',
            where :  'id_sensor =' + "'" + sensor_id + "'",
            callback : function(err, result) {
                if (err) {
                    // console.log('insert ERREUR*************' + err)
                    return;
                }
            }
        });



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



        dbZone.update({
            set : "dashboards = '" + zone.dashboards + "'" ,
            values : values,
            where : 'id_zone= ' + zone.id_zone,
            zoneId : zone.id_zone,
            callback : function(err, result) {
                // Refresh zones cache
                self.loadZones();

                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    };
    this.updateSensorRelay = function(device_id, sensor_type, sensor_value, id_sensor, sensor_mode, callback) {




        dbSensor.update({
            set : "last_value = " + "'" + sensor_value + "', " + "sensor_mode = "  + sensor_mode + ", last_time = " + "toTimestamp(now())" ,
            values : {
                last_value : sensor_value,
            },
            where : "id_sensor =" + "'" + id_sensor + "'" ,
            whereValues : { id_sensor : id_sensor }
        });
        callback();

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


        var whereValues = { id_probe : probe.id_probe };
        var whereWhere = 'id_probe= ' + "'" + probe.id_probe + "' "

        dbProbe.update({
            set :  "name= '" + values.name + "' ",
            what : 'saveProbe',
            values : values,
            where : whereWhere,
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
            table : 'sensor',
            set : "sort_order = " + sort_order  ,
            values : { sort_order : sort_order },
            where : 'id_sensor=' + " '"+ id_sensor + "'",
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
