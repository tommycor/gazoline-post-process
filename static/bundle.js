(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\components\\scene.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsConfig = require('../utils/config');

var _utilsConfig2 = _interopRequireDefault(_utilsConfig);

var _utilsRaf = require('../utils/raf');

var _utilsRaf2 = _interopRequireDefault(_utilsRaf);

var _utilsMapper = require('../utils/mapper');

var _utilsMapper2 = _interopRequireDefault(_utilsMapper);

module.exports = {

	init: function init() {
		//// REGIST RENDERER
		_utilsRaf2['default'].register(this.render);
		_utilsRaf2['default'].start();
		this.onResize();
		this.addControls();

		window.addEventListener('resize', this.onResize);
		window.addEventListener('mousemove', this.onMove);
		window.addEventListener('click', this.onClick);
	},

	onClick: function onClick(event) {},

	onMove: function onMove(event) {},

	onResize: function onResize() {
		this.halfWidth = window.innerWidth * .5;
		this.halfHeight = window.innerHeight * .5;
	},

	render: function render() {
		var delta = this.clock.getDelta();

		this.renderer.render(this.scene, this.camera);
	}

};

},{"../utils/config":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\config.js","../utils/mapper":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\mapper.js","../utils/raf":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\raf.js"}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\initialize.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _componentsScene = require('./components/scene');

var _componentsScene2 = _interopRequireDefault(_componentsScene);

window.onload = function () {

	_componentsScene2['default'].init();
};

},{"./components/scene":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\components\\scene.js"}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\config.js":[function(require,module,exports){
'use strict';

var config = {

	canvas: {
		element: document.getElementById('container'),
		color: 0x051023
	}
};

module.exports = config;

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\mapper.js":[function(require,module,exports){
// https://github.com/tommycor/mapperJS/blob/master/mapper-min.js
"use strict";

function mapper(val, oMin, oMax, nMin, nMax) {
  return (val - oMin) * (nMax - nMin) / (oMax - oMin) + nMin;
}

module.exports = mapper;

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\raf.js":[function(require,module,exports){
'use strict';

function Raf() {

	this.loop = this.loop.bind(this);
	this.start = this.start.bind(this);
	this.stop = this.stop.bind(this);
	this.control = this.control.bind(this);

	this.toRefresh = [];

	window.addEventListener('keydown', this.control);
}

Raf.prototype.register = function (callback) {

	this.toRefresh.push(callback);
};

Raf.prototype.start = function () {

	this.loop();
};

Raf.prototype.stop = function () {

	cancelAnimationFrame(this.request);
};

Raf.prototype.loop = function () {

	var i;
	for (i = 0; i < this.toRefresh.length; i++) {
		this.toRefresh[i]();
	}

	this.request = requestAnimationFrame(this.start);
};

Raf.prototype.control = function (event) {
	if (event.keyCode === 0 || event.keyCode === 32) {

		if (this.request != null) this.stop();else this.start();
	}
};

module.exports = new Raf();

},{}]},{},["D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\initialize.js"])

//# sourceMappingURL=bundle.js.map
