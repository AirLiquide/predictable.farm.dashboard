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

var LiveLabel = function() {
	var self = this;
	
	var _value;
	var _elements = [];
	var _styles = [{
		format : '[value]',
		className : ''
	}];

	/**
	 * Ajoute une classe CSS à un élément
	 */
	var _elementAddClass = function(element, className) {
		if (typeof element === 'undefined') {
			return false;
		}
		
		// Si l'élément n'a pas de classe
		if (typeof element.className === 'undefined') {
			element.className = className;
			return true;
		}
		
		// Recherche de la classe dans celle déjà attribuées
		if (element.className.indexOf(className) === -1) {
			element.className += ' '+className;
		}
	};
	
	/**
	 * Retire une classe CSS d'un élément
	 */
	var _elementRemoveClass = function(element, className) {
		if (typeof element === 'undefined') {
			return false;
		}
		
		// Si l'élément n'a pas de classe
		if (typeof element.className === 'undefined') {
			return true;
		}
		
		// Suppression de la classe
		element.className = element.className.split(' '+className).join('');
	};

	this.setValue = function(value) {
		_value = value;
		self.write();
	};

	this.addElement = function(element) {
		// Keeps track of the old class name 
		element.oldClassName = element.className;

		_elements.push(element);
	};

	this.addStyle = function(style) {
		_styles.push(style);
	};

	// Check if a style can be applied
	var _checkStyle = function(style) {
		if (typeof style.minValue !== 'undefined' && style.minValue > _value) {
			return false;
		}

		if (typeof style.maxValue !== 'undefined' && style.maxValue < _value) {
			return false;
		}

		return true;
	};

	var _refreshTimeout = null;
	this.write = function(refresh) {
		if (typeof refresh === 'undefined' || refresh !== false) {
			refresh = true;
		}

		// Looking for the right style
		var style;
		for (var i in _styles) {
			if (_checkStyle(_styles[i])) {
				style = _styles[i];
			}
		}

		// Applying to all elements
		for (var i in _elements) {
			// update the data-live-label-value attribute
			_elements[i].setAttribute('data-live-label-value', _value);

			// update the labe depending of its properties
			if (typeof style.format === 'function') {
				style.format(_value, _elements[i]);
			}
			else {
				_elements[i].innerHTML = style.format.replace('[value]', _value);
				if (style.className) {
					_elements[i].className = _elements[i].oldClassName + ' ' + style.className;
				}
			}
			
			// apply the refresh effect if necessary
			if (refresh) {
				if (_refreshTimeout != null) {
					clearTimeout(_refreshTimeout);
				}

				_elementAddClass(_elements[i], 'refresh');

				_refreshTimeout = setTimeout(function() {
					_elementRemoveClass(_elements[i], 'refresh');
					_refreshTimeout = null;
				},500);
			}
		}
	};
};