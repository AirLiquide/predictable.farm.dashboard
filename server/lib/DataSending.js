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

// This class in a Singleton
var DataSending = function() {
	var _sockets = {
			// uuid : socket
		};



	this.register = function(device_id, socket) {
		// register the socket

		if (typeof socket === 'object') {
			_sockets[device_id] = socket;
		}
	};

	this.know = function(device_id) {

		return (typeof _sockets[device_id] === 'object');

	};

	this.send = function(device_id, sensor_type, sensor_value, id_sensor, sensor_mode, server, io, callback) {


		// io.on('connection', function (msg) {
		// 	console.log({
		// 		 device_id : device_id,
		// 		 sensor_id : '-',
		// 		 sensor_type : sensor_type,
		// 		 sensor_value : sensor_value,
		// 		 sensor_mode : "1"
		// 	})

		// io.emit('receive-sensor', function(msg) {
		// 	//console.log(data.device_id + ':' + data.sensor_type + " = "+data.sensor_value);
		//
		// 		msg = {
		// 				 device_id : device_id,
		// 				 sensor_id : '-',
		// 				 sensor_type : sensor_type,
		// 				 sensor_value : sensor_value,
		// 				 sensor_mode : "1"
		// 			};
		//
		// });
		// io.on('receive-sensor', function(msg) {
		// 	//console.log(data.device_id + ':' + data.sensor_type + " = "+data.sensor_value);
		//
		// 		msg = {
		// 				 device_id : device_id,
		// 				 sensor_id : '-',
		// 				 sensor_type : sensor_type,
		// 				 sensor_value : sensor_value,
		// 				 sensor_mode : "1"
		// 			};
		//
		// });

		// console.log(_sockets[device_id])
		_sockets[device_id].emit('sensor-receive',JSON.stringify({
			device_id : device_id,
			sensor_id : '-',
			sensor_type : sensor_type,
			sensor_value : sensor_value,
			sensor_mode :  sensor_mode
		}))



		// })

	}
	this.test = function() {
		// console.log(_sockets);
	};
};

var sender = new DataSending();
module.exports = sender;
