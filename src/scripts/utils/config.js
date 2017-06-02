
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

module.exports = class Config{
	constructor( element ) {
		this.canvas = {
			element: element,
			color: 0x000000
		};

		this.scale = !this.tester('data-scale', this.canvas.element) ? 1.5 : this.tester('data-scale', this.canvas.element);

		this.greyscale = false;

		this.useVideo = true;

		this.textureURL = './assets/medias/test_2.jpg';

		this.maxInteractions = 250;

		this.text = 'Potatoe Banana!';

		this.video = {
			url: './assets/medias/test_video.mp4',
			useVideo: true
		};
	}

	tester(name, element) {
		let value = element.getAttribute( name );

		if( value == void 0 || value == '' ) {
			return false;
		}
		else {
			return value;
		}
	}
}

