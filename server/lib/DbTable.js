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

        var request = 'SELECT ' + params.columns + ' FROM ' + params.table;

        if (typeof params.where !== 'undefined') {
            request += ' WHERE ' + params.where ;
        }

        if (!this.connection) {
            this.connect();
        }
        this.lastRequest = request;
        var t = this
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
        if (!this.connection) {
            this.connect();
        }

        paramsList = []
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
