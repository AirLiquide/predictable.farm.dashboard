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