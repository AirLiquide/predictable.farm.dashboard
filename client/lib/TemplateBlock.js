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

var TemplateBlock = function() {
	var self = this;

	var _template = '';
	var _content = {};
	var _rendered = '';

	this.setTemplate = function(template) {
		_template = template;
	};


	this.setContent = function(content) {
		_content = content;
	};

	this.clearContent = function() {
		_content = {};
	};

	/**
	 * Process the template replacing the tags with the content
	 */
	this.render = function(template, content) {
		if (typeof template !== 'undefined') {
			_template = template;
		}
		if (typeof content !== 'undefined') {
			_content = content;
		}

		//Mustache.parse(template); // (optionnal, sopp)
		return _rendered = Mustache.render(_template, _content);
	};

	/**
	 * Append the TemplateBlock to the container
	 */
	this.appendTo = function(container, template, content) {
		if (typeof template !== 'undefined') {
			_template = template;
		}
		if (typeof content !== 'undefined') {
			_content = content;
		}

		container.insertAdjacentHTML( 'beforeend', self.render());
	};

	/**
	 * Insert the TemplateBlock into the container (replace all other content)
	 */
	this.insertInto = function(container, template, content) {
		if (typeof template !== 'undefined') {
			_template = template;
		}
		if (typeof content !== 'undefined') {
			_content = content;
		}

		container.innerHTML = self.render();
	};
};
