import { useMemo, useState, useEffect } from "react";
import HymnCard from "./HymnCard";
import { getAllHymnsFromMandala } from "../../utils/DataLoader";

export default function HymnCardsContainer({
  mandalaData,
  rigVedaData,
  selectedAtom,
  isExploring,
  atomPositions,
  selectedHymnIndex
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

  if (!isExploring || selectedAtom === null || hymns.length === 0 || !showCards) return null;

  const atomPos = atomPositions[selectedAtom];

  const SPHERE_RADIUS = 10;

  // Position for the large theater screen (center-front of sphere)
  const THEATER_POSITION = [
    atomPos[0],
    atomPos[1] + 1,
    atomPos[2] - SPHERE_RADIUS
  ];

  return (
    <>
      {/* Card view for hymn - positioned on sphere circumference */}
      {selectedHymnIndex !== null && hymns[selectedHymnIndex] && (
        <HymnCard
          hymn={hymns[selectedHymnIndex]}
          color={mandalaData[selectedAtom].color}
          position={THEATER_POSITION}
          index={-1}
          rotation={[0, 0, 0]}
          isExpanded={true}
          onExpand={() => {}}
        />
      )}
    </>
  );
}
