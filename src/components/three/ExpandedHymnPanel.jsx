import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CARD_VERTEX_SHADER, CARD_FRAGMENT_SHADER } from "../../utils/CardShader";
import { hexToThreeColor } from "../../utils/ColorUtils";

export default function ExpandedHymnPanel({ hymn, color, onClose }) {
  const materialRef = useRef();
  const groupRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = performance.now() * 0.001;
    }

    // Position panel in front of camera
    if (groupRef.current && camera) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      const position = new THREE.Vector3();
      camera.getWorldPosition(position);

      // Position 5 units in front of camera, slightly to the left
      position.add(direction.multiplyScalar(5));

      // Shift slightly to the left in camera space
      const right = new THREE.Vector3();
      right.crossVectors(camera.up, direction).normalize();
      position.add(right.multiplyScalar(-1.5));

      groupRef.current.position.copy(position);

      // Make panel face the camera
      groupRef.current.lookAt(camera.position);
    }
  });

  const shaderMaterial = {
    vertexShader: CARD_VERTEX_SHADER,
    fragmentShader: CARD_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: hexToThreeColor(color, 1.0) },
      uTime: { value: 0 },
      uAlpha: { value: 0.95 },
    },
    transparent: true,
    side: THREE.DoubleSide,
  };

  return (
    <group ref={groupRef}>
      {/* Background panel */}
      <mesh>
        <planeGeometry args={[4.5, 5.5]} />
        <shaderMaterial ref={materialRef} attach="material" {...shaderMaterial} />
      </mesh>

      {/* Border frame */}
      <RoundedBox args={[4.6, 5.6, 0.1]} radius={0.1} position={[0, 0, -0.05]}>
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </RoundedBox>

      {/* Close button */}
      <mesh position={[2, 2.5, 0.01]} onClick={onClose}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      <Text
        position={[2, 2.5, 0.02]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        ✕
      </Text>

      {/* Hymn Number */}
      <Text
        position={[0, 2.3, 0.01]}
        fontSize={0.28}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        Hymn {hymn.number}
      </Text>

      {/* Title */}
      {hymn.title && (
        <Text
          position={[0, 1.85, 0.01]}
          fontSize={0.16}
          color="rgba(255, 255, 255, 0.85)"
          anchorX="center"
          anchorY="middle"
          fontWeight={500}
          maxWidth={4}
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {hymn.title}
        </Text>
      )}

      {/* Divider */}
      <mesh position={[0, 1.5, 0.01]}>
        <planeGeometry args={[4, 0.02]} />
        <meshBasicMaterial color={color} opacity={0.5} transparent />
      </mesh>

      {/* Sanskrit text */}
      {hymn.sanskrit && (
        <Text
          position={[0, 0.9, 0.01]}
          fontSize={0.15}
          color={hexToThreeColor(color, 1.5)}
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
          lineHeight={1.4}
          textAlign="center"
          outlineWidth={0.003}
          outlineColor="#000000"
          fontWeight={600}
        >
          {hymn.sanskrit}
        </Text>
      )}

      {/* Transliteration */}
      {hymn.transliteration && (
        <Text
          position={[0, 0.15, 0.01]}
          fontSize={0.13}
          color="rgba(255, 255, 255, 0.75)"
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
          lineHeight={1.3}
          textAlign="center"
          outlineWidth={0.002}
          outlineColor="#000000"
          fontStyle="italic"
        >
          {hymn.transliteration}
        </Text>
      )}

      {/* Translation */}
      <Text
        position={[0, -1, 0.01]}
        fontSize={0.14}
        color="rgba(255, 255, 255, 0.95)"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        lineHeight={1.3}
        textAlign="center"
        outlineWidth={0.003}
        outlineColor="#000000"
      >
        {hymn.translation}
      </Text>

      {/* Verse count */}
      {hymn.verseCount > 0 && (
        <Text
          position={[0, -2.4, 0.01]}
          fontSize={0.12}
          color="rgba(255, 255, 255, 0.5)"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#000000"
        >
          {hymn.verseCount} verses
        </Text>
      )}
    </group>
  );
}
