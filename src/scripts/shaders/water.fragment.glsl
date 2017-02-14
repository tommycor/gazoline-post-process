
uniform float u_time;
uniform float u_resolution;
uniform float u_mouse;

void main() {
	vec2 position = gl_FragCoord.xy/u_resolution;

	// float time_loop = sin( u_time );

	float red_color = snoise( vec3( position, u_time ) );
	red_color = mix(0., 1., red_color);

	gl_FragColor = vec4( red_color, 1., 1., 1. );
}
