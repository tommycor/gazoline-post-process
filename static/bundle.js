(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\components\\scene.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsVector2 = require('../utils/Vector2');

var _utilsVector22 = _interopRequireDefault(_utilsVector2);

var _utilsVector3 = require('../utils/Vector3');

var _utilsVector32 = _interopRequireDefault(_utilsVector3);

var _utilsVector4 = require('../utils/Vector4');

var _utilsVector42 = _interopRequireDefault(_utilsVector4);

var _utilsConfig = require('../utils/config');

var _utilsConfig2 = _interopRequireDefault(_utilsConfig);

var _utilsRaf = require('../utils/raf');

var _utilsRaf2 = _interopRequireDefault(_utilsRaf);

var _utilsMapper = require('../utils/mapper');

var _utilsMapper2 = _interopRequireDefault(_utilsMapper);

// var PIXI = require('pixi');

module.exports = {

		init: function init() {
				this.render = this.render.bind(this);
				this.onResize = this.onResize.bind(this);
				this.onMove = this.onMove.bind(this);
				this.onClick = this.onClick.bind(this);
				this.onMouseDown = this.onMouseDown.bind(this);
				this.onMouseUp = this.onMouseUp.bind(this);

				this.interactionsPos = new Array();
				this.interactionsTime = new Array();
				this.interactionsIndex = 0;
				this.width = window.innerWidth;
				this.height = window.innerHeight;

				for (var i = 0; i < _utilsConfig2['default'].maxInteractions; i++) {
						this.interactionsPos[i] = new _utilsVector32['default'](0, 0, 0);
						this.interactionsTime[i] = 100;
				}

				this.app = new PIXI.Application();
				this.container = _utilsConfig2['default'].canvas.element;
				this.container.appendChild(this.app.view);

				//// RENDERER
				this.renderer = new PIXI.autoDetectRenderer(this.container.offsetWidth, this.container.offsetHeight);

				if (_utilsConfig2['default'].useVideo) {
						this.createVideo();
				}

				this.gazolineUniforms = {
						// uTime: 				{ type: "f", 	value: .0 },
						// uNoiseInfluence:	{ type: "f", 	value: .0 },
						// uResolution: 		{ type: "v2", 	value: new Vector2( this.width, this.height ) },
						// uGreyscale: 		{ type: "i", 	value: config.greyscale },
						// uInteractionsPos: 	{ type: 'v3v', 	value: this.interactionsPos },
						// uInteractionsTime: 	{ type: 'fv1', 	value: this.interactionsTime },
						// uInteractionsIndex: { type: 'i', 	value: this.interactionsIndex },
				};

				this.sprite = PIXI.Sprite.fromImage(_utilsConfig2['default'].useVideo ? this.videoTexture : _utilsConfig2['default'].textureURL);
				this.sprite.x = this.width * .5;
				this.sprite.y = this.height * .5;
				this.sprite.width = this.width * .5;
				this.sprite.height = this.height * .5;
				this.sprite.anchor.set(.5);

				// this.shaderCode = require('../shaders/noises/noise3D.glsl') + '#define MAX_INT ' + config.maxInteractions + require('../shaders/water.fragment.glsl');
				this.fragmentShader = require('../shaders/water.fragment.glsl');
				this.vertexShader = require('../shaders/water.fragment.glsl');
				this.filter = new PIXI.Shader('', this.fragmentShader, this.gazolineUniforms);

				console.log(this.sprite.filters, this.filter);

				this.sprite.sader[this.filter];

				this.app.stage.addChild(this.sprite);

				this.onResize();

				//// REGIST RENDERER
				_utilsRaf2['default'].register(this.render);
				_utilsRaf2['default'].start();

				// window.addEventListener( 'click', this.onClick );
				// window.addEventListener( 'pointerdown', this.onMouseDown );
				// window.addEventListener( 'pointerup', this.onMouseUp );
				// window.addEventListener( 'resize', this.onResize );
				// window.addEventListener( 'mousemove', this.onMove );
		},

		onClick: function onClick(event) {
				this.addInteractionFromEvent(event, 100);
		},

		onMove: function onMove(event) {
				this.addInteractionFromEvent(event, this.isCapting ? 100 : 1);
		},

		onMouseDown: function onMouseDown(event) {
				// this.isCapting = true;
		},

		onMouseUp: function onMouseUp(event) {
				// this.isCapting = false;
		},

		onResize: function onResize() {
				// this.width = this.container.offsetWidth / config.scale;
				// this.height = this.container.offsetHeight / config.scale;
				this.width = this.container.offsetWidth;
				this.height = this.container.offsetHeight;

				// http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
				// if( config.fit === 'height' ) {
				// 	this.fov = 2 * Math.atan( config.plane.height / ( 2 * config.camera.position.z ) ) * ( 180 / Math.PI );
				// }
				// else if( config.fit === 'width' ) {
				// 	this.fov = 2 * Math.atan( ( config.plane.width / this.ratio ) / ( 2 * config.camera.position.z ) ) * ( 180 / Math.PI );
				// }

				// this.renderer.view.style.transform = 'scale(' + config.scale + ')';
				// this.renderer.view.style.transformOrigin = '0 0';

				this.halfWidth = window.innerWidth * .5;
				this.halfHeight = window.innerHeight * .5;
		},

		addInteractionFromEvent: function addInteractionFromEvent(event, ponderation) {
				var position = getIntersectionMouse(event, this.plane, this.camera);

				if (this.interactionsIndex > _utilsConfig2['default'].maxInteractions) {
						this.removeItem(0);
				}

				if (ponderation != 100) {
						if (this.interactionsIndex > 0) {
								var delta = new THREE.Vector2(position.x, position.y).distanceTo(new THREE.Vector2(this.interactionsPos[this.interactionsIndex - 1].x, this.interactionsPos[this.interactionsIndex - 1].y));
								ponderation = 1 - delta * .5;

								if (ponderation < _utilsConfig2['default'].minPonderation) {
										ponderation = _utilsConfig2['default'].minPonderation;
								}
						} else {
								ponderation = 1;
						}
				}

				this.interactionsPos[this.interactionsIndex] = new THREE.Vector3(position.x, position.y, ponderation);
				this.interactionsTime[this.interactionsIndex] = 0;
				this.interactionsIndex++;

				this.gazolineUniforms.uInteractionsIndex.value = this.interactionsIndex;
				this.gazolineUniforms.uInteractionsPos.value = this.interactionsPos;
		},

		render: function render() {
				// let delta = .016;
				// this.gazolineUniforms.uTime.value += delta;

				// for( let i = 0 ; i < this.interactionsIndex ; i++ ) {
				// 	this.interactionsTime[i] += delta;

				// 	// GARBAGE COLLECTOR FOR INTERACTIONS ARRAYS
				// 	if( this.interactionsPos[i].z != 100 ) {
				// 		if( this.interactionsTime[i] > 3 &&  this.interactionsTime[i] < 50 ) {
				// 			this.removeItem( i );
				// 		}
				// 	}
				// 	if( this.interactionsPos[i].z == 100 ) {
				// 		if( this.interactionsTime[i] > 5 &&  this.interactionsTime[i] < 50 ) {
				// 			this.removeItem( i );
				// 		}
				// 	}
				// }

				// this.gazolineUniforms.uNoiseInfluence.value = this.interactionsIndex / 250;

				// this.gazolineUniforms.uInteractionsTime.value = this.interactionsTime;

				// if( config.useVideo ) {
				// 	this.updateVideo();
				// }

				// this.renderer.render( this.stage );
		},

		updateVideo: function updateVideo() {
				if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {

						this.videoImageContext.drawImage(this.video, 0, 0);

						if (this.videoTexture) {
								this.videoTexture.needsUpdate = true;
						}
				}
		},

		removeItem: function removeItem(index) {
				this.interactionsTime.splice(index, 1);
				this.interactionsPos.splice(index, 1);
				this.interactionsIndex--;

				this.interactionsPos.push(new THREE.Vector2(0, 0, 0));
				this.interactionsTime.push(100);

				this.gazolineUniforms.uInteractionsIndex.value = this.interactionsIndex;
				this.gazolineUniforms.uInteractionsPos.value = this.interactionsPos;
		},

		createVideo: function createVideo() {
				this.video = document.createElement('video');
				this.video.src = _utilsConfig2['default'].video.url;
				this.video.load();
				this.video.play();

				this.videoImage = document.createElement('canvas');
				this.videoImage.width = 1280;
				this.videoImage.height = 720;

				this.videoImageContext = this.videoImage.getContext('2d');

				this.videoImageContext.fillStyle = '#000000';
				this.videoImageContext.fillRect(0, 0, this.videoImage.width, this.videoImage.height);

				this.videoImage.style.width = "160px";
				this.videoImage.style.height = "90px";
				this.videoImage.style.display = "block";
				this.videoImage.style.position = "absolute";
				this.videoImage.style.top = "0";
				this.videoImage.style.left = "0";

				document.body.appendChild(this.videoImage);

				this.videoTexture = new THREE.Texture(this.videoImage);
				this.videoTexture.minFilter = THREE.LinearFilter;
				this.videoTexture.magFilter = THREE.LinearFilter;
				this.videoTexture.format = THREE.RGBFormat;
		}

};

},{"../shaders/water.fragment.glsl":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\shaders\\water.fragment.glsl","../utils/Vector2":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector2.js","../utils/Vector3":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector3.js","../utils/Vector4":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector4.js","../utils/config":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\config.js","../utils/mapper":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\mapper.js","../utils/raf":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\raf.js"}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\initialize.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _componentsScene = require('./components/scene');

var _componentsScene2 = _interopRequireDefault(_componentsScene);

window.onload = function () {

	_componentsScene2['default'].init();
};

},{"./components/scene":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\components\\scene.js"}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\shaders\\water.fragment.glsl":[function(require,module,exports){
module.exports = "\r\n// #define MAX_DIST_1 15.\r\n// #define MAX_DIST_2 25.\r\n// #define MAX_Time 10.\r\n// #define PI 3.1415926535\r\n// #define PI_2 6.2831853071\r\n\r\n// #define s_influenceSlope -.08\r\n// #define s_frequency 2.5\r\n// #define s_amplitude .2\r\n// #define s_waveLength .5\r\n// #define s_shift .08\r\n\r\n// #define b_influenceSlope -.08\r\n// #define b_frequency 4.\r\n// #define b_amplitude 4.\r\n// #define b_waveLength .2\r\n// #define b_shift 1.\r\n\r\n// uniform float uTime;\r\n// uniform float uNoiseInfluence;\r\n// uniform vec2 uResolution;\r\n// uniform bool uGreyscale;\r\n// uniform sampler2D uTex;\r\n\r\n// uniform float uInteractionsTime[ MAX_INT ];\r\n// uniform vec3 uInteractionsPos[ MAX_INT ];\r\n// uniform float uInteractionsPonderation[ MAX_INT ];\r\n// uniform int uInteractionsIndex;\r\n\r\n// varying vec2 vUv;\r\n// varying vec3 vPosition;\r\n\r\n// vec3 offset = vec3( 0., .1, .2);\r\n// vec3 offsetWave = vec3( .4, .2, .0);\r\n// vec3 noise \t= vec3(.0, .0, .0);\r\n// vec3 rgb \t= vec3(.0, .0, .0);\r\n// vec2 diff \t= vec2(.0, .0);\r\n\r\n\r\nvoid main() {\r\n\r\n\t// noise = vec3(\r\n\t// \tsnoise( vec3( vUv * 2. + offset.r, uTime * .5 ) ) * .5 * uNoiseInfluence + 1.,\r\n\t// \tsnoise( vec3( vUv * 2. + offset.g, uTime * .5 ) ) * .5 * uNoiseInfluence + 1.,\r\n\t// \tsnoise( vec3( vUv * 2. + offset.b, uTime * .5 ) ) * .5 * uNoiseInfluence + 1.\r\n\t// );\r\n\r\n\t// vec3 globalSinVal = vec3( 1. );\r\n\t// vec2 explosions = vec2( 0. );\r\n\r\n\t// vec3 sinVal = vec3( .0 );\r\n\t// float dist  = .0;\r\n\t// float influence = .0;\r\n\t// float influenceTime = .0;\r\n\t// float vitesse = .0;\r\n\r\n\t// for( int i = 0 ; i < MAX_INT ; i++ ) {\r\n\t// \tif( i >= uInteractionsIndex ) {\r\n\t// \t\tbreak;\r\n\t// \t}\r\n\r\n\t// \tsinVal = vec3( .0 );\r\n\t// \tdist = .0;\r\n\t// \tinfluence = .0;\r\n\t// \tinfluenceTime = .0;\r\n\t// \tvitesse = 1.;\r\n\r\n\r\n\t// \tif( uInteractionsPos[i].z != 100. ) {\r\n\t// \t\tdist = distance( uInteractionsPos[i].xy, vPosition.xy ) / uInteractionsPos[i].z;\r\n\r\n\t// \t\t// INFLUENCE FROM DIST + SPAWNING \r\n\t// \t\t// if( uInteractionsTime[i] < 2. && dist < MAX_DIST_1 / uInteractionsPos[i].z ) {\r\n\t// \t\tif( uInteractionsTime[i] < 2. && dist < MAX_DIST_1 / uInteractionsPos[i].z ) {\r\n\t// \t\t\tinfluence = ( dist * s_influenceSlope ) + uInteractionsTime[i] * .7 + .2;\r\n\r\n\t// \t\t\tif( influence > 1. ) { \r\n\t// \t\t\t\tinfluence = 1.;\r\n\t// \t\t\t}\r\n\r\n\t// \t\t\t// FADE OUT\r\n\t// \t\t\tinfluenceTime = ( uInteractionsTime[i] * -.5 + 1. );\r\n\r\n\t// \t\t\tif( influenceTime > .0 ) {\r\n\r\n\t// \t\t\t\tinfluence = influence * influenceTime ;\r\n\r\n\t// \t\t\t\t// influence is gonna act on simili sombrero function\r\n\t// \t\t\t\tif( influence > .0 ) {\r\n\r\n\t// \t\t\t\t\t// HERE WE ONLY CALCULATE REAL WAVE\r\n\t// \t\t\t\t\tsinVal = sin( ( dist * s_waveLength - uInteractionsTime[i] * s_frequency ) + offsetWave ) * s_amplitude + s_shift;\r\n\r\n\t// \t\t\t\t\tsinVal = sinVal * influence;\r\n\t// \t\t\t\t}\r\n\t// \t\t\t}\r\n\t// \t\t}\r\n\t// \t}\r\n\r\n\r\n\t// \telse if( uInteractionsPos[i].z == 100. ) {\r\n\t// \t\tdist = distance( uInteractionsPos[i].xy, vPosition.xy );\r\n\r\n\t// \t\t// INFLUENCE FROM DIST + SPAWNING \r\n\t// \t\tif( uInteractionsTime[i] < 4. && dist < MAX_DIST_2 ) {\r\n\t// \t\t\tinfluence = ( dist * b_influenceSlope ) + uInteractionsTime[i] * .5 + .0;\r\n\r\n\t// \t\t\tif( influence > 1. ) { \r\n\t// \t\t\t\tinfluence = 1.;\r\n\t// \t\t\t}\r\n\r\n\t// \t\t\t// FADE OUT\r\n\t// \t\t\tinfluenceTime = ( uInteractionsTime[i] * -.3 + 1. );\r\n\t// \t\t\t// influenceTime = 1. * exp( -1. * uInteractionsTime[i] );\r\n\t\t\t\t\r\n\t// \t\t\tif( influenceTime > .0 ) {\r\n\r\n\t// \t\t\t\tinfluence = influence * influenceTime ;\r\n\r\n\t// \t\t\t\t// influence is gonna act on simili sombrero function\r\n\t// \t\t\t\tif( influence > .0 ) {\r\n\r\n\t// \t\t\t\t\t// HERE WE ONLY CALCULATE REAL WAVE\r\n\t// \t\t\t\t\tsinVal = sin( ( dist * b_waveLength - uInteractionsTime[i] * b_frequency ) + offsetWave ) * b_amplitude + b_shift;\r\n\r\n\t// \t\t\t\t\tsinVal = sinVal * influence;\r\n\t// \t\t\t\t}\r\n\t// \t\t\t}\r\n\t// \t\t}\r\n\t// \t}\r\n\r\n\t// \tif( sinVal == vec3( .0 ) ) { continue; }\r\n\r\n\t// \tglobalSinVal = globalSinVal + globalSinVal * sinVal;\r\n\r\n\t// \texplosions = explosions + ( vec2( uInteractionsPos[i].xy - vPosition.xy ) ) / dist * sin( sinVal.g * PI + PI );\r\n\t// }\r\n\r\n\t// rgb = texture2D(uTex, vUv + explosions * .004 ).rgb * noise;\r\n\r\n\t// rgb = rgb * globalSinVal;\r\n\r\n\t// gl_FragColor = vec4( rgb, 1. );\r\n\tgl_FragColor = vec4( 1., 0., 1., 1. );\r\n}\r\n";

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector2.js":[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
		function Vector2(x, y) {
				_classCallCheck(this, Vector2);

				this.x = x || 0;
				this.y = y || 0;

				this.isVector2 = true;
		}

		_createClass(Vector2, [{
				key: 'set',
				value: function set(x, y) {

						this.x = x;
						this.y = y;

						return this;
				}
		}, {
				key: 'setScalar',
				value: function setScalar(scalar) {

						this.x = scalar;
						this.y = scalar;

						return this;
				}
		}, {
				key: 'setX',
				value: function setX(x) {

						this.x = x;

						return this;
				}
		}, {
				key: 'setY',
				value: function setY(y) {

						this.y = y;

						return this;
				}
		}, {
				key: 'setComponent',
				value: function setComponent(index, value) {

						switch (index) {

								case 0:
										this.x = value;break;
								case 1:
										this.y = value;break;
								default:
										throw new Error('index is out of range: ' + index);

						}

						return this;
				}
		}, {
				key: 'getComponent',
				value: function getComponent(index) {

						switch (index) {

								case 0:
										return this.x;
								case 1:
										return this.y;
								default:
										throw new Error('index is out of range: ' + index);

						}
				}
		}, {
				key: 'clone',
				value: function clone() {

						return new this.constructor(this.x, this.y);
				}
		}, {
				key: 'copy',
				value: function copy(v) {

						this.x = v.x;
						this.y = v.y;

						return this;
				}
		}, {
				key: 'add',
				value: function add(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
								return this.addVectors(v, w);
						}

						this.x += v.x;
						this.y += v.y;

						return this;
				}
		}, {
				key: 'addScalar',
				value: function addScalar(s) {

						this.x += s;
						this.y += s;

						return this;
				}
		}, {
				key: 'addVectors',
				value: function addVectors(a, b) {

						this.x = a.x + b.x;
						this.y = a.y + b.y;

						return this;
				}
		}, {
				key: 'addScaledVector',
				value: function addScaledVector(v, s) {

						this.x += v.x * s;
						this.y += v.y * s;

						return this;
				}
		}, {
				key: 'sub',
				value: function sub(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
								return this.subVectors(v, w);
						}

						this.x -= v.x;
						this.y -= v.y;

						return this;
				}
		}, {
				key: 'subScalar',
				value: function subScalar(s) {

						this.x -= s;
						this.y -= s;

						return this;
				}
		}, {
				key: 'subVectors',
				value: function subVectors(a, b) {

						this.x = a.x - b.x;
						this.y = a.y - b.y;

						return this;
				}
		}, {
				key: 'multiply',
				value: function multiply(v) {

						this.x *= v.x;
						this.y *= v.y;

						return this;
				}
		}, {
				key: 'multiplyScalar',
				value: function multiplyScalar(scalar) {

						this.x *= scalar;
						this.y *= scalar;

						return this;
				}
		}, {
				key: 'divide',
				value: function divide(v) {

						this.x /= v.x;
						this.y /= v.y;

						return this;
				}
		}, {
				key: 'divideScalar',
				value: function divideScalar(scalar) {

						return this.multiplyScalar(1 / scalar);
				}
		}, {
				key: 'min',
				value: function min(v) {

						this.x = Math.min(this.x, v.x);
						this.y = Math.min(this.y, v.y);

						return this;
				}
		}, {
				key: 'max',
				value: function max(v) {

						this.x = Math.max(this.x, v.x);
						this.y = Math.max(this.y, v.y);

						return this;
				}
		}, {
				key: 'clamp',
				value: function clamp(min, max) {

						// This function assumes min < max, if this assumption isn't true it will not operate correctly

						this.x = Math.max(min.x, Math.min(max.x, this.x));
						this.y = Math.max(min.y, Math.min(max.y, this.y));

						return this;
				}
		}, {
				key: 'clampScalar',
				value: function clampScalar() {

						var min = new Vector2();
						var max = new Vector2();

						return function clampScalar(minVal, maxVal) {

								min.set(minVal, minVal);
								max.set(maxVal, maxVal);

								return this.clamp(min, max);
						};
				}
		}, {
				key: 'clampLength',
				value: function clampLength(min, max) {

						var length = this.length();

						return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
				}
		}, {
				key: 'floor',
				value: function floor() {

						this.x = Math.floor(this.x);
						this.y = Math.floor(this.y);

						return this;
				}
		}, {
				key: 'ceil',
				value: function ceil() {

						this.x = Math.ceil(this.x);
						this.y = Math.ceil(this.y);

						return this;
				}
		}, {
				key: 'round',
				value: function round() {

						this.x = Math.round(this.x);
						this.y = Math.round(this.y);

						return this;
				}
		}, {
				key: 'roundToZero',
				value: function roundToZero() {

						this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
						this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);

						return this;
				}
		}, {
				key: 'negate',
				value: function negate() {

						this.x = -this.x;
						this.y = -this.y;

						return this;
				}
		}, {
				key: 'dot',
				value: function dot(v) {

						return this.x * v.x + this.y * v.y;
				}
		}, {
				key: 'lengthSq',
				value: function lengthSq() {

						return this.x * this.x + this.y * this.y;
				}
		}, {
				key: 'length',
				value: function length() {

						return Math.sqrt(this.x * this.x + this.y * this.y);
				}
		}, {
				key: 'lengthManhattan',
				value: function lengthManhattan() {

						return Math.abs(this.x) + Math.abs(this.y);
				}
		}, {
				key: 'normalize',
				value: function normalize() {

						return this.divideScalar(this.length());
				}
		}, {
				key: 'angle',
				value: function angle() {

						// computes the angle in radians with respect to the positive x-axis

						var angle = Math.atan2(this.y, this.x);

						if (angle < 0) angle += 2 * Math.PI;

						return angle;
				}
		}, {
				key: 'distanceTo',
				value: function distanceTo(v) {

						return Math.sqrt(this.distanceToSquared(v));
				}
		}, {
				key: 'distanceToSquared',
				value: function distanceToSquared(v) {

						var dx = this.x - v.x,
						    dy = this.y - v.y;
						return dx * dx + dy * dy;
				}
		}, {
				key: 'distanceToManhattan',
				value: function distanceToManhattan(v) {

						return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
				}
		}, {
				key: 'setLength',
				value: function setLength(length) {

						return this.multiplyScalar(length / this.length());
				}
		}, {
				key: 'lerp',
				value: function lerp(v, alpha) {

						this.x += (v.x - this.x) * alpha;
						this.y += (v.y - this.y) * alpha;

						return this;
				}
		}, {
				key: 'lerpVectors',
				value: function lerpVectors(v1, v2, alpha) {

						return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
				}
		}, {
				key: 'equals',
				value: function equals(v) {

						return v.x === this.x && v.y === this.y;
				}
		}, {
				key: 'fromArray',
				value: function fromArray(array, offset) {

						if (offset === undefined) offset = 0;

						this.x = array[offset];
						this.y = array[offset + 1];

						return this;
				}
		}, {
				key: 'toArray',
				value: function toArray(array, offset) {

						if (array === undefined) array = [];
						if (offset === undefined) offset = 0;

						array[offset] = this.x;
						array[offset + 1] = this.y;

						return array;
				}
		}, {
				key: 'fromBufferAttribute',
				value: function fromBufferAttribute(attribute, index, offset) {

						if (offset !== undefined) {

								console.warn('THREE.Vector2: offset has been removed from .fromBufferAttribute().');
						}

						this.x = attribute.getX(index);
						this.y = attribute.getY(index);

						return this;
				}
		}, {
				key: 'rotateAround',
				value: function rotateAround(center, angle) {

						var c = Math.cos(angle),
						    s = Math.sin(angle);

						var x = this.x - center.x;
						var y = this.y - center.y;

						this.x = x * c - y * s + center.x;
						this.y = x * s + y * c + center.y;

						return this;
				}
		}]);

		return Vector2;
})();

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector3.js":[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
		function Vector3(x, y, z) {
				_classCallCheck(this, Vector3);

				this.x = x || 0;
				this.y = y || 0;
				this.z = z || 0;

				this.isVector3 = true;
		}

		_createClass(Vector3, [{
				key: 'set',
				value: function set(x, y, z) {

						this.x = x;
						this.y = y;
						this.z = z;

						return this;
				}
		}, {
				key: 'setScalar',
				value: function setScalar(scalar) {

						this.x = scalar;
						this.y = scalar;
						this.z = scalar;

						return this;
				}
		}, {
				key: 'setX',
				value: function setX(x) {

						this.x = x;

						return this;
				}
		}, {
				key: 'setY',
				value: function setY(y) {

						this.y = y;

						return this;
				}
		}, {
				key: 'setZ',
				value: function setZ(z) {

						this.z = z;

						return this;
				}
		}, {
				key: 'setComponent',
				value: function setComponent(index, value) {

						switch (index) {

								case 0:
										this.x = value;break;
								case 1:
										this.y = value;break;
								case 2:
										this.z = value;break;
								default:
										throw new Error('index is out of range: ' + index);

						}

						return this;
				}
		}, {
				key: 'getComponent',
				value: function getComponent(index) {

						switch (index) {

								case 0:
										return this.x;
								case 1:
										return this.y;
								case 2:
										return this.z;
								default:
										throw new Error('index is out of range: ' + index);

						}
				}
		}, {
				key: 'clone',
				value: function clone() {

						return new this.constructor(this.x, this.y, this.z);
				}
		}, {
				key: 'copy',
				value: function copy(v) {

						this.x = v.x;
						this.y = v.y;
						this.z = v.z;

						return this;
				}
		}, {
				key: 'add',
				value: function add(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
								return this.addVectors(v, w);
						}

						this.x += v.x;
						this.y += v.y;
						this.z += v.z;

						return this;
				}
		}, {
				key: 'addScalar',
				value: function addScalar(s) {

						this.x += s;
						this.y += s;
						this.z += s;

						return this;
				}
		}, {
				key: 'addVectors',
				value: function addVectors(a, b) {

						this.x = a.x + b.x;
						this.y = a.y + b.y;
						this.z = a.z + b.z;

						return this;
				}
		}, {
				key: 'addScaledVector',
				value: function addScaledVector(v, s) {

						this.x += v.x * s;
						this.y += v.y * s;
						this.z += v.z * s;

						return this;
				}
		}, {
				key: 'sub',
				value: function sub(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
								return this.subVectors(v, w);
						}

						this.x -= v.x;
						this.y -= v.y;
						this.z -= v.z;

						return this;
				}
		}, {
				key: 'subScalar',
				value: function subScalar(s) {

						this.x -= s;
						this.y -= s;
						this.z -= s;

						return this;
				}
		}, {
				key: 'subVectors',
				value: function subVectors(a, b) {

						this.x = a.x - b.x;
						this.y = a.y - b.y;
						this.z = a.z - b.z;

						return this;
				}
		}, {
				key: 'multiply',
				value: function multiply(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.');
								return this.multiplyVectors(v, w);
						}

						this.x *= v.x;
						this.y *= v.y;
						this.z *= v.z;

						return this;
				}
		}, {
				key: 'multiplyScalar',
				value: function multiplyScalar(scalar) {

						this.x *= scalar;
						this.y *= scalar;
						this.z *= scalar;

						return this;
				}
		}, {
				key: 'multiplyVectors',
				value: function multiplyVectors(a, b) {

						this.x = a.x * b.x;
						this.y = a.y * b.y;
						this.z = a.z * b.z;

						return this;
				}
		}, {
				key: 'applyMatrix3',
				value: function applyMatrix3(m) {

						var x = this.x,
						    y = this.y,
						    z = this.z;
						var e = m.elements;

						this.x = e[0] * x + e[3] * y + e[6] * z;
						this.y = e[1] * x + e[4] * y + e[7] * z;
						this.z = e[2] * x + e[5] * y + e[8] * z;

						return this;
				}
		}, {
				key: 'applyMatrix4',
				value: function applyMatrix4(m) {

						var x = this.x,
						    y = this.y,
						    z = this.z;
						var e = m.elements;

						this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
						this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
						this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
						var w = e[3] * x + e[7] * y + e[11] * z + e[15];

						return this.divideScalar(w);
				}
		}, {
				key: 'applyQuaternion',
				value: function applyQuaternion(q) {

						var x = this.x,
						    y = this.y,
						    z = this.z;
						var qx = q.x,
						    qy = q.y,
						    qz = q.z,
						    qw = q.w;

						// calculate quat * vector

						var ix = qw * x + qy * z - qz * y;
						var iy = qw * y + qz * x - qx * z;
						var iz = qw * z + qx * y - qy * x;
						var iw = -qx * x - qy * y - qz * z;

						// calculate result * inverse quat

						this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
						this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
						this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

						return this;
				}
		}, {
				key: 'transformDirection',
				value: function transformDirection(m) {

						// input: THREE.Matrix4 affine matrix
						// vector interpreted as a direction

						var x = this.x,
						    y = this.y,
						    z = this.z;
						var e = m.elements;

						this.x = e[0] * x + e[4] * y + e[8] * z;
						this.y = e[1] * x + e[5] * y + e[9] * z;
						this.z = e[2] * x + e[6] * y + e[10] * z;

						return this.normalize();
				}
		}, {
				key: 'divide',
				value: function divide(v) {

						this.x /= v.x;
						this.y /= v.y;
						this.z /= v.z;

						return this;
				}
		}, {
				key: 'divideScalar',
				value: function divideScalar(scalar) {

						return this.multiplyScalar(1 / scalar);
				}
		}, {
				key: 'min',
				value: function min(v) {

						this.x = Math.min(this.x, v.x);
						this.y = Math.min(this.y, v.y);
						this.z = Math.min(this.z, v.z);

						return this;
				}
		}, {
				key: 'max',
				value: function max(v) {

						this.x = Math.max(this.x, v.x);
						this.y = Math.max(this.y, v.y);
						this.z = Math.max(this.z, v.z);

						return this;
				}
		}, {
				key: 'clamp',
				value: function clamp(min, max) {

						// This function assumes min < max, if this assumption isn't true it will not operate correctly

						this.x = Math.max(min.x, Math.min(max.x, this.x));
						this.y = Math.max(min.y, Math.min(max.y, this.y));
						this.z = Math.max(min.z, Math.min(max.z, this.z));

						return this;
				}
		}, {
				key: 'clampScalar',
				value: function clampScalar() {

						var min = new Vector3();
						var max = new Vector3();

						return function clampScalar(minVal, maxVal) {

								min.set(minVal, minVal, minVal);
								max.set(maxVal, maxVal, maxVal);

								return this.clamp(min, max);
						};
				}
		}, {
				key: 'clampLength',
				value: function clampLength(min, max) {

						var length = this.length();

						return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
				}
		}, {
				key: 'floor',
				value: function floor() {

						this.x = Math.floor(this.x);
						this.y = Math.floor(this.y);
						this.z = Math.floor(this.z);

						return this;
				}
		}, {
				key: 'ceil',
				value: function ceil() {

						this.x = Math.ceil(this.x);
						this.y = Math.ceil(this.y);
						this.z = Math.ceil(this.z);

						return this;
				}
		}, {
				key: 'round',
				value: function round() {

						this.x = Math.round(this.x);
						this.y = Math.round(this.y);
						this.z = Math.round(this.z);

						return this;
				}
		}, {
				key: 'roundToZero',
				value: function roundToZero() {

						this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
						this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
						this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

						return this;
				}
		}, {
				key: 'negate',
				value: function negate() {

						this.x = -this.x;
						this.y = -this.y;
						this.z = -this.z;

						return this;
				}
		}, {
				key: 'dot',
				value: function dot(v) {

						return this.x * v.x + this.y * v.y + this.z * v.z;
				}

				// TODO lengthSquared?

		}, {
				key: 'lengthSq',
				value: function lengthSq() {

						return this.x * this.x + this.y * this.y + this.z * this.z;
				}
		}, {
				key: 'length',
				value: function length() {

						return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
				}
		}, {
				key: 'lengthManhattan',
				value: function lengthManhattan() {

						return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
				}
		}, {
				key: 'normalize',
				value: function normalize() {

						return this.divideScalar(this.length());
				}
		}, {
				key: 'setLength',
				value: function setLength(length) {

						return this.multiplyScalar(length / this.length());
				}
		}, {
				key: 'lerp',
				value: function lerp(v, alpha) {

						this.x += (v.x - this.x) * alpha;
						this.y += (v.y - this.y) * alpha;
						this.z += (v.z - this.z) * alpha;

						return this;
				}
		}, {
				key: 'lerpVectors',
				value: function lerpVectors(v1, v2, alpha) {

						return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
				}
		}, {
				key: 'cross',
				value: function cross(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
								return this.crossVectors(v, w);
						}

						var x = this.x,
						    y = this.y,
						    z = this.z;

						this.x = y * v.z - z * v.y;
						this.y = z * v.x - x * v.z;
						this.z = x * v.y - y * v.x;

						return this;
				}
		}, {
				key: 'crossVectors',
				value: function crossVectors(a, b) {

						var ax = a.x,
						    ay = a.y,
						    az = a.z;
						var bx = b.x,
						    by = b.y,
						    bz = b.z;

						this.x = ay * bz - az * by;
						this.y = az * bx - ax * bz;
						this.z = ax * by - ay * bx;

						return this;
				}
		}, {
				key: 'projectOnVector',
				value: function projectOnVector(vector) {

						var scalar = vector.dot(this) / vector.lengthSq();

						return this.copy(vector).multiplyScalar(scalar);
				}
		}, {
				key: 'projectOnPlane',
				value: function projectOnPlane() {

						var v1 = new Vector3();

						return function projectOnPlane(planeNormal) {

								v1.copy(this).projectOnVector(planeNormal);

								return this.sub(v1);
						};
				}
		}, {
				key: 'reflect',
				value: function reflect() {

						// reflect incident vector off plane orthogonal to normal
						// normal is assumed to have unit length

						var v1 = new Vector3();

						return function reflect(normal) {

								return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
						};
				}
		}, {
				key: 'angleTo',
				value: function angleTo(v) {

						var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());

						// clamp, to handle numerical problems

						return Math.acos(Math.max(-1, Math.min(1, theta)));
				}
		}, {
				key: 'distanceTo',
				value: function distanceTo(v) {

						return Math.sqrt(this.distanceToSquared(v));
				}
		}, {
				key: 'distanceToSquared',
				value: function distanceToSquared(v) {

						var dx = this.x - v.x,
						    dy = this.y - v.y,
						    dz = this.z - v.z;

						return dx * dx + dy * dy + dz * dz;
				}
		}, {
				key: 'distanceToManhattan',
				value: function distanceToManhattan(v) {

						return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
				}
		}, {
				key: 'setFromSpherical',
				value: function setFromSpherical(s) {

						var sinPhiRadius = Math.sin(s.phi) * s.radius;

						this.x = sinPhiRadius * Math.sin(s.theta);
						this.y = Math.cos(s.phi) * s.radius;
						this.z = sinPhiRadius * Math.cos(s.theta);

						return this;
				}
		}, {
				key: 'setFromCylindrical',
				value: function setFromCylindrical(c) {

						this.x = c.radius * Math.sin(c.theta);
						this.y = c.y;
						this.z = c.radius * Math.cos(c.theta);

						return this;
				}
		}, {
				key: 'setFromMatrixPosition',
				value: function setFromMatrixPosition(m) {

						return this.setFromMatrixColumn(m, 3);
				}
		}, {
				key: 'setFromMatrixScale',
				value: function setFromMatrixScale(m) {

						var sx = this.setFromMatrixColumn(m, 0).length();
						var sy = this.setFromMatrixColumn(m, 1).length();
						var sz = this.setFromMatrixColumn(m, 2).length();

						this.x = sx;
						this.y = sy;
						this.z = sz;

						return this;
				}
		}, {
				key: 'setFromMatrixColumn',
				value: function setFromMatrixColumn(m, index) {

						return this.fromArray(m.elements, index * 4);
				}
		}, {
				key: 'equals',
				value: function equals(v) {

						return v.x === this.x && v.y === this.y && v.z === this.z;
				}
		}, {
				key: 'fromArray',
				value: function fromArray(array, offset) {

						if (offset === undefined) offset = 0;

						this.x = array[offset];
						this.y = array[offset + 1];
						this.z = array[offset + 2];

						return this;
				}
		}, {
				key: 'toArray',
				value: function toArray(array, offset) {

						if (array === undefined) array = [];
						if (offset === undefined) offset = 0;

						array[offset] = this.x;
						array[offset + 1] = this.y;
						array[offset + 2] = this.z;

						return array;
				}
		}, {
				key: 'fromBufferAttribute',
				value: function fromBufferAttribute(attribute, index, offset) {

						if (offset !== undefined) {

								console.warn('THREE.Vector3: offset has been removed from .fromBufferAttribute().');
						}

						this.x = attribute.getX(index);
						this.y = attribute.getY(index);
						this.z = attribute.getZ(index);

						return this;
				}
		}]);

		return Vector3;
})();

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector4.js":[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
		function Vector4(x, y, z, w) {
				_classCallCheck(this, Vector4);

				this.x = x || 0;
				this.y = y || 0;
				this.z = z || 0;
				this.w = w !== undefined ? w : 1;

				this.isVector4 = true;
		}

		_createClass(Vector4, [{
				key: 'set',
				value: function set(x, y, z, w) {

						this.x = x;
						this.y = y;
						this.z = z;
						this.w = w;

						return this;
				}
		}, {
				key: 'setScalar',
				value: function setScalar(scalar) {

						this.x = scalar;
						this.y = scalar;
						this.z = scalar;
						this.w = scalar;

						return this;
				}
		}, {
				key: 'setX',
				value: function setX(x) {

						this.x = x;

						return this;
				}
		}, {
				key: 'setY',
				value: function setY(y) {

						this.y = y;

						return this;
				}
		}, {
				key: 'setZ',
				value: function setZ(z) {

						this.z = z;

						return this;
				}
		}, {
				key: 'setW',
				value: function setW(w) {

						this.w = w;

						return this;
				}
		}, {
				key: 'setComponent',
				value: function setComponent(index, value) {

						switch (index) {

								case 0:
										this.x = value;break;
								case 1:
										this.y = value;break;
								case 2:
										this.z = value;break;
								case 3:
										this.w = value;break;
								default:
										throw new Error('index is out of range: ' + index);

						}

						return this;
				}
		}, {
				key: 'getComponent',
				value: function getComponent(index) {

						switch (index) {

								case 0:
										return this.x;
								case 1:
										return this.y;
								case 2:
										return this.z;
								case 3:
										return this.w;
								default:
										throw new Error('index is out of range: ' + index);

						}
				}
		}, {
				key: 'clone',
				value: function clone() {

						return new this.constructor(this.x, this.y, this.z, this.w);
				}
		}, {
				key: 'copy',
				value: function copy(v) {

						this.x = v.x;
						this.y = v.y;
						this.z = v.z;
						this.w = v.w !== undefined ? v.w : 1;

						return this;
				}
		}, {
				key: 'add',
				value: function add(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
								return this.addVectors(v, w);
						}

						this.x += v.x;
						this.y += v.y;
						this.z += v.z;
						this.w += v.w;

						return this;
				}
		}, {
				key: 'addScalar',
				value: function addScalar(s) {

						this.x += s;
						this.y += s;
						this.z += s;
						this.w += s;

						return this;
				}
		}, {
				key: 'addVectors',
				value: function addVectors(a, b) {

						this.x = a.x + b.x;
						this.y = a.y + b.y;
						this.z = a.z + b.z;
						this.w = a.w + b.w;

						return this;
				}
		}, {
				key: 'addScaledVector',
				value: function addScaledVector(v, s) {

						this.x += v.x * s;
						this.y += v.y * s;
						this.z += v.z * s;
						this.w += v.w * s;

						return this;
				}
		}, {
				key: 'sub',
				value: function sub(v, w) {

						if (w !== undefined) {

								console.warn('THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
								return this.subVectors(v, w);
						}

						this.x -= v.x;
						this.y -= v.y;
						this.z -= v.z;
						this.w -= v.w;

						return this;
				}
		}, {
				key: 'subScalar',
				value: function subScalar(s) {

						this.x -= s;
						this.y -= s;
						this.z -= s;
						this.w -= s;

						return this;
				}
		}, {
				key: 'subVectors',
				value: function subVectors(a, b) {

						this.x = a.x - b.x;
						this.y = a.y - b.y;
						this.z = a.z - b.z;
						this.w = a.w - b.w;

						return this;
				}
		}, {
				key: 'multiplyScalar',
				value: function multiplyScalar(scalar) {

						this.x *= scalar;
						this.y *= scalar;
						this.z *= scalar;
						this.w *= scalar;

						return this;
				}
		}, {
				key: 'applyMatrix4',
				value: function applyMatrix4(m) {

						var x = this.x,
						    y = this.y,
						    z = this.z,
						    w = this.w;
						var e = m.elements;

						this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
						this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
						this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
						this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

						return this;
				}
		}, {
				key: 'divideScalar',
				value: function divideScalar(scalar) {

						return this.multiplyScalar(1 / scalar);
				}
		}, {
				key: 'setAxisAngleFromQuaternion',
				value: function setAxisAngleFromQuaternion(q) {

						// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

						// q is assumed to be normalized

						this.w = 2 * Math.acos(q.w);

						var s = Math.sqrt(1 - q.w * q.w);

						if (s < 0.0001) {

								this.x = 1;
								this.y = 0;
								this.z = 0;
						} else {

								this.x = q.x / s;
								this.y = q.y / s;
								this.z = q.z / s;
						}

						return this;
				}
		}, {
				key: 'setAxisAngleFromRotationMatrix',
				value: function setAxisAngleFromRotationMatrix(m) {

						// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm

						// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

						var angle,
						    x,
						    y,
						    z,
						    // variables for result
						epsilon = 0.01,
						    // margin to allow for rounding errors
						epsilon2 = 0.1,
						    // margin to distinguish between 0 and 180 degrees

						te = m.elements,
						    m11 = te[0],
						    m12 = te[4],
						    m13 = te[8],
						    m21 = te[1],
						    m22 = te[5],
						    m23 = te[9],
						    m31 = te[2],
						    m32 = te[6],
						    m33 = te[10];

						if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {

								// singularity found
								// first check for identity matrix which must have +1 for all terms
								// in leading diagonal and zero in other terms

								if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {

										// this singularity is identity matrix so angle = 0

										this.set(1, 0, 0, 0);

										return this; // zero angle, arbitrary axis
								}

								// otherwise this singularity is angle = 180

								angle = Math.PI;

								var xx = (m11 + 1) / 2;
								var yy = (m22 + 1) / 2;
								var zz = (m33 + 1) / 2;
								var xy = (m12 + m21) / 4;
								var xz = (m13 + m31) / 4;
								var yz = (m23 + m32) / 4;

								if (xx > yy && xx > zz) {

										// m11 is the largest diagonal term

										if (xx < epsilon) {

												x = 0;
												y = 0.707106781;
												z = 0.707106781;
										} else {

												x = Math.sqrt(xx);
												y = xy / x;
												z = xz / x;
										}
								} else if (yy > zz) {

										// m22 is the largest diagonal term

										if (yy < epsilon) {

												x = 0.707106781;
												y = 0;
												z = 0.707106781;
										} else {

												y = Math.sqrt(yy);
												x = xy / y;
												z = yz / y;
										}
								} else {

										// m33 is the largest diagonal term so base result on this

										if (zz < epsilon) {

												x = 0.707106781;
												y = 0.707106781;
												z = 0;
										} else {

												z = Math.sqrt(zz);
												x = xz / z;
												y = yz / z;
										}
								}

								this.set(x, y, z, angle);

								return this; // return 180 deg rotation
						}

						// as we have reached here there are no singularities so we can handle normally

						var s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12)); // used to normalize

						if (Math.abs(s) < 0.001) s = 1;

						// prevent divide by zero, should not happen if matrix is orthogonal and should be
						// caught by singularity test above, but I've left it in just in case

						this.x = (m32 - m23) / s;
						this.y = (m13 - m31) / s;
						this.z = (m21 - m12) / s;
						this.w = Math.acos((m11 + m22 + m33 - 1) / 2);

						return this;
				}
		}, {
				key: 'min',
				value: function min(v) {

						this.x = Math.min(this.x, v.x);
						this.y = Math.min(this.y, v.y);
						this.z = Math.min(this.z, v.z);
						this.w = Math.min(this.w, v.w);

						return this;
				}
		}, {
				key: 'max',
				value: function max(v) {

						this.x = Math.max(this.x, v.x);
						this.y = Math.max(this.y, v.y);
						this.z = Math.max(this.z, v.z);
						this.w = Math.max(this.w, v.w);

						return this;
				}
		}, {
				key: 'clamp',
				value: function clamp(min, max) {

						// This function assumes min < max, if this assumption isn't true it will not operate correctly

						this.x = Math.max(min.x, Math.min(max.x, this.x));
						this.y = Math.max(min.y, Math.min(max.y, this.y));
						this.z = Math.max(min.z, Math.min(max.z, this.z));
						this.w = Math.max(min.w, Math.min(max.w, this.w));

						return this;
				}
		}, {
				key: 'clampScalar',
				value: function clampScalar() {

						var min = new Vector4();
						var max = new Vector4();

						return function clampScalar(minVal, maxVal) {

								min.set(minVal, minVal, minVal, minVal);
								max.set(maxVal, maxVal, maxVal, maxVal);

								return this.clamp(min, max);
						};
				}
		}, {
				key: 'floor',
				value: function floor() {

						this.x = Math.floor(this.x);
						this.y = Math.floor(this.y);
						this.z = Math.floor(this.z);
						this.w = Math.floor(this.w);

						return this;
				}
		}, {
				key: 'ceil',
				value: function ceil() {

						this.x = Math.ceil(this.x);
						this.y = Math.ceil(this.y);
						this.z = Math.ceil(this.z);
						this.w = Math.ceil(this.w);

						return this;
				}
		}, {
				key: 'round',
				value: function round() {

						this.x = Math.round(this.x);
						this.y = Math.round(this.y);
						this.z = Math.round(this.z);
						this.w = Math.round(this.w);

						return this;
				}
		}, {
				key: 'roundToZero',
				value: function roundToZero() {

						this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
						this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
						this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
						this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);

						return this;
				}
		}, {
				key: 'negate',
				value: function negate() {

						this.x = -this.x;
						this.y = -this.y;
						this.z = -this.z;
						this.w = -this.w;

						return this;
				}
		}, {
				key: 'dot',
				value: function dot(v) {

						return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
				}
		}, {
				key: 'lengthSq',
				value: function lengthSq() {

						return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
				}
		}, {
				key: 'length',
				value: function length() {

						return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
				}
		}, {
				key: 'lengthManhattan',
				value: function lengthManhattan() {

						return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
				}
		}, {
				key: 'normalize',
				value: function normalize() {

						return this.divideScalar(this.length());
				}
		}, {
				key: 'setLength',
				value: function setLength(length) {

						return this.multiplyScalar(length / this.length());
				}
		}, {
				key: 'lerp',
				value: function lerp(v, alpha) {

						this.x += (v.x - this.x) * alpha;
						this.y += (v.y - this.y) * alpha;
						this.z += (v.z - this.z) * alpha;
						this.w += (v.w - this.w) * alpha;

						return this;
				}
		}, {
				key: 'lerpVectors',
				value: function lerpVectors(v1, v2, alpha) {

						return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
				}
		}, {
				key: 'equals',
				value: function equals(v) {

						return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
				}
		}, {
				key: 'fromArray',
				value: function fromArray(array, offset) {

						if (offset === undefined) offset = 0;

						this.x = array[offset];
						this.y = array[offset + 1];
						this.z = array[offset + 2];
						this.w = array[offset + 3];

						return this;
				}
		}, {
				key: 'toArray',
				value: function toArray(array, offset) {

						if (array === undefined) array = [];
						if (offset === undefined) offset = 0;

						array[offset] = this.x;
						array[offset + 1] = this.y;
						array[offset + 2] = this.z;
						array[offset + 3] = this.w;

						return array;
				}
		}, {
				key: 'fromBufferAttribute',
				value: function fromBufferAttribute(attribute, index, offset) {

						if (offset !== undefined) {

								console.warn('THREE.Vector4: offset has been removed from .fromBufferAttribute().');
						}

						this.x = attribute.getX(index);
						this.y = attribute.getY(index);
						this.z = attribute.getZ(index);
						this.w = attribute.getW(index);

						return this;
				}
		}]);

		return Vector4;
})();

},{}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\config.js":[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Vector2 = require('./Vector2');

var _Vector22 = _interopRequireDefault(_Vector2);

var _Vector3 = require('./Vector3');

var _Vector32 = _interopRequireDefault(_Vector3);

var _Vector4 = require('./Vector4');

var _Vector42 = _interopRequireDefault(_Vector4);

var config = {
	canvas: {
		element: document.getElementById('container'),
		color: 0x000000
	},

	axisHelper: false,

	lights: {
		ambient: {
			color: 0xffffff
		}
	},

	scale: 1.5,

	greyscale: true,

	useVideo: false,

	textureURL: './assets/medias/test_2--text.jpg',

	maxInteractions: 250,

	video: {
		url: './assets/medias/test_video.mp4'
	},

	fit: 'height',

	plane: {
		width: 100,
		height: 50,
		segments: 2
	},

	minPonderation: .5
};

module.exports = config;

},{"./Vector2":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector2.js","./Vector3":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector3.js","./Vector4":"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\Vector4.js"}],"D:\\Documents\\git\\gazoline-post-process\\src\\scripts\\utils\\mapper.js":[function(require,module,exports){
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
