
#define MAX_DIST 200.
#define MAX_Time 10.

uniform float uTime;
uniform vec2 uResolution;
uniform bool uGreyscale;
uniform sampler2D uTex;

uniform float uInteractionsTime[ MAX_INT ];
uniform vec2 uInteractionsPos[ MAX_INT ];
uniform int uInteractionsIndex;

varying vec2 vUv;
varying vec3 vPosition;

vec3 offset = vec3( 0., .1, .2);
vec3 rgb = vec3(.0, .0, .0);

void main() {
	vec3 noise 	= vec3(0., 0., 0.);
	vec3 rgb 	= vec3(0., 0., 0.);
	float dist  = 0.;


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

		dist = distance( vec3( uInteractionsPos[i], .0 ), vec3( vPosition.xy , 0.) );

		if( dist < 5. ) {
			rgb = vec3(1.);
		}
	}

	

	gl_FragColor = vec4( rgb, 1. );
}
