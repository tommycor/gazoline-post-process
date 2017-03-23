

// #define MAX_DIST 15.
// #define MAX_Time 10.

// uniform float uTime;
// uniform vec2 uResolution;
// uniform bool uGreyscale;
// uniform sampler2D uTex;

// uniform float uInteractionsTime[ MAX_INT ];
// uniform vec2 uInteractionsPos[ MAX_INT ];
// uniform int uInteractionsPonderation[ MAX_INT ];
// uniform int uInteractionsIndex;

// varying vec2 vUv;
// varying vec3 vPosition;
// varying vec3 vSinVal;

// vec3 offsetWave = vec3( 0., .15, .3);
// vec2 diff 	= vec2(.0, .0);

// vec3 getWaveValue( vec2 interactionsPos, float interactionsTime ) {
// 	float dist  = .0;
// 	float influence = .0;
// 	float influenceSlope = -.08;
// 	float influenceTime = .0;
// 	float displacement = .0;
// 	float frequency = 2.5;
// 	float amplitude = .2;
// 	float waveLength = .5;
// 	float shift = .0;

// 	vec3 sinVal = vec3( .0, .0, .0);

// 	dist = distance( vec3( interactionsPos, .0 ), vec3( vPosition.xy , 0.) );

// 	// INFLUENCE FROM DIST + SPAWNING 
// 	if( interactionsTime < 2. && dist < MAX_DIST ) {
// 		influence = ( dist * influenceSlope ) + interactionsTime * .7 + .2;
// 	}

// 	// FADE OUT
// 	influenceTime = ( interactionsTime * -.5 + 1. );

// 	if( influenceTime > .0 ) {

// 		influence = influence * influenceTime ;

// 		// influence is gonna act on simili sombrero function
// 		if( influence > .0 ) {

// 			// HERE WE ONLY CALCULATE REAL WAVE
// 			sinVal = sin( ( dist * waveLength - interactionsTime * frequency ) + offsetWave ) * amplitude + shift;

// 			sinVal = sinVal * influence;

// 			// rgb = rgb + rgb * sinVal;
// 		}
// 	}

// 	return sinVal;
// }

// vec3 getBigWaveValue( vec2 interactionsPos, float interactionsTime ) {

// 	float dist  = .0;
// 	float influence = .0;
// 	float influenceSlope = -.08;
// 	float influenceTime = .0;
// 	float displacement = .0;
// 	float frequency = 4.;
// 	float amplitude = 3.5;
// 	float waveLength = .25;
// 	float shift = .0;

// 	vec3 sinVal = vec3( .0, .0, .0);

// 	dist = distance( vec3( interactionsPos, .0 ), vec3( vPosition.xy , 0.) );

// 	// INFLUENCE FROM DIST + SPAWNING 
// 	if( interactionsTime < 4. && dist < MAX_DIST + 15. ) {
// 		influence = ( dist * influenceSlope ) + interactionsTime * .5 + .0;
// 	}

// 	// FADE OUT
// 	influenceTime = ( interactionsTime * -.33 + 1. );

// 	if( influenceTime > .0 ) {

// 		influence = influence * influenceTime ;

// 		// influence is gonna act on simili sombrero function
// 		if( influence > .0 ) {

// 			// HERE WE ONLY CALCULATE REAL WAVE
// 			sinVal = sin( ( dist * waveLength - interactionsTime * frequency ) + offsetWave ) * amplitude + shift;

// 			sinVal = sinVal * influence;

// 			// rgb = rgb + rgb * sinVal;
// 		}
// 	}

// 	return sinVal;
// }




// void main() {
// 	vUv = uv;

// 	vPosition = position;

// 	vec3 sinVal = vec3( .0, .0, .0);
// 	vec3 vSinVal = vec3( .0, .0, .0);

// 	for( int i = 0 ; i < MAX_INT ; i++ ) {
// 		if( i >= uInteractionsIndex ) {
// 			break;
// 		}

// 		sinVal = vec3( .0, .0, .0);

// 		if( uInteractionsPonderation[i] == 0 ) {
// 			sinVal = getWaveValue( uInteractionsPos[i], uInteractionsTime[i] );
// 		}
// 		else if( uInteractionsPonderation[i] == 1 ) {
// 			sinVal = getBigWaveValue( uInteractionsPos[i], uInteractionsTime[i] );
// 		}

// 		vSinVal = vSinVal * sinVal;
// 	}
	
// 	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
// }

varying vec2 vUv;
varying vec3 vPosition;

void main() {
	vUv = uv;

	vPosition = position;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}


