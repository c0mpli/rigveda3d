import { useMemo, useState, useEffect } from "react";
import ScrollableHymnCard from "./ScrollableHymnCard";
import { getAllHymnsFromMandala } from "../../utils/DataLoader";
import useWindowDimensions from "../../hooks/useWindowDimensions";

export default function HymnCardsContainer({
  mandalaData,
  rigVedaData,
  selectedAtom,
  isExploring,
  atomPositions,
  selectedHymnIndex,
  targetVerseNumber,
  onWordSelect,
}) {
  const [showCards, setShowCards] = useState(false);
  const { isMobile } = useWindowDimensions();

  // Load ALL hymns for the selected mandala
  const hymns = useMemo(() => {
    if (!rigVedaData || selectedAtom === null) return [];

    const mandalaNumber = selectedAtom + 1;
    return getAllHymnsFromMandala(rigVedaData, mandalaNumber);
  }, [rigVedaData, selectedAtom]);

  // Delay showing cards until after zoom animation completes
  useEffect(() => {
    if (isExploring) {
      const timer = setTimeout(() => {
        setShowCards(true);
      }, 650); // Wait for zoom animation to complete
      return () => clearTimeout(timer);
    } else {
      setShowCards(false);
    }
  }, [isExploring]);

  if (!isExploring || selectedAtom === null || hymns.length === 0 || !showCards)
    return null;

  const atomPos = atomPositions[selectedAtom];
  const SPHERE_RADIUS = 9;
  const THEATER_POSITION = [
    atomPos[0] + (isMobile ? 0 : 2), // Center on mobile, offset right on desktop
    atomPos[1], // Vertical position
    atomPos[2] - SPHERE_RADIUS + (isMobile ? 7 : -0.5), // Bring closer on mobile
  ];

  return (
    <>
      {/* Floor plane to receive shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          atomPos[0] + 2,
          atomPos[1] - 8,
          atomPos[2] - SPHERE_RADIUS - 0.5,
        ]}
        receiveShadow
      >
        <planeGeometry args={[35, 35]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>

      {/* Card view for hymn - positioned on sphere circumference */}
      {selectedHymnIndex !== null && hymns[selectedHymnIndex] && (
        <ScrollableHymnCard
          mandala={selectedAtom + 1}
          hymn={hymns[selectedHymnIndex]}
          color={mandalaData[selectedAtom].color}
          position={THEATER_POSITION}
          targetVerseNumber={targetVerseNumber}
          onWordSelect={onWordSelect}
        />
      )}
    </>
  );
}
