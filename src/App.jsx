import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Text, ScrollControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MANDALA_DATA } from "./data/MandalaData";
import { loadRigVedaData, getAllHymnsFromMandala } from "./utils/DataLoader";
import BackButton from "./components/ui/BackButton";
import Navbar from "./components/ui/Navbar";
import SearchModal from "./components/ui/SearchModal";
import FilterModal from "./components/ui/FilterModal";
import FilterIndicator from "./components/ui/FilterIndicator";
import Dictionary from "./components/ui/Dictionary";
import MandalaOverlay from "./components/ui/MandalaOverlay";
import HymnsSidebar2D from "./components/ui/HymnsSidebar2D";
import WordMeaningSidebar from "./components/ui/WordMeaningSidebar";
import RotatingStars from "./components/three/RotatingStars";
import Background from "./components/three/Background";
import Rig from "./components/three/Rig";
import Atom from "./components/three/Atom";
import HymnCardsContainer from "./components/three/HymnCardsContainer";
import useRigVedaSearch from "./hooks/useRigVedaSearch";
import { useNarration } from "./contexts/NarrationContext";

export default function App() {
  const bgMusicRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const [selectedAtom, setSelectedAtom] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [showMandalaColor, setShowMandalaColor] = useState(false);
  const [rigVedaData, setRigVedaData] = useState(null);
  const [hideAtoms, setHideAtoms] = useState(false);
  const [selectedHymnIndex, setSelectedHymnIndex] = useState(0);
  const [currentHymns, setCurrentHymns] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordSidebar, setShowWordSidebar] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [targetVerseNumber, setTargetVerseNumber] = useState(null);

  const { language, playNarration, stopNarration, toggleLanguage } = useNarration();

  // Search functionality
  const {
    search,
    browseFiltered,
    loading: searchLoading,
    results: searchResults,
    error: searchError,
    filterOptions,
    versesIndex,
  } = useRigVedaSearch();

  useEffect(() => {
    bgMusicRef.current = new Audio("/sounds/spacebg.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = volume;

    // Try to autoplay immediately
    bgMusicRef.current.play().catch(() => {
      // If autoplay fails, wait for user interaction
      const playAudio = () => {
        bgMusicRef.current.play().catch(() => {});
        // Also play intro narration on first user interaction
        playNarration("intro");
        document.removeEventListener("click", playAudio);
        document.removeEventListener("touchstart", playAudio);
      };

      document.addEventListener("click", playAudio);
      document.addEventListener("touchstart", playAudio);
    });

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadRigVedaData();
      setRigVedaData(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isExploring) {
      const timer = setTimeout(() => {
        setHideAtoms(true);
      }, 600); // Hide atoms after zoom animation completes
      return () => clearTimeout(timer);
    } else {
      setHideAtoms(false);
    }
  }, [isExploring]);

  useEffect(() => {
    if (rigVedaData && selectedAtom !== null) {
      const mandalaNumber = selectedAtom + 1;
      const hymns = getAllHymnsFromMandala(rigVedaData, mandalaNumber, activeFilters);
      setCurrentHymns(hymns);
      setSelectedHymnIndex(0);
    } else {
      setCurrentHymns([]);
    }
  }, [rigVedaData, selectedAtom, activeFilters]);

  const toggleMute = () => {
    if (bgMusicRef.current) {
      if (isMuted) {
        bgMusicRef.current.volume = volume;
      } else {
        bgMusicRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Filter atoms based on mandala filter
  const getVisibleAtomIndices = () => {
    if (activeFilters.mandala && activeFilters.mandala !== "all") {
      return [parseInt(activeFilters.mandala) - 1]; // Only show the filtered mandala
    }
    return Array.from({ length: 10 }, (_, i) => i); // Show all mandalas
  };

  const visibleAtomIndices = getVisibleAtomIndices();

  const ATOM_POSITIONS = Array.from({ length: 10 }, (_, i) => {
    const angle = -(i / 10) * Math.PI * 2 + (4 * Math.PI) / 6; // Start at 11 o'clock, clockwise
    const radiusX = 8;
    const radiusY = 5;
    return [Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0];
  });

  const handleWordSelect = (word) => {
    setSelectedWord(word);
    setShowWordSidebar(true);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    // Optionally trigger a filtered browse or search with the new filters
    // For now, we'll just store them. They can be used in search or browse functions
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleSearchResultClick = (verse) => {
    // Close the search modal
    setShowSearchModal(false);

    // Reset exploration state if already exploring
    if (isExploring) {
      setIsExploring(false);
      setSelectedAtom(null);
      setShowOverlay(false);
    }

    // Get the mandala index (mandala number - 1)
    const mandalaIndex = verse.mandala - 1;

    // Small delay to ensure state is reset
    setTimeout(() => {
      // Set the selected atom to trigger the zoom animation
      setSelectedAtom(mandalaIndex);

      // Show the overlay first
      setTimeout(() => {
        setShowOverlay(true);

        // Then hide overlay and start exploring
        setTimeout(() => {
          setShowOverlay(false);
          setTimeout(() => {
            setIsExploring(true);
            setShowMandalaColor(true);

            // Load the hymns for this mandala
            if (rigVedaData) {
              const hymns = getAllHymnsFromMandala(
                rigVedaData,
                verse.mandala,
                activeFilters
              );

              // Find the index of the specific hymn
              const hymnIndex = hymns.findIndex(
                (h) => h.hymnNumber === verse.hymn
              );

              setCurrentHymns(hymns);
              setSelectedHymnIndex(hymnIndex >= 0 ? hymnIndex : 0);
              // Set the target verse number for scrolling
              setTargetVerseNumber(verse.verse);
            }
          }, 600);
        }, 500);
      }, 100);
    }, isExploring ? 100 : 0);
  };

  return (
    <>
      {selectedAtom !== null && (
        <BackButton
          onClick={() => {
            setSelectedAtom(null);
            setIsExploring(false);
            setShowMandalaColor(false);
            stopNarration();
          }}
        />
      )}

      <Navbar
        // Volume controls
        isMuted={isMuted}
        volume={volume}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        // Search
        onSearchClick={() => setShowSearchModal(true)}
        // Filter
        onFilterClick={() => setShowFilterModal(true)}
        // Stats
        totalVerses={versesIndex?.length || 4948}
        filteredCount={searchResults?.length}
        // Dictionary
        onDictionaryClick={() => setShowDictionary(true)}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={(query, topK) => search(query, topK, activeFilters)}
        onBrowse={(limit) => browseFiltered(activeFilters, limit)}
        onResultClick={handleSearchResultClick}
        results={searchResults}
        loading={searchLoading}
        error={searchError}
        filterOptions={filterOptions}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        filterOptions={filterOptions}
        initialFilters={activeFilters}
      />

      <Dictionary
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
      />

      <MandalaOverlay
        mandalaData={MANDALA_DATA}
        selectedAtom={selectedAtom}
        showOverlay={showOverlay}
        onExplore={() => {
          setShowOverlay(false);
          stopNarration();
          setTimeout(() => setIsExploring(true), 500);
        }}
      />

      <HymnsSidebar2D
        hymns={currentHymns}
        selectedHymnIndex={selectedHymnIndex}
        onHymnSelect={setSelectedHymnIndex}
        color={
          selectedAtom !== null ? MANDALA_DATA[selectedAtom].color : "#ffffff"
        }
        isVisible={isExploring}
      />

      <WordMeaningSidebar
        word={selectedWord}
        isVisible={showWordSidebar}
        onClose={() => setShowWordSidebar(false)}
        color={
          selectedAtom !== null ? MANDALA_DATA[selectedAtom].color : "#ffffff"
        }
      />

      <FilterIndicator
        activeFilters={activeFilters}
        onClearFilters={handleClearFilters}
      />

      <Canvas
        camera={{ position: [0, 0, 9] }}
        eventSource={document.getElementById("root")}
        eventPrefix="client"
        shadows
      >
        <Background
          showMandalaColor={showMandalaColor}
          selectedAtom={selectedAtom}
          mandalaData={MANDALA_DATA}
        />

        {!isExploring && (
          <Float
            speed={4}
            rotationIntensity={0.2}
            floatIntensity={1}
            floatingRange={[-0.125, 0.125]}
          >
            <group>
              <Text
                position={[0, 0.7, 0]}
                fontSize={1.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight={700}
              >
                RIG VEDA
              </Text>
              <Text
                position={[0, -0.5, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight={300}
              >
                Navigate ancient wisdom through 3D space
              </Text>
            </group>
          </Float>
        )}

        {!hideAtoms &&
          ATOM_POSITIONS.map((position, index) => {
            // Only render atoms that pass the filter
            if (!visibleAtomIndices.includes(index)) return null;

            return (
              <Float
                key={index}
                speed={4 + index * 0.2}
                rotationIntensity={0}
                floatIntensity={0.3}
                floatingRange={[-0.5, 0.5]}
              >
                <Atom
                  position={position}
                  number={index + 1}
                  onClick={() => setSelectedAtom(index)}
                  isZoomed={selectedAtom !== null}
                  color={MANDALA_DATA[index].color}
                />
              </Float>
            );
          })}

        <Rig
          selectedAtom={selectedAtom}
          atomPositions={ATOM_POSITIONS}
          setShowOverlay={setShowOverlay}
          isExploring={isExploring}
          setShowMandalaColor={setShowMandalaColor}
        />

        {!isExploring && (
          <RotatingStars
            showMandalaColor={showMandalaColor}
            selectedAtom={selectedAtom}
            mandalaData={MANDALA_DATA}
          />
        )}

        <HymnCardsContainer
          mandalaData={MANDALA_DATA}
          rigVedaData={rigVedaData}
          selectedAtom={selectedAtom}
          isExploring={isExploring}
          atomPositions={ATOM_POSITIONS}
          selectedHymnIndex={selectedHymnIndex}
          targetVerseNumber={targetVerseNumber}
          onWordSelect={handleWordSelect}
        />

        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.8}
            radius={0.9}
            intensity={1.5}
          />
        </EffectComposer>
      </Canvas>
    </>
  );
}
