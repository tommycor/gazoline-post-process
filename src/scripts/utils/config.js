
import * as THREE from "three";

var config = {	
	canvas: {
		element : document.getElementById('container'),
		color : 0x000000
	},
		
	camera: {
		position : new THREE.Vector3(0, 0, 70),
		target : new THREE.Vector3(0, 0, 0)
	},

	axisHelper: false,
	
	lights: {
		ambient: {
			color : 0xffffff
		} 
	},

	scale: 1.5,

	greyscale: true,

	useVideo: false,

	textureURL: './assets/medias/test_1.jpg',

	maxInteractions: 200,

	video: {
		url: './assets/medias/test_video.mp4',
	},

	fit: 'height',

	plane: {
		width: 100,
		height: 50
	}
}

module.exports = config;