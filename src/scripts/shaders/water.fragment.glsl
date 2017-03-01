#define MAX_INT 200
#define MAX_DIST 200.
#define MAX_Time 10.

uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_greyscale;
uniform sampler2D u_tex;

uniform float interactionsTime[ MAX_INT ];
uniform vec2 interactionsPos[ MAX_INT ];
uniform int interactionsIndex;

varying vec2 vUv;
varying vec3 v_position;

vec3 offset = vec3( 0., .1, .2);
vec3 rgb = vec3(.0, .0, .0);

void main() {
	vec3 noise 	= vec3(0., 0., 0.);
	vec3 rgb 	= vec3(0., 0., 0.);
	float dist  = 0.;


	noise = vec3(
		snoise( vec3( vUv * 2. + offset.r, u_time * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.g, u_time * .5 ) ) * .5 + .75,
		snoise( vec3( vUv * 2. + offset.b, u_time * .5 ) ) * .5 + .75
	);

	rgb = texture2D(u_tex, vUv).rgb * noise;


	for( int i = 0 ; i < MAX_INT ; i++ ) {
		if( i >= interactionsIndex ) {
			break;
		}

		dist = distance( vec3( interactionsPos[i], .0 ), v_position );

		if( dist < 5. ) {
			rgb.r = 1.;
		}
	}


	gl_FragColor = vec4( rgb, 1. );
}
