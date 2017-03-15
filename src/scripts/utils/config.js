import * as THREE from "three";

var config = {	
	canvas: {
		element : document.getElementById('container'),
		color : 0x051023
	},
		
	camera: {
		position : new THREE.Vector3(0, 0, 50),
		target : new THREE.Vector3(0, 0, 0)
	},

	axisHelper: false,
	
	lights: {
		ambient: {
			color : 0xffffff
		} 
	},

	greyscale: true,

	textureURL: './assets/medias/test_1.jpg',

	maxInteractions: 200
}


module.exports = config;