uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_greyscale;
uniform sampler2D u_tex;

varying vec2 vUv;

vec3 offset = vec3( 0., .1, .2);
vec3 rgb = vec3(.0, .0, .0);

void main() {
	vec3 noise = vec3(
		snoise( vec3( vUv * 2. + offset.r, u_time * .5 ) ) * .5 + .5,
		snoise( vec3( vUv * 2. + offset.g, u_time * .5 ) ) * .5 + .5,
		snoise( vec3( vUv * 2. + offset.b, u_time * .5 ) ) * .5 + .5
	);

	// vec3 rgb = texture2D(u_tex, vUv).rgb * noise;
	vec3 rgb = vec3(1.0, 1.0, 1.0).rgb * noise;

	gl_FragColor = vec4( rgb, 1. );
}
