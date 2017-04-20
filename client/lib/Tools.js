var Tools = {
	addClass : function(element, className) {
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
	},

	removeClass : function(element, className) {
		if (typeof element === 'undefined') {
			return false;
		}
		
		// Si l'élément n'a pas de classe
		if (typeof element.className === 'undefined') {
			return true;
		}
		
		// Suppression de la classe
		element.className = element.className.split(' '+className).join('');
	}
};