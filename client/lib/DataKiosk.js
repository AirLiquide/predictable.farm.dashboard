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
