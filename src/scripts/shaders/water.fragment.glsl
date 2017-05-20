
#define MAX_DIST_1 15.
#define MAX_DIST_2 25.
#define MAX_Time 10.
#define PI 3.1415926535
#define PI_2 6.2831853071

#define s_influenceSlope -.08
#define s_frequency 2.5
#define s_amplitude .2
#define s_waveLength .5
#define s_shift .08

#define b_influenceSlope -.08
#define b_frequency 4.
#define b_amplitude 4.
#define b_waveLength .2
#define b_shift 1.



uniform float uTime;
uniform sampler2D uSampler;
uniform vec2 uResolution;
uniform sampler2D uTex;

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;

uniform float uInteractionsTime[ MAX_INT ];
uniform vec3 uInteractionsPos[ MAX_INT ];
uniform float uInteractionsPonderation[ MAX_INT ];
uniform int uInteractionsIndex;

vec3 offset = vec3( 0., .1, .2);
vec3 offsetWave = vec3( .4, .2, .0);
vec3 noise 	= vec3(.0, .0, .0);
vec3 rgb 	= vec3(.0, .0, .0);
vec2 diff 	= vec2(.0, .0);

void main( void ) {

	vec2 uvs = vTextureCoord.xy;

	noise = vec3(
		snoise( vec3( uvs * 2. + offset.r, uTime * .5 ) ) * .5 + 1.,
		snoise( vec3( uvs * 2. + offset.g, uTime * .5 ) ) * .5 + 1.,
		snoise( vec3( uvs * 2. + offset.b, uTime * .5 ) ) * .5 + 1.
	);

	vec3 globalSinVal = vec3( 1. );
	vec2 explosions = vec2( 0. );

	vec3 sinVal = vec3( .0 );
	float dist  = .0;
	float influence = .0;
	float influenceTime = .0;
	float vitesse = .0;

	for( int i = 0 ; i < MAX_INT ; i++ ) {
		if( i >= uInteractionsIndex ) {
			break;
		}

		sinVal = vec3( .0 );
		dist = .0;
		influence = .0;
		influenceTime = .0;
		vitesse = 1.;

		if( uInteractionsPos[i].z != 100. ) {
			dist = distance( uInteractionsPos[i].xy, gl_FragCoord.xy ) / uInteractionsPos[i].z;

			// if( uInteractionsTime[i] < 2. && dist < MAX_DIST_1 / uInteractionsPos[i].z ) {
			// 	influence = ( dist * s_influenceSlope ) + uInteractionsTime[i] * .7 + .2;

			// 	// FADE OUT
			// 	influenceTime = ( uInteractionsTime[i] * -.5 + 1. );

			// 	if( influenceTime > .0 ) {

			// 		influence = influence * influenceTime ;

			// 		if( influence > .0 )				 {

			// 			// HERE WE ONLY CALCULATE REAL WAVE
			// 			sinVal = sin( ( dist * s_waveLength - uInteractionsTime[i] * s_frequency ) + offsetWave ) * s_amplitude + s_shift;

			// 			sinVal = sinVal * influence;
			// 		}
			// 	}
			// }
		}
	}

	rgb = texture2D(uSampler, vTextureCoord + explosions * .004 ).rgb * noise;

	rgb = rgb * globalSinVal;

	gl_FragColor = vec4( rgb, 1. );
}
