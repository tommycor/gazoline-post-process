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

		this.gazolineUniforms = {
			uTime: 				{ type: "f", 	value: .0 },
			uResolution: 		{ type: "v2", 	value: THREE.Vector2( this.canvas.width, this.canvas.height ) },
			uGreyscale: 		{ type: "i", 	value: config.greyscale },
			uTex: 				{ type: 't', 	value: THREE.ImageUtils.loadTexture( config.textureURL ) },
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
		window.addEventListener( 'mousedown', this.onMouseDown );
		window.addEventListener( 'mouseup', this.onMouseUp );
		window.addEventListener( 'resize', this.onResize );
		window.addEventListener( 'mousemove', this.onMove );
	},

	onClick: function( event ) {
	},

	onMove: function( event ) {
		if( this.isCapting ) {
			this.addInteractionFromEvent( event );
		}
	},

	onMouseDown: function() {
		this.isCapting = true;
	},

	onMouseUp: function() {
		this.isCapting = false;
	},

	onResize: function() {
		this.canvas.width = this.container.offsetWidth;
		this.canvas.height = this.container.offsetHeight;

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.ratio = window.innerWidth / window.innerHeight;

		this.camera.aspect = this.ratio;
		this.camera.updateProjectionMatrix();

		this.halfWidth = window.innerWidth * .5;
		this.halfHeight = window.innerHeight * .5;
	},

	addInteractionFromEvent: function() {
		let position = getIntersectionMouse( event, this.plane, this.camera );

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
		}

		this.gazolineUniforms.uInteractionsTime.value = this.interactionsTime;

		this.renderer.render(this.scene, this.camera);
	}

};