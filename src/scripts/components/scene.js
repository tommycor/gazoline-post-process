import Vector2 		from '../utils/Vector2';
import Vector3 		from '../utils/Vector3';
import Vector4 		from '../utils/Vector4';

import config 		from '../utils/config';
import mapper 		from '../utils/mapper';
import serializer 	from '../utils/serializer';

import Video 		from './Video';
import Text 		from './Text';

// var PIXI = require('pixi');

module.exports = {

	init: function() {
		this.render  	= this.render.bind(this);
		this.onResize	= this.onResize.bind(this);
		this.onMove		= this.onMove.bind(this);
		this.onClick	= this.onClick.bind(this);
		this.onMouseDown= this.onMouseDown.bind(this);
		this.onMouseUp	= this.onMouseUp.bind(this);

		this.interactionsPos 	= new Array();
		this.interactionsTime 	= new Array();
		this.interactionsIndex 	= 0;
		this.container 			= config.canvas.element;
		this.width 				= this.container.offsetWidth / config.scale;
		this.height 			= this.container.offsetHeight / config.scale;

		for( let i = 0 ; i < config.maxInteractions * 3 ; i++ ) {
			this.interactionsPos[i]  = new Vector3( 0, 0, 0 );
			this.interactionsTime[i] = 100;
		}

		this.app = new PIXI.Application( this.width, this.height );
		this.group = new PIXI.Container();


		this.fragmentShader = require('../shaders/noises/noise3D.glsl') + '#define MAX_INT ' + config.maxInteractions + require('../shaders/water.fragment.glsl');;
		this.gazolineUniforms = {
			uTime: 				{ type: "f", 	value: .0 },
			uNoiseInfluence:	{ type: "f", 	value: .0 },
			uResolution: 		{ type: "v2", 	value: new Vector2( this.width, this.height ) },
			uInteractionsPos: 	{ type: 'v3v', 	value: serializer( this.interactionsPos, 3) },
			uInteractionsTime: 	{ type: 'fv1', 	value: this.interactionsTime },
			uInteractionsIndex: { type: 'i', 	value: this.interactionsIndex },
		};

		this.filter = new PIXI.Filter( null, this.fragmentShader, this.gazolineUniforms);
		this.group.filters = [ this.filter ];

		this.sprite = PIXI.Sprite.fromImage( config.textureURL );
		this.sprite.texture.baseTexture.on('loaded', this.onResize);
		this.group.addChild( this.sprite );

		if( config.useVideo ) {
			this.spriteVideo = new Video();
			this.group.addChild( this.spriteVideo.sprite );
		}

		if( config.text != void 0 && config.text != '' ) {
			this.spriteText = new Text();
			this.group.addChild( this.spriteText.text );
		}

		this.group.interactive = true;
		this.group.on('pointermove', this.onMove);
		this.group.on('pointerdown', this.onClick);

		this.app.stage.addChild( this.group );
		this.container.appendChild( this.app.view );
		window.addEventListener('resize', this.onResize);

		setTimeout(()=>{
			this.onResize();
		}, 1000);

		this.app.ticker.add( this.render );
	},

	onClick: function( event ) {
		this.addInteractionFromEvent( event, 100 );
	},

	onMove: function( event ) {
		this.addInteractionFromEvent( event, this.isCapting ? 100 : 1 );
	},

	onMouseDown: function( event ) {
	},

	onMouseUp: function( event ) {
	},

	onResize: function() {
		this.width 	= this.container.offsetWidth / config.scale;
		this.height = this.container.offsetHeight / config.scale;

		this.app.renderer.resize( this.width, this.height );

		this.app.view.style.transform = 'scale(' + config.scale + ')';
		this.app.view.style.transformOrigin = '0 0';

		let imageRatio = this.sprite.width / this.sprite.height;
		let containerRatio = this.width / config.scale / this.height;

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

		if( config.useVideo ) {
			this.spriteVideo.onResize( this.width / config.scale, this.height / config.scale );
		}

		if( config.text != void 0 && config.text != '' ) {
			this.spriteText.onResize( this.width, this.height );
		}
	},

	addInteractionFromEvent: function( event, ponderation ) {
		let position = event.data.global;
		position.y = this.sprite.height - position.y;

		if( this.interactionsIndex > config.maxInteractions ) {
			this.removeItem(0);
		}

		if( ponderation != 100 ){
			if( this.interactionsIndex > 0 ) {
				let delta = new Vector2( position.x, position.y ).distanceTo( new Vector2( this.interactionsPos[ this.interactionsIndex - 1 ].x, this.interactionsPos[ this.interactionsIndex - 1 ].y ) );
				ponderation = 1 - delta *.5;
				
				if( ponderation < config.minPonderation ) {
					ponderation = config.minPonderation;
				}
			}
			else {
				ponderation = 1;
			}
		}


		this.interactionsPos[ this.interactionsIndex ] 		= new Vector3( position.x, position.y, ponderation);
		this.interactionsTime[ this.interactionsIndex ] = 0;
		this.interactionsIndex++;
		
		this.filter.uniforms.uInteractionsIndex = this.interactionsIndex;
		this.filter.uniforms.uInteractionsPos = serializer( this.interactionsPos, 3);
	},

	render: function( delta ) {
		delta *= .01;

		this.filter.uniforms.uTime += delta;

		for( let i = 0 ; i < this.interactionsIndex ; i++ ) {
			this.interactionsTime[i] += delta;

			// GARBAGE COLLECTOR FOR INTERACTIONS ARRAYS
			if( this.interactionsPos[i].z != 100 ) {
				if( this.interactionsTime[i] > 3 &&  this.interactionsTime[i] < 50 ) {
					this.removeItem( i );
				}
			}
			if( this.interactionsPos[i].z == 100 ) {
				if( this.interactionsTime[i] > 5 &&  this.interactionsTime[i] < 50 ) {
					this.removeItem( i );
				}
			}
		}

		this.filter.uniforms.uNoiseInfluence = this.interactionsIndex / 250;

		this.filter.uniforms.uInteractionsTime = this.interactionsTime;

		if( config.useVideo ) {
			this.spriteVideo.render();
		}
	},

	removeItem: function( index ) {
		this.interactionsTime.splice( index, 1)
		this.interactionsPos.splice( index, 1);
		this.interactionsIndex--;

		this.interactionsPos.push( new Vector2( 0, 0, 0 ) );
		this.interactionsTime.push( 100 );

		this.filter.uniforms.uInteractionsIndex = this.interactionsIndex;
		this.filter.uniforms.uInteractionsPos = serializer( this.interactionsPos, 3);
	},

	updateVideo: function() {
	},

	createVideo: function() {
	}

};