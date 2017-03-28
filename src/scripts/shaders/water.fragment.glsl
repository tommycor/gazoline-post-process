
#define MAX_DIST 15.
#define MAX_Time 10.
#define PI_2 6.2831853071

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


vec4 getWaveValue( vec2 interactionsPos, float interactionsTime, int ponderation ) {
	
	vec3 sinVal = vec3( .0, .0, .0);

	float dist  = .0;
	float influence = .0;
	float influenceTime = .0;
	float influenceSlope = .0;
	float frequency = .0;
	float amplitude = .0;
	float waveLength = .0;
	float shift = .0;

	if( ponderation == 0 ) {

		influenceSlope = -.08;
		frequency = 2.5;
		amplitude = .2;
		waveLength = .5;
		shift = .0;

	}
	else if( ponderation == 1 ) {

		influenceSlope = -.08;
		frequency = 4.;
		amplitude = 3.5;
		waveLength = .2;
		shift = .0;
	}


	dist = distance( vec3( interactionsPos, .0 ), vec3( vPosition.xy , 0.) );

	if( ponderation == 0 ) {
		// INFLUENCE FROM DIST + SPAWNING 
		if( interactionsTime < 2. && dist < MAX_DIST ) {
			influence = ( dist * influenceSlope ) + interactionsTime * .7 + .2;
		}

		// FADE OUT
		influenceTime = ( interactionsTime * -.5 + 1. );
	}
	else if( ponderation == 1 ) {
		// INFLUENCE FROM DIST + SPAWNING 
		if( interactionsTime < 4. && dist < MAX_DIST + 10. ) {
			influence = ( dist * influenceSlope ) + interactionsTime * .7 + .0;
		}

		// FADE OUT
		influenceTime = ( interactionsTime * -.33 + 1. );
	}


	if( influenceTime > .0 ) {

		influence = influence * influenceTime ;

		// influence is gonna act on simili sombrero function
		if( influence > .0 ) {

			// HERE WE ONLY CALCULATE REAL WAVE
			sinVal = sin( ( dist * waveLength - interactionsTime * frequency ) + offsetWave ) * amplitude + shift;

			sinVal = sinVal * influence;
		}
	}

	return vec4( sinVal, dist );		
}


void main() {

	noise = vec3(
		snoise( vec3( vUv * 2. + offset.r, uTime * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.g, uTime * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.b, uTime * .5 ) ) * .5 + .75
	);

	// rgb = texture2D(uTex, vUv).rgb * noise;

	vec4 sinVal = vec4( .0 );
	vec3 globalSinVal = vec3( .8 );

	vec2 explosions = vec2( 0. );

	for( int i = 0 ; i < MAX_INT ; i++ ) {
		if( i >= uInteractionsIndex ) {
			break;
		}

		sinVal = getWaveValue( uInteractionsPos[i], uInteractionsTime[i], uInteractionsPonderation[i] );

		if( sinVal.rgb == vec3( 0 ) ) { continue; }

		globalSinVal = globalSinVal + globalSinVal * sinVal.rgb;

		// explosions = explosions + normalize( vec2( uInteractionsPos[i].xy - vPosition.xy ) ) * sin( sinVal.r * PI_2 ) * .5;
		explosions = explosions + ( vec2( uInteractionsPos[i].xy - vPosition.xy ) ) / sinVal.a * sin( sinVal.g * PI_2 );
	}

	rgb = texture2D(uTex, vUv + explosions * .004 ).rgb * noise;
	// rgb = texture2D(uTex, vUv ).rgb * noise;

	rgb = rgb * globalSinVal;

	gl_FragColor = vec4( rgb, 1. );
}
