define(function (require) {
	var $ = require('jquery');

	
	return {
		getTime: function () {
			return new Date().getTime();
		},

		animateHeading: function () {
			$('#heading').animate({"font-size":"24px"});
		}

	};
});