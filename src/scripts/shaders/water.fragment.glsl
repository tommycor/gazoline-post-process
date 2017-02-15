
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mouse;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;


	// float time_loop = sin( u_time );

	float noise = snoise( vec3( st, u_time ) ) * .5 + .5;

	gl_FragColor = vec4( noise, 1., 1., 1. );
}
