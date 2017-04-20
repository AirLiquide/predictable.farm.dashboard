var LongPress = function(_element, _callback) {
	var _timer = false;
	var _fired = false;

	var _init = function() {
		_element.addEventListener('mousedown', startHandler);
		_element.addEventListener('touchstart', startHandler);
		_element.addEventListener('click', clickHandler);
		_element.addEventListener('mouseout', cancelHandler);
		_element.addEventListener('touchend', cancelHandler);
		_element.addEventListener('touchleave', cancelHandler);
		_element.addEventListener('touchcancel', cancelHandler);
	};

	var startHandler = function(e) {
		if (_timer === false) {
			_timer = setTimeout(function() {
				if (typeof _callback === 'function') {
					_callback(e);
				}

				_timer = false;
				_fired = true;
				setTimeout(function() { _fired = false }, 250);

				window.navigator.vibrate(100);
			}, 1000);
		}
		
		return false;
	};

	var cancelHandler = function(e) {
		if (_timer !== false) {
			clearTimeout(_timer);
			_timer = false;
		}

		return false;
	};

	var clickHandler = function(e) {					
		// If a longpress has just been fired, the click doesn't count
		if (_fired === true) {
			_fired = false;
			e.preventDefault();
			return false;
		}
		else {
			cancelHandler();
		}
	};

	_init();
};