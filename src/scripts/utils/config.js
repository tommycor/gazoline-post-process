
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

		this.greyscale = !this.tester('data-greyscale', this.canvas.element) ? false : this.tester('data-greyscale', this.canvas.element);

		this.useVideo = false;

		this.textureURL = !this.tester('data-image-url', this.canvas.element) ? './assets/medias/test_2.jpg' : this.tester('data-image-url', this.canvas.element);

		this.maxInteractions = !this.tester('data-max-interaction', this.canvas.element) ? 250 : this.tester('data-max-interaction', this.canvas.element);

		this.text = !this.tester('data-text', this.canvas.element) ? '' : this.tester('data-text', this.canvas.element);

		this.video = {
			url: !this.tester('data-video-url', this.canvas.element) ? './assets/medias/test_video.mp4' : this.tester('data-video-url', this.canvas.element),
			useVideo: !this.tester('data-use-video', this.canvas.element) ? false : this.tester('data-use-video', this.canvas.element)
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

