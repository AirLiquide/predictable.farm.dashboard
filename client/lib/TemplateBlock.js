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