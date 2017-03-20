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
			this.interactionsPos[i]  = new THREE.Vector2( 0, 0, 0 );
			this.interactionsTime[i] = 0;
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

		this.createVideo();

		this.gazolineUniforms = {
			uTime: 				{ type: "f", 	value: .0 },
			uResolution: 		{ type: "v2", 	value: THREE.Vector2( this.canvas.width, this.canvas.height ) },
			uGreyscale: 		{ type: "i", 	value: config.greyscale },
			uTex: 				{ type: 't', 	value: THREE.ImageUtils.loadTexture( config.textureURL ) },
			// uTex: 				{ type: 't', 	value: this.videoTexture },
			uInteractionsPos: 	{ type: 'v2v', 	value: this.interactionsPos },
			uInteractionsTime: 	{ type: 'fv1', 	value: this.interactionsTime },
			uInteractionsIndex: { type: 'i', 	value: this.interactionsIndex },
		};

		this.planeGeometry = new THREE.PlaneBufferGeometry( 100, 50, 0 );
		this.planeMaterial = new THREE.ShaderMaterial( {
			vertexShader: require('../shaders/water.vertex.glsl'),
			fragmentShader: require('../shaders/noises/noise3D.glsl') + '#define MAX_INT '+ config.maxInteractions + require('../shaders/water.fragment.glsl'),
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
	},

	onMove: function( event ) {
		if( this.isCapting ) {
			this.addInteractionFromEvent( event );
		}
	},

	onMouseDown: function( event ) {
		this.isCapting = true;
	},

	onMouseUp: function( event ) {
		this.isCapting = false;
	},

	onResize: function() {
		this.canvas.width = this.container.offsetWidth / config.scale;
		this.canvas.height = this.container.offsetHeight / config.scale;

		this.renderer.setSize(this.canvas.width, this.canvas.height);
		this.ratio = window.innerWidth / window.innerHeight;

		this.renderer.domElement.style.transform = 'scale(' + config.scale + ')';
		this.renderer.domElement.style.transformOrigin = '0 0';

		this.camera.aspect = this.ratio;
		this.camera.updateProjectionMatrix();

		this.halfWidth = window.innerWidth * .5;
		this.halfHeight = window.innerHeight * .5;
	},

	addInteractionFromEvent: function( event ) {
		let position = getIntersectionMouse( event, this.plane, this.camera );

		if( this.interactionsIndex > config.maxInteractions ) {
			this.removeFirst();
		}

		this.interactionsPos[ this.interactionsIndex ] = new THREE.Vector2( position.x, position.y );
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
			if( this.interactionsTime[i] > 3 &&  this.interactionsTime[i] < 50 ) {
				this.removeFirst();
			}
		}

		this.gazolineUniforms.uInteractionsTime.value = this.interactionsTime;

		this.renderer.render(this.scene, this.camera);
	},

	removeFirst: function() {
		this.interactionsTime.shift()
		this.interactionsPos.shift();
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

		this.video.style.width = "200px";
		this.video.style.height = "200px";
		this.video.style.display = "block";
		this.video.style.position = "absolute";
		this.video.style.top = "0";
		this.video.style.left = "0";

		document.body.appendChild( this.video );

		this.textureVideo = new THREE.VideoTexture( this.video );
		this.textureVideo.minFilter = THREE.LinearFilter;
		this.textureVideo.magFilter = THREE.LinearFilter;
		this.textureVideo.format = THREE.RGBFormat;
	}

};