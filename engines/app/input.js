define(function (require) {
	var $ = require('jquery');

	var _keyMap = [];
	var _buttonMap = [];

	var LEFT_CLICK = 0;
	var RIGHT_CLICK = 2;

	window.onmousedown = function (e) {
		e.preventDefault();
		if (!_buttonMap[e.button]) {
	    	console.log('No mapping for button: ' + e.button);
	    } else {
	    	_buttonMap[e.button]();
	    }
	};

	window.onkeydown = function (e) {
	    var code = e.keyCode ? e.keyCode : e.which;
	    if (!_keyMap[code]) {
	    	console.log('No mapping for: ' + code);
	    } else {
	    	_keyMap[code]();
	    }
    };

    var mapKey = function (keyCode, eventFunction) {
    	_keyMap[keyCode] = eventFunction;
    };

    var mapMouse = function (button, eventFunction) {
    	_buttonMap[button] = eventFunction;
    };

    return {
    	mapKey: mapKey,
    	mapMouse: mapMouse,
    	LEFT_CLICK: LEFT_CLICK,
    	RIGHT_CLICK: RIGHT_CLICK
	}
});