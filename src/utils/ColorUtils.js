import * as THREE from "three";

export const hexToThreeColor = (hex, brightness = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return new THREE.Color(
      (parseInt(result[1], 16) / 255) * brightness,
      (parseInt(result[2], 16) / 255) * brightness,
      (parseInt(result[3], 16) / 255) * brightness
    );
  }
  return new THREE.Color(6, 0.5, 2);
};
