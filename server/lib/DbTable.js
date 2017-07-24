var MariaSql = require('mariasql');

var tableWrapper = {

DB_HOST : 'localhost',
DB_USER : 'predictableuser',
DB_PASS : 'predictable',
DB_BASE : 'predictabledata',


    connection: false,
	_table: '',

    open: function(table, _keepAlive) {
        if (typeof _keepAlive === 'undefined') {
            this._keepAlive = false;
        }
		console.log('Openning table', table);
        this._table = table;
        if (!this.connection) {
            this.connect();
        }
        // TODO debug_mode to display requests

        this.lastRequest = '';
        return this;

    },

    connect: function() {
        console.warn('Connecting');
        this.connection = new MariaSql({
            host : this.DB_HOST,
            user : this.DB_USER,
            password : this.DB_PASS,
            db : this.DB_BASE
        });
        this.connection.query('SET NAMES utf8');
    },


    disconnect: function() {
        console.warn('disconnecting');
        this.connection.end();
        this.connection = false;
    },



    // params : columns, where, whereValues, callback, keepAlive
    // params : columns, where, whereValues, callback, keepAlive
    select: function(params) {
        var keepAlive = this._keepAlive;
        if (typeof params.keepAlive !== 'undefined') {
            this._keepAlive = params.keepAlive;
        }

        if (typeof params.columns === 'undefined') {
            params.columns = '*';
        }

        var request = 'SELECT ' + params.columns + ' FROM ' + this._table;

        if (typeof params.where !== 'undefined') {
            request += ' WHERE ' + params.where;
        }

        if (!this.connection) {
            this.connect();
        }

        this.lastRequest = request;
        this.connection.query(request, params.whereValues, params.callback);

        if (!this._keepAlive) {
         //   disconnect();
        }
    },

// params : values, callback, keepAlive
    insert: function(params) {
        var keepAlive = this._keepAlive;
        if (typeof params.keepAlive !== 'undefined') {
            keepAlive = params.keepAlive;
        }

        var request = 'INSERT INTO ' + this._table;

        if (typeof params.values === 'object') {
            var separator = ' SET ';
            for (var field in params.values) {
                request += separator + field + '=:' + field;
                separator = ' , ';
            }
        }

        if (!this.connection) {
            this.connect();
        }

        this.connection.query(request, params.values, params.callback);

        // if (!keepAlive) {
        //   //  disconnect();
        // }
    },

// params : values, where, whereValues, callback
    update: function(params) {
        var keepAlive = this._keepAlive;
        if (typeof params.keepAlive !== 'undefined') {
            keepAlive = params.keepAlive;
        }

        var request = 'UPDATE ' + this._table;

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

        if (!this.connection) {
            this.connect();
        }

        this.connection.query(request, params.values, params.callback);
        //
        // if (!keepAlive) {
        //  //   disconnect();
        // }
    },

// params : where, whereValues, callback, keepAlive
    delete : function(params) {
        var keepAlive = this._keepAlive;
        if (typeof params.keepAlive !== 'undefined') {
            keepAlive = params.keepAlive;
        }

        var request = 'DELETE FROM ' + this._table;
        if (typeof params.where !== 'undefined') {
            request += ' WHERE ' + params.where;
        }

        if (!this.connection) {
            this.connect();
        }

        this.connection.query(request, params.whereValues, params.callback);

        // if (!keepAlive) {
        //   //  disconnect();
        // }
    }

};


module.exports = function(table, keepAlive){
	var newTableWrapper = Object.assign({},tableWrapper);
	return newTableWrapper.open(table, keepAlive);
}
