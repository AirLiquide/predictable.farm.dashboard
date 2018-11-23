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

var DataKiosk = function() {
	var self = this;

	var _data = {};
	var _subscriptions = [];

	this.subscribe = function(names, callback, retrieve) {
		if (typeof names === 'string') {
			names = [names];
		}

		// Create a list of the subscribed values indexed by name (for quick looking)
		var namesIndex = {};
		for (var i=0; i < names.length; i++) {
			namesIndex[names[i]] = true;
		}

		_subscriptions.push({
			names : names,
			namesIndex : namesIndex,
			callback : callback
		});

		if (typeof retrieve !== 'undefined' && retrieve === true) {
			callback(self.retrieve(names), false);
		}
	};

	this.unsubscribeAll = function() {
		_subscriptions = [];
	};

	this.write = function(values) {
		for (var i=0; i < values.length; i++) {
			var value = values[i];

			_data[value.id] = value;
			_data[value.id].published = false;
		}
	};

	this.publish = function() {
		// List unpublished data
		var publishedList = [];
		for (var name in _data) {
			if (!_data[name].published) {
				publishedList.push(name);
				_data[name].published = true;
			}
		}

		// For each subscription, check if it has been triggered by a publication
		for (var i=0; i < _subscriptions.length; i++) {
			var subscription = _subscriptions[i];
			var triggered = false;

			// Iterate through new publications to check if the subscription was triggered
			for (var j=0; j < publishedList.length; j++) {
				var published = publishedList[j];
				if (typeof subscription.namesIndex[published] !== 'undefined') {
					triggered = true;
					break;
				}

				var publishedSplit = published.split(':');
				if (typeof subscription.namesIndex[publishedSplit[0]] !== 'undefined') {
					triggered = true;
					break;
				}
			}

			// If the subscription is triggered, call it with all the data it wants
			if (triggered) {
				subscription.callback(self.retrieve(subscription.names));
			}
		}
	};

	this.retrieve = function(names) {
		var result = {};

		for (var i=0; i < names.length; i++) {
			result[names[i]] = _data[names[i]];
		}

		return result;
	};

	this.retrieveAll = function() {
		return _data;
	}
};
