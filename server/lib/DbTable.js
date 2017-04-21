var MariaSql = require('mariasql');

module.exports = function(table, _keepAlive) {
	if (typeof _keepAlive === 'undefined') {
		_keepAlive = false;
	}

	// TODO debug_mode to display requests

	var DB_HOST = 'localhost';
	var DB_USER = 'predictableuser';
	var DB_PASS = 'predictable';
	var DB_BASE = 'predictabledata';

	this.lastRequest = '';

	var connection = false;
	var connect = function() {
		connection = new MariaSql({
			host : DB_HOST,
			user : DB_USER,
			password : DB_PASS,
			db : DB_BASE
		});
		connection.query('SET NAMES utf8');
	};

	var disconnect = function() {
		connection.end();
		connection = false;
	};

	// params : columns, where, whereValues, callback, keepAlive
	this.select = function(params) {
		var keepAlive = _keepAlive;
		if (typeof params.keepAlive !== 'undefined') {
			keepAlive = params.keepAlive;
		}

		if (typeof params.columns === 'undefined') {
			params.columns = '*';
		}

		var request = 'SELECT ' + params.columns + ' FROM ' + table;

		if (typeof params.where !== 'undefined') {
			request += ' WHERE ' + params.where;
		}

		if (!connection) {
			connect();
		}

		this.lastRequest = request;
		connection.query(request, params.whereValues, params.callback);

		if (!keepAlive) {
			disconnect();
		}
	};

	// params : values, callback, keepAlive
	this.insert = function(params) {
		var keepAlive = _keepAlive;
		if (typeof params.keepAlive !== 'undefined') {
			keepAlive = params.keepAlive;
		}

		var request = 'INSERT INTO ' + table;

		if (typeof params.values === 'object') {
			var separator = ' SET ';
			for (var field in params.values) {
				request += separator + field + '=:' + field;
				separator = ' , ';
			}
		}

		if (!connection) {
			connect();
		}

		connection.query(request, params.values, params.callback);

		if (!keepAlive) {
			disconnect();
		}
	};

	// params : values, where, whereValues, callback
	this.update = function(params) {
		var keepAlive = _keepAlive;
		if (typeof params.keepAlive !== 'undefined') {
			keepAlive = params.keepAlive;
		}

		var request = 'UPDATE ' + table;

		if (typeof params.values === 'object') {
			var separator = ' SET ';
			for (var field in params.values) {
				request += separator + field + '=:' + field;
				separator = ' , ';
			}
			if (typeof params.where !== 'undefined') {
				request += ' WHERE ' + params.where;

				if (typeof params.whereValues === 'object') {
					for (var field in params.whereValues) {
						params.values[field] = params.whereValues[field];
					}
				}
			}
		}

		if (!connection) {
			connect();
		}

		connection.query(request, params.values, params.callback);

		if (!keepAlive) {
			disconnect();
		}
	};

	// params : where, whereValues, callback, keepAlive
	this.delete = function(params) {
		var keepAlive = _keepAlive;
		if (typeof params.keepAlive !== 'undefined') {
			keepAlive = params.keepAlive;
		}

		var request = 'DELETE FROM ' + table;
		if (typeof params.where !== 'undefined') {
			request += ' WHERE ' + params.where;
		}

		if (!connection) {
			connect();
		}

		connection.query(request, params.whereValues, params.callback);

		if (!keepAlive) {
			disconnect();
		}
	};
};

