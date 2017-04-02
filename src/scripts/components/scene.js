import * as THREE from "three";

import config 				from '../utils/config';
import raf 					from '../utils/raf';
import mapper 				from '../utils/mapper';
import getIntersectionMouse from '../utils/getIntersectionMouse';
import GlslCanvas			from 'glslCanvas';

// THREE.EffectComposer = require('three-effectcomposer')(THREE);

module.exports = {

	init: function() {
		this.render  	= this.render.bind(this);
		this.onResize	= this.onResize.bind(this);
		this.onMove		= this.onMove.bind(this);
		this.onClick	= this.onClick.bind(this);
		this.onMouseDown= this.onMouseDown.bind(this);
		this.onMouseUp	= this.onMouseUp.bind(this);

		this.clock   	= new THREE.Clock();
		this.cameraPos	= new THREE.Vector3( config.camera.position.x, config.camera.position.y, config.camera.position.z );
		this.plane   	= null;
		this.composer 	= null;
		this.interactionsPos 	= new Array();
		this.interactionsTime 	= new Array();
		this.interactionsIndex 	= 0;

		for( let i = 0 ; i < config.maxInteractions ; i++ ) {
			this.interactionsPos[i]  = new THREE.Vector3( 0, 0, 0 );
			this.interactionsTime[i] = 100;
		}
		
		this.scene 	   	= new THREE.Scene();
		this.container 	= config.canvas.element;
		this.canvas 	= document.createElement("canvas");

		this.camera 		   = new THREE.PerspectiveCamera(45, this.ratio, 15, 3000);
		this.camera.position.x = config.camera.position.x;
		this.camera.position.y = config.camera.position.y;
		this.camera.position.z = config.camera.position.z;
		this.camera.lookAt(config.camera.target);

		if ( config.axisHelper ) {
			this.axisHelper =  new THREE.AxisHelper( 5 );
			this.scene.add( this.axisHelper );
		}

		//// RENDERER
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(config.canvas.color, 1.0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		//// AMBIANT LIGHT
		this.ambient = new THREE.AmbientLight( config.lights.ambient.color );

		//// ADD OBJECTS TO SCENE
		this.scene.add( this.ambient );

		if( config.useVideo ) {
			this.createVideo();
		}

		this.gazolineUniforms = {
			uTime: 				{ type: "f", 	value: .0 },
			uNoiseInfluence:	{ type: "f", 	value: .0 },
			uResolution: 		{ type: "v2", 	value: THREE.Vector2( this.canvas.width, this.canvas.height ) },
			uGreyscale: 		{ type: "i", 	value: config.greyscale },
			uTex: 				{ type: 't', 	value: config.useVideo ? this.videoTexture : THREE.ImageUtils.loadTexture( config.textureURL ) },
			uInteractionsPos: 	{ type: 'v3v', 	value: this.interactionsPos },
			uInteractionsTime: 	{ type: 'fv1', 	value: this.interactionsTime },
			uInteractionsIndex: { type: 'i', 	value: this.interactionsIndex },
		};

		this.planeGeometry = new THREE.PlaneBufferGeometry( config.plane.width, config.plane.height, config.plane.segments, config.plane.segments );
		this.planeMaterial = new THREE.ShaderMaterial( {
			vertexShader: '#define MAX_INT '+ config.maxInteractions + require('../shaders/water.vertex.glsl'),
			fragmentShader: require('../shaders/noises/noise3D.glsl') + '#define MAX_INT ' + config.maxInteractions + require('../shaders/water.fragment.glsl'),
			uniforms: this.gazolineUniforms
		});
		this.plane = new THREE.Mesh( this.planeGeometry, this.planeMaterial );
		this.scene.add( this.plane );


		//// ADD CANVAS TO DOM
		this.container.appendChild( this.renderer.domElement );

		this.onResize();

		//// REGIST RENDERER
		raf.register( this.render );
		raf.start();

		window.addEventListener( 'click', this.onClick );
		window.addEventListener( 'pointerdown', this.onMouseDown );
		window.addEventListener( 'pointerup', this.onMouseUp );
		window.addEventListener( 'resize', this.onResize );
		window.addEventListener( 'pointermove', this.onMove );
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
		this.canvas.width = this.container.offsetWidth / config.scale;
		this.canvas.height = this.container.offsetHeight / config.scale;

		this.renderer.setSize(this.canvas.width, this.canvas.height);
		this.ratio = window.innerWidth / window.innerHeight;

		// http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
		if( config.fit === 'height' ) {
			this.fov = 2 * Math.atan( config.plane.height / ( 2 * config.camera.position.z ) ) * ( 180 / Math.PI );
		}
		else if( config.fit === 'width' ) {
			this.fov = 2 * Math.atan( ( config.plane.width / this.ratio ) / ( 2 * config.camera.position.z ) ) * ( 180 / Math.PI );
		}

		this.renderer.domElement.style.transform = 'scale(' + config.scale + ')';
		this.renderer.domElement.style.transformOrigin = '0 0';

		this.camera.aspect = this.ratio;
		this.camera.fov = this.fov;
		this.camera.updateProjectionMatrix();

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
				
				if( ponderation < .2 ) {
					ponderation = .2;
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
		let delta = this.clock.getDelta();
		this.gazolineUniforms.uTime.value += delta;

		for( let i = 0 ; i < this.interactionsIndex ; i++ ) {
			this.interactionsTime[i] += delta;

			// GARBAGE COLLECTOR FOR INTERACTIONS ARRAYS
			if( this.interactionsPos[i].z != 100 ) {
				if( this.interactionsTime[i] > 3 &&  this.interactionsTime[i] < 50 ) {
					this.removeItem( i );
				}
			}
			if( this.interactionsPos[i].z == 100 ) {
				if( this.interactionsTime[i] > 5 &&  this.interactionsTime[i] < 50 ) {
					this.removeItem( i );
				}
			}
		}


		this.gazolineUniforms.uNoiseInfluence.value = this.interactionsIndex / 250;

		this.gazolineUniforms.uInteractionsTime.value = this.interactionsTime;

		if( config.useVideo ) {
			this.updateVideo();
		}

		this.renderer.render(this.scene, this.camera);
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