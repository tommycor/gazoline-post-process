import * as THREE 		from "three";
// import { EffectComposer, RenderPass } from "postprocessing";
var EffectComposer = require('three-effectcomposer')(THREE);



import config 			from '../utils/config';
import raf 				from '../utils/raf';
import mapper 			from '../utils/mapper';
import GlslCanvas		from 'glslCanvas';

// THREE.EffectComposer = require('three-effectcomposer')(THREE);

module.exports = {

	init: function() {
		this.render  	= this.render.bind(this);
		this.onResize	= this.onResize.bind(this);
		this.onMove		= this.onMove.bind(this);
		this.onClick	= this.onClick.bind(this);

		this.clock   	= new THREE.Clock();
		this.cameraPos	= new THREE.Vector3( config.camera.position.x, config.camera.position.y, config.camera.position.z );
		this.plane   	= null;
		this.composer 	= null;
		
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
			u_time: { type: "f", value: .0 },
			u_resolution: { type: "v2", value: THREE.Vector2( this.canvas.width, this.canvas.height ) },
			u_greyscale: { type: "i", value: config.greyscale },
			u_tex: { type: 't', value: THREE.ImageUtils.loadTexture( config.textureURL ) }
		};

		this.planeGeometry = new THREE.PlaneBufferGeometry( 100, 50, 0 );
		this.planeMaterial = new THREE.ShaderMaterial( {
			color: 0xffffff,
			vertexShader: require('../shaders/water.vertex.glsl'),
			fragmentShader: require('../shaders/noises/noise3D.glsl') + require('../shaders/water.fragment.glsl'),
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
	},

	onClick: function( event ) {
		console.log( this.gazolineShader )
	},

	onMove: function( event ) {
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

	render: function() {
		this.planeMaterial.uniforms['u_time'].value = this.clock.getElapsedTime();

		this.renderer.render(this.scene, this.camera);
	}

};