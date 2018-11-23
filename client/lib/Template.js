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

var Template = function() {
    var self = this;
    var _templateBlock;

    var _blocks = {}; // Mustache templates in an indexed object 
    var _content = {}; // Data to use with the Mustache templates

    var _init = function() {
        _templateBlock = new TemplateBlock();
    };

    this.setBlocks = function(blocks) {
        _blocks = blocks;
    };

    this.addBlocks = function(blocks) {
        for (var i in blocks) {
            _blocks[i] = blocks[i];
        }
    }

    this.setContent = function(content) {
        _content = content;
    };

    this.getContent = function() {
        return _content;
    }

    this.addContent = function(content) {
        for (var i in content) {
            _content[i] = content[i];
        }
    };

    this.clearContent = function() {
        _content = {};
    };

    this.render = function(container, blockNames) {
        container.innerHTML = '';

        for (var i=0; i < blockNames.length; i++) {
            if (typeof _blocks[blockNames[i]] === 'undefined') {
                continue;
            }

            _templateBlock.setTemplate(_blocks[blockNames[i]]);
            _templateBlock.setContent(_content);
            _templateBlock.appendTo(container);
        }
    };

    _init();
};
