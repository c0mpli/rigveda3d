export const CARD_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const CARD_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uAlpha;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Noise function for subtle texture
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // Create gradient from top to bottom
    float gradient = smoothstep(0.0, 1.0, vUv.y);

    // Add subtle noise texture
    float noise = random(vUv * 10.0 + uTime * 0.1) * 0.03;

    // Edge glow effect
    float edgeGlow = 1.0 - smoothstep(0.0, 0.05, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));

    // Combine effects
    vec3 color = uColor * (0.7 + gradient * 0.3) + edgeGlow * uColor * 0.5;
    color += noise;

    // Glass-like transparency with edge brightness
    float alpha = uAlpha * (0.85 + edgeGlow * 0.15);

    gl_FragColor = vec4(color, alpha);
  }
`;
