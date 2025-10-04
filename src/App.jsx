import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MANDALA_DATA } from "./data/MandalaData";
import { loadRigVedaData, getAllHymnsFromMandala } from "./utils/DataLoader";
import AudioControls from "./components/ui/AudioControls";
import BackButton from "./components/ui/BackButton";
import MandalaOverlay from "./components/ui/MandalaOverlay";
import HymnsSidebar2D from "./components/ui/HymnsSidebar2D";
import RotatingStars from "./components/three/RotatingStars";
import Background from "./components/three/Background";
import Rig from "./components/three/Rig";
import Atom from "./components/three/Atom";
import HymnCardsContainer from "./components/three/HymnCardsContainer";

export default function App() {
  const bgMusicRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showSlider, setShowSlider] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [showMandalaColor, setShowMandalaColor] = useState(false);
  const [rigVedaData, setRigVedaData] = useState(null);
  const [hideAtoms, setHideAtoms] = useState(false);
  const [selectedHymnIndex, setSelectedHymnIndex] = useState(0);
  const [currentHymns, setCurrentHymns] = useState([]);

  useEffect(() => {
    bgMusicRef.current = new Audio("/sounds/spacebg.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = volume;

    // Try to autoplay immediately
    bgMusicRef.current.play().catch(() => {
      // If autoplay fails, wait for user interaction
      const playAudio = () => {
        bgMusicRef.current.play().catch(() => {});
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
      const hymns = getAllHymnsFromMandala(rigVedaData, mandalaNumber);
      setCurrentHymns(hymns);
      setSelectedHymnIndex(0);
    } else {
      setCurrentHymns([]);
    }
  }, [rigVedaData, selectedAtom]);

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

  const ATOM_POSITIONS = Array.from({ length: 10 }, (_, i) => {
    const angle = -(i / 10) * Math.PI * 2 + (4 * Math.PI) / 6; // Start at 11 o'clock, clockwise
    const radiusX = 8;
    const radiusY = 5;
    return [Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0];
  });

  return (
    <>
      {selectedAtom !== null && (
        <BackButton
          onClick={() => {
            setSelectedAtom(null);
            setIsExploring(false);
            setShowMandalaColor(false);
          }}
        />
      )}

      <MandalaOverlay
        mandalaData={MANDALA_DATA}
        selectedAtom={selectedAtom}
        showOverlay={showOverlay}
        onExplore={() => {
          setShowOverlay(false);
          setTimeout(() => setIsExploring(true), 500);
        }}
      />

      <HymnsSidebar2D
        hymns={currentHymns}
        selectedHymnIndex={selectedHymnIndex}
        onHymnSelect={setSelectedHymnIndex}
        color={selectedAtom !== null ? MANDALA_DATA[selectedAtom].color : "#ffffff"}
        isVisible={isExploring}
      />

      <AudioControls
        isMuted={isMuted}
        volume={volume}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        showSlider={showSlider}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      />

      <Canvas
        camera={{ position: [0, 0, 9] }}
        eventSource={document.getElementById("root")}
        eventPrefix="client"
      >
        <Background showMandalaColor={showMandalaColor} selectedAtom={selectedAtom} mandalaData={MANDALA_DATA} />

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

        {!hideAtoms && ATOM_POSITIONS.map((position, index) => (
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
        ))}

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
        />

        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.8} radius={0.9} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </>
  );
}
