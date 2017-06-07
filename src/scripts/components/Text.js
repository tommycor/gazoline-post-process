module.exports =  class Text {
	constructor( text ) {
		this.onResize 	= this.onResize.bind ( this );

		this.textStyle 	= new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 36,
			fontWeight: 'bold',
			fill: '#000000',
			wordWrap: true,
			wordWrapWidth: 440
		});

		this.text = new PIXI.Text(text, this.textStyle);
		this.text.anchor.set( 0.5, 0.5 );
	}

	onResize( width, height ) {
		this.width 	= width;
		this.height = height;

		this.text.x = this.width  * .5;
		this.text.y = this.height * .5;

		this.textStyle.wordWrapWidth = this.width * .9;

	}
}