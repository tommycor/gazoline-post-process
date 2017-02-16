
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mouse;
uniform sampler2D u_tex;
uniform vec2 u_texResolution;

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;
	vec3 rgb;

	float noise = snoise( vec3( st * 2., u_time ) ) * .5 + .5;

	// gl_FragColor = vec4( noise, 1., 1., 1. );
	rgb = texture2D(u_tex, st).rgb * noise;

	gl_FragColor = vec4( rgb, 1. );
}
