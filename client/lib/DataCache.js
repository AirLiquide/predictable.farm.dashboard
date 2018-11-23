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

var DataCache = function() {
    var _data = {};
    /*
    _data = {
        item1 : [
            [time, value],
            [time, value],
            [time, value],
            ...
        ],
        item2 : [
            ...
        ],
        ...
    }
    */

    var _init = function() {};

    this.getData = function() {
        //console.log('DataCache.getData');
        return _data;
    };

    this.setCache = function(item, data) {
        console.log('DataCache.setCache( ' + item + ', ' + data.length + ' items )');

        _sortSerie(data);
        data = _insertMissingPoint(data);

        if (typeof _data[item] === 'undefined') {
            _data[item] = data;
        }
        else {
            _insertData(item, data);
        }
    };

    this.getCache = function(item, start, end, addLimits) {
        //console.log('DataCache.getCache(' + item + ', ' + start + ', ' + end + ' )');
        var emptyResult = function() {
            if (!addLimits) {
                return [];
            }
            else {
                return [[start, null], [end, null]];
            }
        }

        if (!_data[item]) {
            return emptyResult();
        }

        var search = _searchPeriod(_data[item], start, end);

        if (search.start == -1 && search.end == -1) {
            return emptyResult();
        }

        if (!addLimits) {
            return _data[item].slice(search.start, search.end + 1);
        }
        else {
            var result = _data[item].slice(search.start, search.end + 1);
            if (result[0] && result[0][0] > start) {
                result = [[start, null]].concat(result);
            }
            if (result[result.length-1][0] < end) {
                result = result.concat([[end, null]]);
            }
            result = 'coucou'
            return result;
        }
    };

    this.hasCache = function(item, time) {
        //console.log('DataCache.hasCache');
        return (_searchTime(_data[item], time) != -1);
    };

    this.checkMissingCache = function(item, start, end) {
        //console.log('DataCache.checkMissingCache( ' + item + ', ' + start + ', ' + end + ')');
        var serie = _data[item];

        if (!serie) {
            return {
                start : start,
                end : end
            };
        }

        // looking for the start and the end of the period in the serie
        var startIndex = _searchPrevious(serie, start);
        var endIndex = _searchNext(serie, end);

        // we've got cache around each end
        // we consider we have cache for this period
        // yes, that's not correct, but let's try this
        if (startIndex != -1 && endIndex != -1) {
            return false;
        }

        // if we've got no cache for any end
        // we consider we have no cache at all
        if (startIndex == -1 && endIndex == -1) {
            return {
                start : start,
                end : end
            };
        }

        // if we've got cache for the start but not the end
        if (startIndex != -1) {
            return {
                start : serie[startIndex][0],
                end : end
            };
        }
        else {
            return {
                start : start,
                end : serie[endIndex][0]
            };
        }
    };

    var _sortSerie = function(serie) {
        serie.sort(function(a, b) {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        });
    };

    // search for a specific time in a serie
    // returns the index of a time in a serie (or -1 if it can't be found)
    // series are always sorted, so we use a binary search
    var _searchTime = function(serie, searched) {
        if (typeof serie === 'undefined') {
            return -1;
        }

        var start = 0;
        var stop = serie.length - 1;
        var middle = Math.floor((start + stop) / 2);

        while (serie[middle][0] != searched && start < stop) {
            // adjust search area
            if (searched < serie[middle][0]) {
                stop = middle - 1;
            }
            else if (searched > serie[middle][0]) {
                start = middle + 1;
            }

            // recalculate middle
            middle = Math.floor((start + stop) / 2);
        }

        // check if the right value has been found
        if (serie[middle][0] == searched) {
            return middle;
        }

        return -1;
    };

    // search for a specific time or the next data
    // uses linear left search
    var _searchNext = function(serie, searchedTime, maxTime) {
        if (typeof serie === 'undefined') {
            return -1;
        }

        for (var i=0; i < serie.length; i++) {
            if (maxTime && serie[i][0] > maxTime) {
                return -1;
            }

            if (serie[i][0] >= searchedTime) {
                return i;
            }
        }

        return -1;
    };

    // search for a specific time or the previous data
    // uses linear right search
    var _searchPrevious = function(serie, searchedTime, minTime) {
        if (typeof serie === 'undefined') {
            return -1;
        }

        for (var i=serie.length-1; i >= 0; i--) {
            if (minTime && serie[i][0] < minTime) {
                return -1;
            }

            if (serie[i][0] <= searchedTime) {
                return i;
            }
        }

        return -1;
    };

    // search for data in a period [start, end]
    var _searchPeriod = function(serie, startTime, endTime) {
        return {
            start : _searchNext(serie, startTime, endTime),
            end : _searchPrevious(serie, endTime, startTime)
        };
    };

    // insert data into a serie (and respect chronological order)
    var _insertData = function(item, data) {
        //console.log('_insertData(' + item + ', ' + data.length + ')');
        var serie = _data[item];

        // sort the new data
        _sortSerie(data);

        // search the period of the new data in the serie
        var search = _searchPeriod(serie, data[0][0], data[data.length-1][0]);

        // remove old data
        serie.splice(search.start, (search.end - search.start)+1);

        // insert new data
        _data[item] = serie.slice(0, search.start).concat(data).concat(serie.slice(search.start));
        //serie.splice.apply(serie, [search.start, (search.end - search.start)]).concat(data));

        // sort the whole thing because I suck at this shit
        _sortSerie(_data[item]);
    };

    var _insertMissingPoint = function(data) {
        var threshold = 1000*60*15;

        var newData = [];
        var previousTime = -1;
        for (var i=0; i < data.length; i++) {
            var time = data[i][0];

            if (previousTime != -1 && (time - previousTime) > threshold) {
                newData.push([previousTime+1, null]);
            }

            newData.push(data[i]);

            previousTime = time;
        }

        return newData;
    };

    _init();
};
