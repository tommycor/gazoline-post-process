
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

var config = {	
	canvas: {
		element : document.getElementById('container'),
		color : 0x000000
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

	textureURL: './assets/medias/test_2--text.jpg',

	maxInteractions: 250,

	video: {
		url: './assets/medias/test_video.mp4',
	},

	fit: 'height',

	plane: {
		width: 100,
		height: 50,
		segments: 2
	},

	minPonderation: .5
}

module.exports = config;