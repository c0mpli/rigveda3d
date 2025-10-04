import { useMemo, useState, useEffect } from "react";
import { ScrollControls } from "@react-three/drei";
import ScrollableHymnCard from "./ScrollableHymnCard";
import { getAllHymnsFromMandala } from "../../utils/DataLoader";

export default function HymnCardsContainer({
  mandalaData,
  rigVedaData,
  selectedAtom,
  isExploring,
  atomPositions,
  selectedHymnIndex,
}) {
  const [showCards, setShowCards] = useState(false);

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
  const SPHERE_RADIUS = 10;
  const THEATER_POSITION = [
    atomPos[0],
    atomPos[1] + 1,
    atomPos[2] - SPHERE_RADIUS,
  ];

  return (
    <>
      {/* Floor plane to receive shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[atomPos[0], atomPos[1] - 5, atomPos[2] - SPHERE_RADIUS]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>

      {/* Card view for hymn - positioned on sphere circumference */}
      {selectedHymnIndex !== null && hymns[selectedHymnIndex] && (
        <ScrollableHymnCard
          mandala={selectedAtom + 1}
          hymn={hymns[selectedHymnIndex]}
          color={mandalaData[selectedAtom].color}
          position={THEATER_POSITION}
        />
      )}
    </>
  );
}
