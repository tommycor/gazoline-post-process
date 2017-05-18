import Vector2 from '../utils/Vector2';
import Vector3 from '../utils/Vector3';
import Vector4 from '../utils/Vector4';

import config 				from '../utils/config';
import raf 					from '../utils/raf';
import mapper 				from '../utils/mapper';

// var PIXI = require('pixi');

module.exports = {

	init: function() {
		this.render  	= this.render.bind(this);
		this.onResize	= this.onResize.bind(this);
		this.onMove		= this.onMove.bind(this);
		this.onClick	= this.onClick.bind(this);
		this.onMouseDown= this.onMouseDown.bind(this);
		this.onMouseUp	= this.onMouseUp.bind(this);

		this.interactionsPos 	= new Array();
		this.interactionsTime 	= new Array();
		this.interactionsIndex 	= 0;
		this.width 	= window.innerWidth;
		this.height = window.innerHeight;

		for( let i = 0 ; i < config.maxInteractions ; i++ ) {
			this.interactionsPos[i]  = new Vector3( 0, 0, 0 );
			this.interactionsTime[i] = 100;
		}
		
		this.app 	   	= new PIXI.Application();
		this.container 	= config.canvas.element;
		this.container.appendChild( this.app.view );

		//// RENDERER
		this.renderer = new PIXI.autoDetectRenderer(this.container.offsetWidth, this.container.offsetHeight);

		if( config.useVideo ) {
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

		this.sprite 	= PIXI.Sprite.fromImage( config.useVideo ? this.videoTexture : config.textureURL );
		this.sprite.x 	= this.width * .5;
		this.sprite.y 	= this.height * .5;
		this.sprite.width 	= this.width * .5;
		this.sprite.height 	= this.height * .5;
		this.sprite.anchor.set( .5 );

		// this.shaderCode = require('../shaders/noises/noise3D.glsl') + '#define MAX_INT ' + config.maxInteractions + require('../shaders/water.fragment.glsl');
		this.fragmentShader = require('../shaders/water.fragment.glsl');
		this.vertexShader = require('../shaders/water.fragment.glsl');
		this.filter = new PIXI.Shader('', this.fragmentShader, this.gazolineUniforms);

		console.log(this.sprite.filters, this.filter)



		this.sprite.sader[ this.filter ];

		this.app.stage.addChild( this.sprite );

		this.onResize();

		//// REGIST RENDERER
		raf.register( this.render );
		raf.start();

		// window.addEventListener( 'click', this.onClick );
		// window.addEventListener( 'pointerdown', this.onMouseDown );
		// window.addEventListener( 'pointerup', this.onMouseUp );
		// window.addEventListener( 'resize', this.onResize );
		// window.addEventListener( 'mousemove', this.onMove );
	},

	onClick: function( event ) {
		this.addInteractionFromEvent( event, 100 );
	},

	onMove: function( event ) {
		this.addInteractionFromEvent( event, this.isCapting ? 100 : 1 );
	},

	onMouseDown: function( event ) {
		// this.isCapting = true;
	},

	onMouseUp: function( event ) {
		// this.isCapting = false;
	},

	onResize: function() {
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

	addInteractionFromEvent: function( event, ponderation ) {
		let position = getIntersectionMouse( event, this.plane, this.camera );

		if( this.interactionsIndex > config.maxInteractions ) {
			this.removeItem(0);
		}

		if( ponderation != 100 ){
			if( this.interactionsIndex > 0 ) {
				let delta = new THREE.Vector2( position.x, position.y ).distanceTo( new THREE.Vector2( this.interactionsPos[ this.interactionsIndex - 1 ].x, this.interactionsPos[ this.interactionsIndex - 1 ].y ) );
				ponderation = 1 - delta *.5;
				
				if( ponderation < config.minPonderation ) {
					ponderation = config.minPonderation;
				}
			}
			else {
				ponderation = 1;
			}
		}


		this.interactionsPos[ this.interactionsIndex ] = new THREE.Vector3( position.x, position.y, ponderation);
		this.interactionsTime[ this.interactionsIndex ] = 0;
		this.interactionsIndex++;
		
		this.gazolineUniforms.uInteractionsIndex.value = this.interactionsIndex;
		this.gazolineUniforms.uInteractionsPos.value = this.interactionsPos;
	},

	render: function() {
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

	updateVideo: function() {
		if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {

			this.videoImageContext.drawImage( this.video, 0, 0 );

			if ( this.videoTexture ) {
				this.videoTexture.needsUpdate = true;
			}
		}
	},

	removeItem: function( index ) {
		this.interactionsTime.splice( index, 1)
		this.interactionsPos.splice( index, 1);
		this.interactionsIndex--;

		this.interactionsPos.push( new THREE.Vector2( 0, 0, 0 ) );
		this.interactionsTime.push( 100 );

		this.gazolineUniforms.uInteractionsIndex.value = this.interactionsIndex;
		this.gazolineUniforms.uInteractionsPos.value = this.interactionsPos;
	},

	createVideo: function() {
		this.video = document.createElement( 'video' );
		this.video.src = config.video.url;
		this.video.load();
		this.video.play();

		this.videoImage = document.createElement( 'canvas' );
		this.videoImage.width = 1280;
		this.videoImage.height = 720;
		
		this.videoImageContext = this.videoImage.getContext( '2d' );

		this.videoImageContext.fillStyle = '#000000';
		this.videoImageContext.fillRect( 0, 0, this.videoImage.width, this.videoImage.height );

		this.videoImage.style.width = "160px";
		this.videoImage.style.height = "90px";
		this.videoImage.style.display = "block";
		this.videoImage.style.position = "absolute";
		this.videoImage.style.top = "0";
		this.videoImage.style.left = "0";

		document.body.appendChild( this.videoImage );

		this.videoTexture = new THREE.Texture( this.videoImage );
		this.videoTexture.minFilter = THREE.LinearFilter;
		this.videoTexture.magFilter = THREE.LinearFilter;
		this.videoTexture.format = THREE.RGBFormat;
	}

};