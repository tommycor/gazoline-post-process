uniform float u_time;
uniform vec2 u_resolution;
uniform bool u_greyscale;
uniform sampler2D u_tex;

varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}