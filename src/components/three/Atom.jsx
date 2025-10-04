import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text } from "@react-three/drei";
import { hexToThreeColor } from "../../utils/ColorUtils";
import Electron from "./Electron";

export default function Atom({ number, onClick, isZoomed, color, ...props }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const sphereMatRef = useRef();
  const audioRef = useRef(null);

  const handlePointerEnter = () => {
    if (isZoomed) return;
    setHovered(true);
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/hover.mp3");
      audioRef.current.volume = 1.0;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (isZoomed) {
      setHovered(false);
    }
  }, [isZoomed]);

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered && !isZoomed ? 0.5 : 0.4;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
    if (sphereMatRef.current) {
      const targetColor =
        hovered && !isZoomed
          ? hexToThreeColor(color, 6)
          : hexToThreeColor(color, 3);
      sphereMatRef.current.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <group ref={groupRef} {...props} scale={0.4}>
      <mesh
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => setHovered(false)}
        onClick={isZoomed ? undefined : onClick}
        visible={false}
      >
        <sphereGeometry args={[3]} />
      </mesh>
      <Electron
        position={[0, 0, 0.5]}
        speed={3}
        hovered={hovered && !isZoomed}
        color={color}
      />
      <Electron
        position={[0, 0, 0.5]}
        rotation={[0, 0, Math.PI / 3]}
        speed={3.5}
        hovered={hovered && !isZoomed}
        color={color}
      />
      <Electron
        position={[0, 0, 0.5]}
        rotation={[0, 0, -Math.PI / 3]}
        speed={4}
        hovered={hovered && !isZoomed}
        color={color}
      />
      <Text
        position={[0, 0, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        <meshBasicMaterial toneMapped={false} />
        {number}
      </Text>
      <Sphere args={[0.35, 64, 64]}>
        <meshBasicMaterial
          ref={sphereMatRef}
          color={color}
          toneMapped={false}
          transparent
          opacity={0.25}
        />
      </Sphere>
    </group>
  );
}
