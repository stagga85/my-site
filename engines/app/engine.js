define(function (require) {
	var Box2D = require('box2d');
	var render = require('./render');
	var utils = require('./engineUtils');
	var $ = require('jquery');

	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2AABB = Box2D.Collision.b2AABB;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2World = Box2D.Dynamics.b2World;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

	var _world;
	var _SCALE = 30;
	var _GRID_SIZE = 40;
	var _lastTime;
	var _globalTime;

	var _objectCounter = 0;

	var _gameObjects = [];
	var _sprites = [];
	var _imageResources = [];
	var _intervals = [];

	var _canvas;
	var _backgroundColor = '#FFFFFF';
	var _ctx;

	var _cursorX;
	var _cursorY;

	var _customCursor;

	var _drawGrid = false;
	var _debugging = false;
	var _debugDraw = false;

	function _log (message) {
		if (_debugging) {
			console.log(message);
		}
	}

	function _loop () {
		var current = Date.now();
		var delta = (current - _lastTime) / 1000.0;


		_ctx.clearRect(0, 0, _canvas.width, _canvas.height);
		_ctx.fillStyle = _backgroundColor;
		_ctx.fillRect(0, 0, _canvas.width, _canvas.height);

		_world.Step(delta, 10, 10);

		_drawCursorImage(10);

		_update(delta);
		_renderGameObjects();
		_renderSprites();

		if (_drawGrid) {
			utils.drawGrid(0.8, _GRID_SIZE, _canvas.width, _canvas.height, _ctx);
		}

		_world.ClearForces();

		_lastTime = current;
		requestAnimFrame(_loop);
	}

	function _update (delta) {
		_globalTime += delta;
		_updateSprites(delta);
	}

	function _updateSprites (delta) {
		for (element in _sprites) {
			_sprites[element].update(delta);
   		}
	}

	function _renderSprites (delta) {
		for (element in _sprites) {
			_sprites[element].render(_ctx);
   		}
	}

	function _renderGameObjects () {
		for (element in _gameObjects) {
			if (_debugDraw) {
				_world.DrawDebugData();
			} else {
    			_gameObjects[element].draw();
			}
	    	if (new Date().getTime() - _gameObjects[element].timeMade > _gameObjects[element].life && _gameObjects[element].particle) {
	    		_removeBody(_gameObjects[element].body);
	    		delete _gameObjects[element];
	    	}
   		}
	}

	function _debugDrawInit () {
	    var debugDraw = new b2DebugDraw();
	    debugDraw.SetSprite(_ctx);
	    debugDraw.SetDrawScale(30.0);
	    debugDraw.SetFillAlpha(0.5);
	    debugDraw.SetLineThickness(1.0);
	    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	   	_world.SetDebugDraw(debugDraw);
	}

	function _removeBody (bodyToDelete) {
		var body = _world.GetBodyList();
        while (body) {
            var currentBody = body;
            if (currentBody === bodyToDelete) {
                _world.DestroyBody(currentBody);
                console.log("body removed");
            }
            body = body.GetNext();
        }
	}
    
    function _updateCursorLocation (mouseMove) {
    	var canvasRect = _canvas.getBoundingClientRect();

		_cursorX = mouseMove.clientX - canvasRect.left;
    	_cursorY = mouseMove.clientY - canvasRect.top;
	}

	function _init (params) {
		_world = new b2World(new b2Vec2(0, 9.00), true);

		_canvas = document.getElementById(params.canvas);
		_canvas.addEventListener("mousemove", _updateCursorLocation, false);

		_backgroundColor = params.background;

		// Prevent default right-click browser action.
		_canvas.addEventListener('contextmenu', function(e) {
    		e.preventDefault();
   			e.stopPropagation();
		}, false);  

		_canvas.width = params.width;
		_canvas.height = params.height;

		_ctx = _canvas.getContext('2d');

		_debugDrawInit();

		_makeBoundaries();

		_globalTime = 0;
		_lastTime = Date.now();

		console.log(_sprites);
		_loop();
	}

	window.requestAnimFrame = (function(){
  		return  window.requestAnimationFrame       ||
          		window.webkitRequestAnimationFrame ||
          		window.mozRequestAnimationFrame    ||
          		function( callback ){
            		window.setTimeout(callback, 1000 / 60);
          		};
	})();

	function _spewBox () {
		_gameObjects[_objectCounter++] = new Rect(50, 50, 20, 20, b2Body.b2_dynamicBody, _objectCounter, new b2Vec2(5.0, 0), _world, true);
	}

	function placeBlock (params) {
		if (!params) {
			params = {};
		}

		var x = _cursorX;
		var y = _cursorY;

		var width = 10;
		var height = 10;

		var body = b2Body.b2_dynamicBody;

		var velocity = new b2Vec2(0.0, 0.0);

		var image;

		var particle = {};

		var grid = false;

		if (params.hasOwnProperty('image')) {

			if (params.image instanceof Sprite) {
				image = params.image;
			} else {
				image = _imageResources[params.image];
			}
		}

		if (params.hasOwnProperty('particle')) {
			particle = params.particle;
		}

		if (params.hasOwnProperty('x') && params.hasOwnProperty('y')) {
			x = params.x;
			y = params.y;
		}

		if (params.hasOwnProperty('width') && params.hasOwnProperty('height')) {
			width = params.width;
			height = params. height;
		}

		if (params.hasOwnProperty('body')) {
			if (params.body === 'static') {
				body = b2Body.b2_staticBody;
			}
		}

		if (params.hasOwnProperty('grid')) {
			if (params.grid === true) {
				x = _snapToX(x, width);
				y = _snapToY(y, height);
			}
		}

		if (params.hasOwnProperty('vX') && params.hasOwnProperty('vY')) {
			velocity = new b2Vec2(params.vX, params.vY);
		}

		_log(_gameObjects.length);
	    _gameObjects[_objectCounter++] = new Rect(x, y, width, height, body, _objectCounter, velocity, _world, particle, image);
	}

	function _makeBody (width, height, pX, pY, type, name, vel) {
	    var bodyDef = new b2BodyDef;
	    bodyDef.type = type;
	    bodyDef.userData = name;
	    bodyDef.position.Set(pX/_SCALE,pY/_SCALE);

	    var polygonShape = new b2PolygonShape;
	    polygonShape.SetAsBox(width/2/_SCALE,height/2/_SCALE);

	    var fixtureDef = new b2FixtureDef;
	    fixtureDef.density = 4.0;
	    fixtureDef.friction = 0.2;
	    fixtureDef.restitution = 0.1;
	    fixtureDef.shape = polygonShape;

	    // Adding the body to the Box2D world.
	    var body = _world.CreateBody(bodyDef);
	    body.SetLinearVelocity(vel);
	    body.CreateFixture(fixtureDef);

	}

	function _makeBoundaries() {
	    // Floor
	    _makeBody(_canvas.width,30,_canvas.width/2,_canvas.height+15,b2Body.b2_staticBody, "wall");

	    // Ceiling
	    //_makeBody(_canvas.width,30,_canvas.width/2,0,b2Body.b2_staticBody, "wall");

	    // Left
	    _makeBody(30,_canvas.height,-15,_canvas.height/2,b2Body.b2_staticBody, "wall");

	    // Right
	    _makeBody(30,_canvas.height,_canvas.width + 15,_canvas.height/2,b2Body.b2_staticBody, "wall");
	}

	function Circle (x, y, density, radius, restitution, friction) {
		var bodyDef = new b2BodyDef;
	    bodyDef.type = b2Body.b2_dynamicBody;
	    //bodyDef.userData = name;
	    bodyDef.position.Set(x/_SCALE, y/_SCALE);

	    var circleShape = new b2CircleShape;
	    circleShape.SetRadius(1);

	    var fixtureDef = new b2FixtureDef;
	    fixtureDef.density = 4.0;
	    fixtureDef.friction = 0.2;
	    fixtureDef.restitution = 0.6;
	    fixtureDef.shape = circleShape;

	    // Adding the body to the Box2D world.
	    var body = _world.CreateBody(bodyDef);
	    //body.SetLinearVelocity(vel);
	    body.CreateFixture(fixtureDef);
	}

	function Rect (x, y, width, height, type, name, vel, world, particle, image) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.particle = false;

		if (particle) {
			if (particle.hasOwnProperty('life')) {
				this.timeMade = new Date().getTime();
				this.life = particle.life;
				this.particle = true;
			}
		} 

		this.image = image;

		this.bodyDef = new b2BodyDef;
		this.bodyDef.type = type;
		this.name = name;
		this.bodyDef.userData = name;
		this.bodyDef.position.Set(x / _SCALE, y / _SCALE);

		this.polygonShape = new b2PolygonShape;
		this.polygonShape.SetAsBox(width / 2 / _SCALE, height / 2 / _SCALE);

		this.fixtureDef = new b2FixtureDef;
		this.fixtureDef.density = 4.0;
		this.fixtureDef.friction = 0.2;
		this.fixtureDef.restitution = 0.1;
		this.fixtureDef.shape = this.polygonShape;
	 
		this.body = world.CreateBody(this.bodyDef);
		this.body.SetLinearVelocity(vel);
		this.body.CreateFixture(this.fixtureDef);
	}

	Rect.prototype.draw = function() {
		var position = this.body.GetPosition();
	 	var angle = this.body.GetAngle();

	 	_ctx.save();
	 	_ctx.translate(position.x * _SCALE, position.y * _SCALE);

	    if (_debugging) {
	        _ctx.font = "10px Arial";
	        _ctx.fillStyle = "grey";
	        _ctx.fillText(this.name, position.x - this.width * 2, position.y - this.height * 2);
	    } 

	 	_ctx.rotate(angle);

	 	if (this.image == null) {
	 		_ctx.globalAlpha = 0.5;
	 		_ctx.beginPath();
	 		_ctx.rect(this.width / 2, this.height / 2, -this.width, -this.height);
	        
			_ctx.fillStyle = "red";
			_ctx.fill();
			_ctx.closePath();
			_ctx.globalAlpha = 1.0;
	 	} else {
	 		if (this.image instanceof Sprite) {
	 			console.log(this.image.id);
	 			this.image.render(_ctx);
	 		} else {
	 			_ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
	 		}
	 	}
	    
		_ctx.restore();
	};

	function Sprite (image, pos, size, speed, frames, dir, once) {
	    this.pos = pos;
	    this.size = size;
	    this.speed = typeof speed === 'number' ? speed : 0;
	    this.frames = frames;
	    this._index = 0;
	    this.image = _imageResources[image];
	    this.dir = dir || 'horizontal';
	    this.once = once;
	}

	function makeSprite (params) {
		_sprites[params.name] = new Sprite(params.image, params.pos, params.size, params.speed, params.frames);
		return _sprites[params.name];
	}

	Sprite.prototype.update = function (dt) {
    	this._index += this.speed*dt;
	};

	Sprite.prototype.render = function (ctx) {
	    var frame;

	    if (this.speed > 0) {
	        var max = this.frames.length;
	        var idx = Math.floor(this._index);
	        frame = this.frames[idx % max];

	        if (this.once && idx >= max) {
	            this.done = true;
	            return;
	        }
	    } else {
	        frame = 0;
	    }


	    var x = this.pos[0];
	    var y = this.pos[1];

	    if (this.dir == 'vertical') {
	        y += frame * this.size[1];
	    } else {
	        x += frame * this.size[0];
	    }

	    ctx.drawImage(this.image,
	                  x, y,
	                  this.size[0], this.size[1],
	                  - this.size[0] / 2, - this.size[1] / 2,
	                  this.size[0], this.size[1]);
	}

	function _snapToX(xCoord, size) {
	    for (var i = 0; i < _canvas.width; i += size) {
	        if (xCoord >= i && xCoord <= i + size) {
	            return i + _GRID_SIZE / 2;
	        }
	    }
	}

	function _snapToY(yCoord, size) {
	    for (var i = 0; i < _canvas.width; i += size) {
	        if (yCoord >= i && yCoord <= i + size) {
	            return i + _GRID_SIZE / 2;
	        }
	    }
	}

	function createInterval (name, action, time) {
		if (!_intervals[name]) {
			_intervals[name] = setInterval(action, time);
		} else {
			clearInterval(_intervals[name]);
			delete _intervals[name];
		}
	}

	var createWorld = function (params) {
		_init(params);
	};

	var toggleGrid = function () {
		_drawGrid = !_drawGrid;
	};

	var toggleDebug = function () {
		_debugging = !_debugging;
	};

	var toggleDebugDraw = function () {
		_debugDraw = !_debugDraw;
	};

	function getCursor () {
		return {
			x: _cursorX,
			y: _cursorY
		};
	}

	function setCursorImage (params) {
		if (params) {
			_customCursor = params;
			_canvas.style.cursor = 'none';
		} else {
			_canvas.style.cursor = 'pointer';
			_customCursor = null;
		}
	}

	function _drawCursorImage () {
		if (_customCursor) {
			var size = _customCursor.size;
			_ctx.globalAlpha = 0.5;
        	_ctx.drawImage(_customCursor.image, _cursorX - size / 2, _cursorY - size / 2, size, size);
        	_ctx.globalAlpha = 1;
		}
	}

	var loadImageResource = function (params) {
		_imageResources[params.name] = new Image();
		_imageResources[params.name].src = params.url;

		return _imageResources[params.name];
	};

	return {
		createWorld: createWorld,
		toggleGrid: toggleGrid,
		toggleDebug: toggleDebug,
		toggleDebugDraw: toggleDebugDraw,
		placeBlock: placeBlock,
		loadImageResource: loadImageResource,
		getCursor: getCursor,
		createInterval: createInterval,
		setCursorImage: setCursorImage,
		makeSprite: makeSprite
	};
});