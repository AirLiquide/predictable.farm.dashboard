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
		// console.log('Openning table', table);
        this._table = table;
        if (!this.connection) {
            this.connect();
        }
        // TODO debug_mode to display requests

        this.lastRequest = '';
        return this;

    },

    connect: function() {
        console.warn('Connecting to cassandra (dash)');
        this.connection = new Cassandra.Client({
          contactPoints: dbConfig.defaults.hosts.value.replace(/ /g, "").split(","),
            keyspace: dbConfig.defaults.keyspace.value
        });
        this.connection.connect(function (err) {

           if (err) {

              //  console.log(err);
           } else {
               this.connected = true;

              //  console.log("Connection to cassandra database done")
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

        var request = 'SELECT ' + params.columns + ' FROM ' + params.table;

        if (typeof params.where !== 'undefined') {
            request += ' WHERE ' + params.where ;
        }

        if (!this.connection) {
            this.connect();
        }
        this.lastRequest = request;
        console.log('select request :' + request)
        var t = this
        //  console.log('****$$$$ SELECT REQUEST $$$$******  ' + request)
        this.connection.execute('select * from zone ', params.whereValues, function(err, result) {
            if (err){
              setTimeout(function(){tableWrapper.select(params); }, 5000)
            } else  {

              t.connection.execute(request, params.whereValues,{ prepare: true, fetchSize: 100000 },  params.callback);
            };
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
            var separator = ' VALUES (';
            request += params.listValue + separator + params.set + ")";

        }

        if (!this.connection) {
            this.connect();
        }
        // console.log('////****$$$$ INSERT REQUEST $$$$******////  ' + request)
        console.log('insert request :' + request)
        this.connection.execute(request, params.callback);

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
            // for (var field in params.values) {
                 request += separator + params.set ;
            //     separator = ' , ';
            // }
          }

        request += ' WHERE ' +  params.where;
         console.log("++++++++++++++++ UPDATE REQUEST: " + request)
        if (!this.connection) {
            this.connect();
        }

        paramsList = []
        console.log('update request :' + request)
        this.connection.execute(request, paramsList, params.callback);

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
        console.log('delete request :' + request)
        var request = 'DELETE FROM ' + this._table;
        if (typeof params.where !== 'undefined') {
            request += ' WHERE ' + params.where;
        }

        if (!this.connection) {
            this.connect();
        }
        console.log('delete request :' + request)
        // console.log('////****$$$$ DELETE REQUEST $$$$******////  ' + request)
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
