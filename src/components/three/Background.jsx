import * as THREE from "three";
import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

export default function Background({ showMandalaColor, selectedAtom, mandalaData }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene.background) {
      scene.background = new THREE.Color(0, 0, 0);
    }
  }, [scene]);

  useFrame(() => {
    if (!scene.background) return;

    if (showMandalaColor && selectedAtom !== null) {
      const hexColor = mandalaData[selectedAtom].color;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
      if (result) {
        const r = (parseInt(result[1], 16) / 255) * 0.2;
        const g = (parseInt(result[2], 16) / 255) * 0.2;
        const b = (parseInt(result[3], 16) / 255) * 0.2;
        const targetColor = new THREE.Color(r, g, b);
        scene.background.lerp(targetColor, 0.05);
      }
    } else {
      const targetColor = new THREE.Color(0, 0, 0);
      scene.background.lerp(targetColor, 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
}
