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

var DashboardBlockEditor = function() {
    var self = this;

    var _container;
    var _input;
    var _dropdown;
    var _dropdownTransfer;
    var _dropdownDelete;
    var _handle;

    var _shown = false;
    var _onrename = false;
    var _ondelete = false;

    // Handling outside click for closing
    var _insideClick = false;

    // Creates the Editor HTML nodes
    var _init = function() {
        _container = document.createElement('div');
        _container.className = 'dashboard-block-editor';

        _handle = document.createElement('i');
        _handle.className = 'handle glyphicon glyphicon-resize-horizontal';

        _input = document.createElement('input');
        _input.type = 'text';

        _input.addEventListener('change', _updateName);
        _input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') self.hide();
        });

        _dropdown = document.createElement('span');
        _dropdown.className = 'dropdown';
        
        var dropdownButton = document.createElement('button');
        dropdownButton.type = 'button';
        dropdownButton.setAttribute('data-toggle', 'dropdown');
        dropdownButton.innerHTML = '<span class="caret"></span>';

        var dropdownList = document.createElement('ul');
        dropdownList.className = 'dropdown-menu';

        _dropdownTransfer = document.createElement('li');
        _dropdownTransfer.innerHTML = '<a href="javascript:;">Déplacer vers</a>';

        _dropdownDelete = document.createElement('li');
        _dropdownDelete.innerHTML = '<a href="javascript:;">Supprimer</a>';
        _dropdownDelete.addEventListener('click', function() {
            if (typeof _ondelete === 'function') _ondelete();
            _dropdown.className = 'dropdown'; // closes the dropdown
            self.hide();
        });

        dropdownList.appendChild(_dropdownTransfer);
        dropdownList.appendChild(_dropdownDelete);
        _dropdown.appendChild(dropdownButton);
        _dropdown.appendChild(dropdownList);

        _container.appendChild(_handle);
        _container.appendChild(_input);
        _container.appendChild(_dropdown);

        // Handling outside click for closing
        _container.addEventListener('click', function(e) {
            _insideClick = true;
        });

        document.addEventListener('click', function() {
            if (_insideClick) {
                _insideClick = false;
            }
            else {
                self.hide();
            }
        }); 
    };

    this.show = function(element, options) {
        console.log('DashboardBlockEditor.show');
        //console.debug(element);
        //console.debug(options);

        // If an editor is already shown somewhere, closes it
        if (!!_shown) {
            self.hide();
        }

        _shown = element;

        // Default options
        options = _initOptions(options);
        _applyOptions(options);


        // To be edited, the tab needs a name
        var name = _getCurrentName();
        if (name === false) {
            _shown = false;
            return false;
        }

        _input.value = name;

        //_shown.style.display = 'none';
        _getCurrentNameTag().style.display = 'none';
        _shown.appendChild(_container);
    };

    var _initOptions = function(options) {
        // options.onrename

        if (typeof options === 'undefined') {
            options = {};
        }

        /* functionnalities activation */
        // options.renamable = true (default)
        options.renamable = (typeof options.renamable === 'undefined' || options.renamable);

        // options.movable = true (default)
        options.movable = (typeof options.movable === 'undefined' || options.movable);

        // options.deletable = true (default)
        options.deletable = (typeof options.deletable === 'undefined' || options.deletable);

        // options.transferable = true (default)
        options.transferable = (typeof options.transferable == 'undefined' || options.transferable);

        /* callbacks */
        options.onrename = (typeof options.onrename === 'function') ? options.onrename : false;
        options.ondelete = (typeof options.ondelete === 'function') ? options.ondelete : false;
        options.ondeleteconfirm =  (typeof options.ondeleteconfirm === 'function') ? options.ondeleteconfirm : false;


        return options;
    };

    var _applyOptions = function(options) {
        if (options.renamable) {
            _input.disabled = false;
        }
        else {
            _input.disabled = true;
        }

        _onrename = options.onrename;
        _ondelete = options.ondelete;

        if (options.movable) {
            _handle.style.display = 'inline';
            _handle.className = 'handle glyphicon glyphicon-resize-horizontal';
        }
        else {
            _handle.style.display = 'none';
            //var sourceIcon = _shown.getElementsByTagName('i')[0];
            //_handle.className = sourceIcon.className;
        }

        if (options.deletable) {
            _dropdownDelete.style.display = 'block';
        }
        else {
            _dropdownDelete.style.display = 'none';
        }

        if (options.transferable) {
            _dropdownTransfer.style.display = 'block';
        }
        else {
            _dropdownTransfer.style.display = 'none';
        }

        if (!options.transferable && !options.deletable) {
            _dropdown.style.display = 'none';
        }
        else {
            _dropdown.style.display = 'inline';
        }
    };

    this.hide = function() {
        if (_shown === false) {
            return false;
        }

        //_shown.style.display = 'block';
        _getCurrentNameTag().style.display = 'inline';
        _shown.removeChild(_container);

        _shown = false;
    };

    var _getCurrentNameTag = function() {
        if (!_shown) {
            return false;
        }

        var nameTags = _shown.getElementsByClassName('name');
        if (nameTags.length === 0) {
            return false;
        }

        return nameTags[0];
    };

    var _getCurrentName = function() {
        var nameTag = _getCurrentNameTag();

        if (nameTag === false) {
            return false;
        }

        return nameTag.innerText;
    }

    var _updateName = function(name) {
        var nameTag = _getCurrentNameTag();
        if (nameTag === false) {
            return false;
        }

        nameTag.innerText = _input.value;

        if (typeof _onrename === 'function') {
            _onrename({
                name : _input.value,
                element : _shown
            });
        }
    };

    _init();
};