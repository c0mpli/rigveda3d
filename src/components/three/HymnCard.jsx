import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CARD_VERTEX_SHADER, CARD_FRAGMENT_SHADER } from "../../utils/CardShader";
import { hexToThreeColor } from "../../utils/ColorUtils";

const COLLAPSED_SIZE = [1.2, 1.5];
const EXPANDED_SIZE = [6, 7];

export default function HymnCard({ hymn, color, position, index, isExpanded, onExpand, ...props }) {
  const cardRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [currentSize, setCurrentSize] = useState(COLLAPSED_SIZE);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (cardRef.current) {
      // Gentle floating animation (only when collapsed)
      if (!isExpanded) {
        cardRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.05;
      } else {
        cardRef.current.position.y = position[1];
      }

      // Animate size change
      const targetSize = isExpanded ? EXPANDED_SIZE : COLLAPSED_SIZE;
      const lerpFactor = 0.15;
      setCurrentSize(prev => [
        prev[0] + (targetSize[0] - prev[0]) * lerpFactor,
        prev[1] + (targetSize[1] - prev[1]) * lerpFactor
      ]);

      // Scale on hover (when collapsed)
      const hoverScale = (hovered && !isExpanded) ? 1.1 : 1.0;
      const targetScale = isExpanded ? 1.0 : hoverScale;
      cardRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const shaderMaterial = {
    vertexShader: CARD_VERTEX_SHADER,
    fragmentShader: CARD_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: hexToThreeColor(color, 1.0) },
      uTime: { value: 0 },
      uAlpha: { value: 0.75 },
    },
    transparent: true,
    side: THREE.DoubleSide,
  };

  return (
    <group ref={cardRef} position={position} {...props}>
      {/* Card background with shader */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onExpand}
      >
        <planeGeometry args={currentSize} />
        <shaderMaterial ref={materialRef} attach="material" {...shaderMaterial} />
      </mesh>

      {/* Rounded border frame */}
      <RoundedBox args={[currentSize[0] + 0.1, currentSize[1] + 0.1, 0.05]} radius={0.05} position={[0, 0, -0.05]}>
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </RoundedBox>

      {!isExpanded ? (
        /* COLLAPSED VIEW - Show only hymn number */
        <>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.4}
            color={color}
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {hymn.hymnNumber}
          </Text>
          {hymn.verseCount > 0 && (
            <Text
              position={[0, -0.5, 0.01]}
              fontSize={0.12}
              color="rgba(255, 255, 255, 0.6)"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.003}
              outlineColor="#000000"
            >
              {hymn.verseCount} verses
            </Text>
          )}
        </>
      ) : (
        /* EXPANDED VIEW - Show all content */
        <>
          {/* Hymn Number */}
          <Text
            position={[0, 1.7, 0.01]}
            fontSize={0.22}
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
              position={[0, 1.35, 0.01]}
              fontSize={0.14}
              color="rgba(255, 255, 255, 0.85)"
              anchorX="center"
              anchorY="middle"
              fontWeight={500}
              maxWidth={2.6}
              outlineWidth={0.005}
              outlineColor="#000000"
            >
              {hymn.title}
            </Text>
          )}

          {/* Divider line */}
          <mesh position={[0, 1.1, 0.01]}>
            <planeGeometry args={[2.5, 0.01]} />
            <meshBasicMaterial color={color} opacity={0.5} transparent />
          </mesh>

          {/* Sanskrit text */}
          {hymn.sanskrit && (
            <Text
              position={[0, 0.7, 0.01]}
              fontSize={0.13}
              color={hexToThreeColor(color, 1.5)}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.6}
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
              fontSize={0.11}
              color="rgba(255, 255, 255, 0.75)"
              anchorX="center"
              anchorY="middle"
              maxWidth={2.6}
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
            position={[0, -0.6, 0.01]}
            fontSize={0.12}
            color="rgba(255, 255, 255, 0.95)"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.6}
            lineHeight={1.3}
            textAlign="center"
            outlineWidth={0.003}
            outlineColor="#000000"
          >
            {hymn.translation}
          </Text>
        </>
      )}
    </group>
  );
}
