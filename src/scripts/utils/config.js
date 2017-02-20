import threejs 				from "three-js";
const THREE = threejs();

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

	greyscale: true
}


module.exports = config;