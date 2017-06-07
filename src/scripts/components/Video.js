module.exports =  class Video {
	constructor( url ) {
		this.render 	= this.render.bind( this );
		this.onResize 	= this.onResize.bind ( this );

		this.url = url;
		this.createVideo();

		this.sprite = new PIXI.Sprite( PIXI.Texture.fromCanvas( this.videoImage ) );
		this.sprite.width = 1280;
		this.sprite.height = 720;
	}

	render() {
		if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) {
			this.videoImageContext.drawImage( this.video, 0, 0 );
			this.sprite.texture.update();
		}
	}

	createVideo() {
		this.video = document.createElement( 'video' );
		this.video.src = this.url;
		this.video.load();
		this.video.play();

		this.videoImage = document.createElement( 'canvas' );
		this.videoImage.width = 1280;
		this.videoImage.height = 720;

		this.videoImageContext = this.videoImage.getContext( '2d' );
		this.videoImageContext.fillStyle = '#000000';
		this.videoImageContext.fillRect( 0, 0, this.videoImage.width, this.videoImage.height );

		// TO CHECK VIDEO PLAYING
		this.videoImage.style.width = "160px";
		this.videoImage.style.height = "90px";
		this.videoImage.style.display = "block";
		this.videoImage.style.position = "absolute";
		this.videoImage.style.top = "0";
		this.videoImage.style.left = "0";
		// document.body.appendChild( this.videoImage );
	}

	onResize( width, height ) {
		this.width 	= width;
		this.height = height;

		let imageRatio = this.sprite.width / this.sprite.height;
		let containerRatio = this.width / this.height;

		if(containerRatio > imageRatio) {
		    this.sprite.height = this.sprite.height / (this.sprite.width / this.width);
		    this.sprite.width = this.width;
		    this.sprite.position.x = 0;
		    this.sprite.position.y = (this.height - this.sprite.height) / 2;
		}else{
		    this.sprite.width = this.sprite.width / (this.sprite.height / this.height);
		    this.sprite.height = this.height;
		    this.sprite.position.y = 0;
		    this.sprite.position.x = (this.width - this.sprite.width) / 2;
		}
	}
}