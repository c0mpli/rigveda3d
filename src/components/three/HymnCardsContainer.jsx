import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import HymnCard from "./HymnCard";
import { getAllHymnsFromMandala } from "../../utils/DataLoader";

export default function HymnCardsContainer({
  mandalaData,
  rigVedaData,
  selectedAtom,
  isExploring,
  atomPositions
}) {
  const groupRef = useRef();
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
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
      setExpandedCardIndex(null);
    }
  }, [isExploring]);

  useFrame((state) => {
    if (groupRef.current && showCards) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  if (!isExploring || selectedAtom === null || hymns.length === 0 || !showCards) return null;

  const atomPos = atomPositions[selectedAtom];

  // Arrange cards in a grid pattern behind the atom
  const CARDS_PER_ROW = 15;
  const CARD_SPACING_X = 1.5;
  const CARD_SPACING_Y = 2;

  const CARD_POSITIONS = hymns.map((_, index) => {
    const row = Math.floor(index / CARDS_PER_ROW);
    const col = index % CARDS_PER_ROW;

    const totalWidth = (CARDS_PER_ROW - 1) * CARD_SPACING_X;
    const x = (col * CARD_SPACING_X) - (totalWidth / 2);
    const y = -row * CARD_SPACING_Y;

    return [atomPos[0] + x, atomPos[1] + y + 2, atomPos[2] - 8]; // 8 units behind the atom
  });

  const handleCardClick = (index) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  return (
    <group ref={groupRef}>
      {hymns.map((hymn, index) => (
        <HymnCard
          key={index}
          hymn={hymn}
          color={mandalaData[selectedAtom].color}
          position={CARD_POSITIONS[index]}
          index={index}
          rotation={[0, 0, 0]}
          isExpanded={expandedCardIndex === index}
          onExpand={() => handleCardClick(index)}
        />
      ))}
    </group>
  );
}
