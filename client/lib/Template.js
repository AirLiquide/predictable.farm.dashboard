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

	this.setContent	= function(content) {
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