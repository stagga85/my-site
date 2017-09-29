/**
* Simple game engine for the browser. 
*
* Andrew Stagg
*/
define(function (require) {
	'use strict';
	var $ = require('jquery');
	var log = require('print');
	var _ = require('underscore');

	var Input = require('./input');
	var Engine = require('./engine');
	var Entities = require('./entities');

	var configs = {
		canvas: 'canvas',
		background: '#3D508E',
		width: 1080,
		height: 400
	};

	Engine.createWorld(configs);

	var ground = Engine.loadImageResource({
		name: 'ground',
		url: 'engines/res/img/ground.jpg'
	});

	var dirt = Engine.loadImageResource({
		name: 'dirt',
		url: 'engines/res/img/dirt.jpg'
	});

	var box = Engine.loadImageResource({
		name: 'box',
		url: 'engines/res/img/box.png'
	});

	var concrete = Engine.loadImageResource({
		name: 'concrete',
		url: 'engines/res/img/creet.jpg'
	});

	var sprites = Engine.loadImageResource({
		name: 'sprites',
		url: 'engines/res/img/sprites.png'
	});

	var sprites = Engine.loadImageResource({
		name: 'player',
		url: 'engines/res/img/player.png'
	});

	// var explode = Engine.makeSprite({ // 512 x 157
	// 	image: 'sprites',
	// 	pos: [0, 117],
	// 	size: [39, 39],
	// 	speed: 16,
	// 	frames: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]
	// });

	// Engine.makeSprite({  // 864 x 280
	// 	image: 'player',
	// 	pos: [0, 0],
	// 	size: [108, 140],
	// 	speed: 10,
	// 	frames: [0, 1, 2, 3, 4, 5, 6, 7]
	// });

	Engine.setCursorImage({ image: box, size: 20 });

	for (var i = 20; i <= configs.width; i += 40) {
		Engine.placeBlock({
			x: i,
			y: configs.height - 20,
			width: 40,
			height: 40,
			image: 'ground',
			body: 'static'
		});
	};

	Input.mapKey(71, function () {
		Engine.toggleGrid();
	});

	// 1 - Dirt
	Input.mapKey(49, function () {
		Engine.placeBlock({
			width: 40,
			height: 40,
			image: 'ground',
			body: 'static',
			grid: true
		});
	});

	// 1 - Grass
	Input.mapKey(50, function () {
		Engine.placeBlock({
			width: 40,
			height: 40,
			image: 'ground',
			body: 'static',
			grid: true
		});
	});

	Input.mapKey(68, function () {
		Engine.toggleDebug();
		Engine.toggleDebugDraw();
	});

	// Emitter
	Input.mapKey(80, function () {
		var timedEmitter = Engine.createInterval('spew', function () {
			Engine.placeBlock({
				image: explode,
				width: 10,
				height: 10,
				particle: {
					life: 3000
				},
				vX: 0.0,
				vY: 0.0
			});
		}, 10);	
	});

	Input.mapMouse(Input.LEFT_CLICK, function () {
		var x = Engine.getCursor().x;
		var y = Engine.getCursor().y;

		if (y < configs.height - 40) {
			Engine.placeBlock({
				image: 'box',
				width: 20,
				height: 20
			});
		}
	});

	Input.mapKey(70, function () {
		Engine.placeBlock({
			image: 'box',
			width: 20,
			height: 20,
			vX: 50.0,
			vY: 0.0
		});
	});

	Input.mapMouse(Input.RIGHT_CLICK, function () {
		var x = Engine.getCursor().x;
		var y = Engine.getCursor().y;

		if (y < configs.height - 40) {
			Engine.placeBlock({
				width: 40,
				height: 40,
				image: 'dirt',
				body: 'static',
				grid: true
			});
		}
	});

});