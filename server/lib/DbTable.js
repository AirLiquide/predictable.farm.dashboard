var Cassandra = require('cassandra-driver');

var dbConfig = {
    defaults: {
        //hosts: {value: "predictable-server"}, //don't use localhost or 127.0.0.1
        hosts: {value: 'db'}, //oriented for docker sub-network
        port: {value: "9042"},
        keyspace: {value: "predictablefarm"}
    },
    credentials: {
        user: {type: ""},
        password: {type: ""}
    }
};


var tableWrapper = {

DB_HOST : 'localhost:9042',
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
        this.connection = new Cassandra.Client({
          contactPoints: dbConfig.defaults.hosts.value.replace(/ /g, "").split(","),
            keyspace: dbConfig.defaults.keyspace.value
        });
        this.connection.connect(function (err) {

           if (err) {

               console.log(err);
           } else {
               this.connected = true;

               console.log("Connection to cassandra database done")
           }
       });


    },


    disconnect: function() {
        console.warn('disconnecting');
        this.connection.end();
        this.connection = false;
    },



    // params : columns, where, whereValues, callback, keepAlive
    // params : columns, where, whereValues, callback, keepAlive
    select: function(params) {


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
        console.log(request)
        this.connection.execute('SELECT * FROM probe', params.whereValues, function(err, result) {
  console.log('result:' + result);
})

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

        this.connection.execute(request, params.values, params.callback);

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
        console.log(request)
        this.connection.execute(request, params.values, params.callback);
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

        this.connection.execute(request, params.whereValues, params.callback);

        // if (!keepAlive) {
        //   //  disconnect();
        // }
    }

};


module.exports = function(table, keepAlive){
	var newTableWrapper = Object.assign({},tableWrapper);
	return newTableWrapper.open(table, keepAlive);
}
