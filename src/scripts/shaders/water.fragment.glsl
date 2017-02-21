
uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_greyscale;

vec3 offset = vec3( 0., .1, .2);
vec3 rgb = vec3(.0, .0, .0);

void main() {
	// vec2 st = gl_FragCoord.xy/u_resolution;

	// float noise = snoise( vec3( st * 2., u_time * .5 ) ) * .5 + .5;

	// vec3 noise = vec3(
	// 	snoise( vec3( st * 2. + offset.r, u_time * .5 ) ) * .5 + .5,
	// 	snoise( vec3( st * 2. + offset.g, u_time * .5 ) ) * .5 + .5,
	// 	snoise( vec3( st * 2. + offset.b, u_time * .5 ) ) * .5 + .5
	// );

	// rgb = texture2D(u_tex, st).rgb * noise;
	rgb = vec3(.5, .1, 1.);


	gl_FragColor = vec4( rgb, 1. );
}
