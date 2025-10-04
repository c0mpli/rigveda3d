import { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export default function HymnsSidebar3D({
  hymns,
  selectedHymnIndex,
  onHymnSelect,
  color,
  isVisible
}) {
  const { camera, raycaster, pointer } = useThree();
  const sidebarRef = useRef();
  const [isOpen, setIsOpen] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isHoveringScrollArea, setIsHoveringScrollArea] = useState(false);

  const COLUMNS = 3;
  const CARD_SIZE = 0.35;
  const CARD_GAP = 0.08;
  const SIDEBAR_WIDTH = COLUMNS * CARD_SIZE + (COLUMNS + 1) * CARD_GAP;
  const SIDEBAR_HEIGHT = 5;
  const SIDEBAR_PADDING = CARD_GAP;

  const rows = Math.ceil(hymns.length / COLUMNS);
  const totalHeight = rows * (CARD_SIZE + CARD_GAP) + CARD_GAP;
  const maxScroll = Math.max(0, totalHeight - (SIDEBAR_HEIGHT - SIDEBAR_PADDING * 2));

  // Handle scroll
  useEffect(() => {
    if (!isVisible || !isOpen) return;

    const handleWheel = (e) => {
      if (isHoveringScrollArea) {
        e.preventDefault();
        const scrollSpeed = 0.002;
        setScrollOffset((prev) => {
          const newOffset = prev + e.deltaY * scrollSpeed;
          return Math.max(0, Math.min(maxScroll, newOffset));
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isVisible, isOpen, isHoveringScrollArea, maxScroll]);

  // Position sidebar relative to camera
  useFrame(() => {
    if (!sidebarRef.current || !camera) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const position = new THREE.Vector3();
    camera.getWorldPosition(position);

    // Position in front of camera
    position.add(direction.multiplyScalar(3));

    // Shift to the left in camera space
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();
    position.add(right.multiplyScalar(isOpen ? 2 : 3));

    sidebarRef.current.position.copy(position);

    // Make sidebar face the camera
    sidebarRef.current.lookAt(camera.position);

    // Check if mouse is hovering over sidebar area
    if (isOpen) {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(sidebarRef.current, true);
      setIsHoveringScrollArea(intersects.length > 0);
    } else {
      setIsHoveringScrollArea(false);
    }
  });

  if (!isVisible) return null;

  const renderHymnCards = () => {
    const cards = [];

    hymns.forEach((hymn, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);

      const x = col * (CARD_SIZE + CARD_GAP) + CARD_GAP - SIDEBAR_WIDTH / 2 + CARD_SIZE / 2;
      const y = SIDEBAR_HEIGHT / 2 - SIDEBAR_PADDING - row * (CARD_SIZE + CARD_GAP) - CARD_SIZE / 2 + scrollOffset;

      // Only render cards that are visible
      if (y < -SIDEBAR_HEIGHT / 2 || y > SIDEBAR_HEIGHT / 2) return;

      const isSelected = selectedHymnIndex === index;
      const isHovered = hoveredIndex === index;

      cards.push(
        <group key={index} position={[x, y, 0.02]}>
          <mesh
            onPointerEnter={() => setHoveredIndex(index)}
            onPointerLeave={() => setHoveredIndex(null)}
            onClick={() => onHymnSelect(index)}
          >
            <planeGeometry args={[CARD_SIZE, CARD_SIZE]} />
            <meshStandardMaterial
              color={isSelected ? color : isHovered ? "#444444" : "#222222"}
              transparent
              opacity={isSelected ? 0.8 : 0.6}
              toneMapped={false}
            />
          </mesh>

          {/* Border */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[CARD_SIZE, CARD_SIZE]} />
            <meshStandardMaterial
              color={isSelected ? color : "rgba(255, 255, 255, 0.2)"}
              transparent
              opacity={1}
              side={THREE.FrontSide}
              wireframe={false}
              toneMapped={false}
            />
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(CARD_SIZE, CARD_SIZE)]} />
              <lineBasicMaterial color={isSelected ? color : "#666666"} toneMapped={false} />
            </lineSegments>
          </mesh>

          {/* Hymn Number */}
          <Text
            position={[0, 0.05, 0.002]}
            fontSize={0.12}
            color={color}
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            {hymn.hymnNumber}
          </Text>

          {/* Verse count */}
          {hymn.verseCount > 0 && (
            <Text
              position={[0, -0.08, 0.002]}
              fontSize={0.06}
              color="rgba(255, 255, 255, 0.6)"
              anchorX="center"
              anchorY="middle"
            >
              {hymn.verseCount}v
            </Text>
          )}
        </group>
      );
    });

    return cards;
  };

  return (
    <group ref={sidebarRef}>
      {isOpen ? (
        <>
          {/* Sidebar background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[SIDEBAR_WIDTH, SIDEBAR_HEIGHT]} />
            <meshStandardMaterial color="#000000" transparent opacity={0.85} toneMapped={false} />
          </mesh>

          {/* Border */}
          <RoundedBox args={[SIDEBAR_WIDTH + 0.02, SIDEBAR_HEIGHT + 0.02, 0.05]} radius={0.02} position={[0, 0, -0.03]}>
            <meshStandardMaterial color={color} transparent opacity={0.3} toneMapped={false} />
          </RoundedBox>

          {/* Header */}
          <Text
            position={[-SIDEBAR_WIDTH / 2 + 0.15, SIDEBAR_HEIGHT / 2 - 0.15, 0.01]}
            fontSize={0.15}
            color={color}
            anchorX="left"
            anchorY="top"
            fontWeight={700}
          >
            Hymns
          </Text>

          {/* Close button */}
          <mesh
            position={[SIDEBAR_WIDTH / 2 - 0.15, SIDEBAR_HEIGHT / 2 - 0.15, 0.01]}
            onClick={() => setIsOpen(false)}
          >
            <circleGeometry args={[0.08, 32]} />
            <meshStandardMaterial color="#ff4444" toneMapped={false} />
          </mesh>
          <Text
            position={[SIDEBAR_WIDTH / 2 - 0.15, SIDEBAR_HEIGHT / 2 - 0.15, 0.02]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            ✕
          </Text>

          {/* Header divider */}
          <mesh position={[0, SIDEBAR_HEIGHT / 2 - 0.3, 0.01]}>
            <planeGeometry args={[SIDEBAR_WIDTH - 0.2, 0.01]} />
            <meshStandardMaterial color={color} opacity={0.3} transparent toneMapped={false} />
          </mesh>

          {/* Scrollable content area - clipping mask */}
          <group position={[0, -0.15, 0]}>
            {renderHymnCards()}
          </group>

          {/* Scroll track background */}
          {maxScroll > 0 && (
            <>
              <mesh position={[SIDEBAR_WIDTH / 2 - 0.08, 0, 0.01]}>
                <planeGeometry args={[0.04, SIDEBAR_HEIGHT - 0.4]} />
                <meshStandardMaterial color="#333333" opacity={0.5} transparent toneMapped={false} />
              </mesh>

              {/* Scroll indicator thumb */}
              <mesh position={[
                SIDEBAR_WIDTH / 2 - 0.08,
                (SIDEBAR_HEIGHT / 2 - 0.35) - (scrollOffset / maxScroll) * (SIDEBAR_HEIGHT - 0.6 - (SIDEBAR_HEIGHT - 0.4) * (SIDEBAR_HEIGHT / totalHeight)),
                0.02
              ]}>
                <planeGeometry args={[0.035, (SIDEBAR_HEIGHT - 0.4) * (SIDEBAR_HEIGHT / totalHeight)]} />
                <meshStandardMaterial color={color} opacity={0.8} transparent toneMapped={false} />
              </mesh>
            </>
          )}
        </>
      ) : (
        /* Toggle button when closed */
        <>
          <mesh onClick={() => setIsOpen(true)}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial color="#000000" transparent opacity={0.7} toneMapped={false} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.2}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            ☰
          </Text>
        </>
      )}
    </group>
  );
}
