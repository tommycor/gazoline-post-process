
#define MAX_DIST 15.
#define MAX_Time 10.

uniform float uTime;
uniform vec2 uResolution;
uniform bool uGreyscale;
uniform sampler2D uTex;

uniform float uInteractionsTime[ MAX_INT ];
uniform vec2 uInteractionsPos[ MAX_INT ];
uniform int uInteractionsPonderation[ MAX_INT ];
uniform int uInteractionsIndex;

varying vec2 vUv;
varying vec3 vPosition;

vec3 offset = vec3( 0., .1, .2);
vec3 offsetWave = vec3( 0., .15, .3);
vec3 noise 	= vec3(.0, .0, .0);
vec3 rgb 	= vec3(.0, .0, .0);
vec2 diff 	= vec2(.0, .0);


vec3 getWaveValue( vec2 interactionsPos, float interactionsTime ) {
	float dist  = .0;
	float influence = .0;
	float influenceSlope = -.08;
	float influenceTime = .0;
	float displacement = .0;
	float frequency = 2.5;
	float amplitude = .2;
	float waveLength = .5;
	float shift = .0;

	vec3 sinVal = vec3( .0, .0, .0);

	dist = distance( vec3( interactionsPos, .0 ), vec3( vPosition.xy , 0.) );

	// INFLUENCE FROM DIST + SPAWNING 
	if( interactionsTime < 2. && dist < MAX_DIST ) {
		influence = ( dist * influenceSlope ) + interactionsTime * .7 + .2;
	}

	// FADE OUT
	influenceTime = ( interactionsTime * -.5 + 1. );

	if( influenceTime > .0 ) {

		influence = influence * influenceTime ;

		// influence is gonna act on simili sombrero function
		if( influence > .0 ) {

			// HERE WE ONLY CALCULATE REAL WAVE
			sinVal = sin( ( dist * waveLength - interactionsTime * frequency ) + offsetWave ) * amplitude + shift;

			sinVal = sinVal * influence;

			// rgb = rgb + rgb * sinVal;
			rgb = rgb + rgb * sinVal;
		}
	}

	return rgb;
}

vec3 getBigWaveValue( vec2 interactionsPos, float interactionsTime ) {

	float dist  = .0;
	float influence = .0;
	float influenceSlope = -.08;
	float influenceTime = .0;
	float displacement = .0;
	float frequency = 3.;
	float amplitude = 3.;
	float waveLength = .3;
	float shift = .0;

	vec3 sinVal = vec3( .0, .0, .0);

	dist = distance( vec3( interactionsPos, .0 ), vec3( vPosition.xy , 0.) );

	// INFLUENCE FROM DIST + SPAWNING 
	if( interactionsTime < 4. && dist < MAX_DIST + 15. ) {
		influence = ( dist * influenceSlope ) + interactionsTime * .5 + .0;
	}

	// FADE OUT
	influenceTime = ( interactionsTime * -.33 + 1. );

	if( influenceTime > .0 ) {

		influence = influence * influenceTime ;

		// influence is gonna act on simili sombrero function
		if( influence > .0 ) {

			// HERE WE ONLY CALCULATE REAL WAVE
			sinVal = sin( ( dist * waveLength - interactionsTime * frequency ) + offsetWave ) * amplitude + shift;

			sinVal = sinVal * influence;

			// rgb = rgb + rgb * sinVal;
			rgb = rgb + rgb * sinVal;
		}
	}

	return rgb;
}




void main() {

	noise = vec3(
		snoise( vec3( vUv * 2. + offset.r, uTime * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.g, uTime * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.b, uTime * .5 ) ) * .5 + .75
	);

	rgb = texture2D(uTex, vUv).rgb * noise;


	for( int i = 0 ; i < MAX_INT ; i++ ) {
		if( i >= uInteractionsIndex ) {
			break;
		}

		if( uInteractionsPonderation[i] == 0 ) {
			rgb = getWaveValue( uInteractionsPos[i], uInteractionsTime[i] );
			continue;
		}
		else if( uInteractionsPonderation[i] == 1 ) {
			rgb = getBigWaveValue( uInteractionsPos[i], uInteractionsTime[i] );
		}
	}

	gl_FragColor = vec4( rgb, 1. );
}
