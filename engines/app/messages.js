define(function (require) {
	"use strict";

	var util = require('./util');

	var _message = 'This is private.'

	function allCaps (message) {
		return message.toUpperCase();
	}
	
	return {
		getHello: function () {
			return util.getTime();
		}
	};
});