import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Trail,
  Float,
  Sphere,
  Stars,
  Text,
  CameraControls,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Mandala data with colors and descriptions
const mandalaData = [
  {
    number: 1,
    emoji: "🔥",
    title: "Gateway to Vedic Wisdom",
    color: "#f59e0b",
    hymns: 191,
    family: "Multiple seers, primarily Madhucchandas",
    description:
      "The Gateway to Vedic Wisdom. With 191 hymns, this is the largest and most diverse mandala. It opens with Agni, the fire deity—whose name is literally the first word of the entire Rigveda. Start your journey here through hymns that introduce you to the cosmic dance of gods and nature, spanning themes of creation, ritual practices, and prayers for prosperity and divine protection.",
    deities: ["Agni (Fire God)", "Indra (King of Gods)", "Varuna (Cosmic Waters)", "Vishnu"],
    significance:
      "As the opening book, Mandala 1 sets the foundation for all Vedic wisdom. The very first hymn to Agni establishes fire as the cosmic mediator between humanity and the divine. This mandala serves as your comprehensive introduction to Vedic cosmology, containing the seeds of all major philosophical and ritual themes explored throughout the Rigveda.",
  },
  {
    number: 2,
    emoji: "🕉️",
    title: "The Ritual Foundation",
    color: "#fb923c",
    hymns: 43,
    family: "Gritsamada Śaunahotra and descendants",
    description:
      "The Ritual Foundation. Composed primarily by the Gritsamada family (35 of 43 hymns), these verses dive deep into Ṛta—the cosmic order that governs the universe, morality, and sacred rituals. Gritsamada, born to the Angirasa lineage but adopted into the Bhrigu family, brings a unique perspective that bridges warrior spirit with priestly wisdom.",
    deities: ["Agni (Fire God)", "Indra (Thunder God)", "Mitra-Varuna (Cosmic Order)", "Soma (Sacred Plant)"],
    significance:
      "This mandala represents the heartbeat of Vedic ceremonies, exploring Ṛta—the fundamental principle of natural order that regulates the cosmos, ethics, and ritual performance. Ṛta manifests at three levels: cosmic (governing nature's course), socio-ethical (imparting justice), and religio-spiritual (mirroring sacrificial rituals). The Gritsamada family's hymns are celebrated for their profound understanding of how ritual action maintains universal harmony.",
  },
  {
    number: 3,
    emoji: "⭐",
    title: "Home of the Sacred Gayatri",
    color: "#fde047",
    hymns: 62,
    family: "Viśvāmitra Gāthina",
    description:
      "★ Contains the most famous verse in Vedic literature—the Gayatri Mantra (3.62.10). Viśvāmitra, the legendary warrior-turned-sage, composed these 62 hymns that blend martial valor with profound spiritual illumination. Only 24 rishis since antiquity have understood the complete meaning and power of the Gayatri Mantra—Viśvāmitra was the very first.",
    deities: ["Savitṛ (Solar Deity)", "Indra (Warrior God)", "Agni (Sacred Fire)", "Viśvedevas (All Gods)"],
    significance:
      "The Gayatri Mantra (oṃ bhūr bhuvaḥ svaḥ tat savitur...) is the most recited Vedic verse in history, central to Hindu spiritual practice for over 3,000 years. This sukta is dedicated to Savitṛ, representing the source and inspiration of the universe through solar divinity. Imparting this mantra to young Hindu men during the Upanayana ceremony marks their spiritual initiation into Vedic study. Viśvāmitra's transformation from warrior king to enlightened seer embodies the mandala's central theme: the conquest of the self surpasses all worldly victories.",
  },
  {
    number: 4,
    emoji: "⚔️",
    title: "Songs of Warriors",
    color: "#ef4444",
    hymns: 58,
    family: "Vāmadeva Gautama",
    description:
      "Songs of Warriors. Vāmadeva, son of the sage Gotama, composed these 58 hymns celebrating heroism, cosmic battles, and the thunderous might of Indra. Feel the resonance of war drums and the glory of ancient heroes through verses rich in both literal battle accounts and allegorical spiritual conquests. These hymns include Dānastutis—praises of royal patrons who gave generous gifts after victorious battles.",
    deities: ["Indra (Supreme Warrior)", "Agni (Battle Fire)", "Ṛbhus (Divine Craftsmen)", "Ashvins (Divine Physicians)"],
    significance:
      "Beyond physical warfare, these hymns celebrate Indra as the personification of the spiritual warrior who has attained ultimate victory over inner demons. The famous slaying of Vṛtra (the dragon of chaos and drought) symbolizes the triumph of cosmic order over primordial chaos. Vāmadeva's compositions work on dual levels—as historical accounts of ancient Indo-Aryan battles and as profound metaphors for the soul's struggle toward enlightenment.",
  },
  {
    number: 5,
    emoji: "🌅",
    title: "Hymns of the Dawn",
    color: "#ec4899",
    hymns: 87,
    family: "Atri Bhauma and descendants",
    description:
      "Hymns of the Dawn. The Atri family's 87 verses paint the sky with exquisite poetry to Uṣas, goddess of dawn—the most exalted female deity in the Rigveda. Uṣas receives 40 hymns across the entire Rigveda, celebrated for 'consistently revealing herself with the daily coming of light to the world, driving away oppressive darkness, chasing evil demons, rousing all life, and sending everyone off to do their duties.' Here, philosophical depth meets the luminous beauty of morning light.",
    deities: ["Uṣas (Dawn Goddess)", "Agni (Morning Fire)", "Indra (Sky King)", "Maruts (Storm Gods)", "Ashvins (Divine Twins)"],
    significance:
      "Uṣas represents the eternal cycle of renewal, hope, and cosmic rhythm. As the daughter of heaven who appears each morning in radiant garments, she symbolizes divine grace that awakens consciousness and dispels the darkness of ignorance. The Atri family, one of the most ancient Vedic lineages, brings profound philosophical contemplation to their hymns—exploring not just the physical dawn but the awakening of spiritual awareness. This mandala bridges the natural and metaphysical worlds through luminous poetry.",
  },
  {
    number: 6,
    emoji: "📜",
    title: "The Poet's Collection",
    color: "#a855f7",
    hymns: 75,
    family: "Bharadvāja Bārhaspatya",
    description:
      "The Poet's Collection. The Bharadvājas are accorded pride of place amongst the family of seers—'the first among equals' alongside Viśvāmitras and Vasiṣṭhas. Bharadvāja Bārhaspatya, one of the most respected seers, composed 59 of these 75 hymns, which are celebrated for their literary excellence and refined composition. According to some scholars, this is the oldest book of the Rigveda. This is where supreme artistry meets divinity.",
    deities: ["Indra (Chief Deity)", "Agni (Sacred Flame)", "Maruts (Wind Warriors)", "Pūṣan (Divine Pathfinder)", "Sarasvatī (River Goddess)"],
    significance:
      "All features of classical Sanskrit poetry can be traced to the Rigveda, and Mandala 6 exemplifies this literary mastery. The Bharadvāja family's compositions demonstrate how sacred knowledge and aesthetic perfection unite—proof that spiritual truth and poetic beauty are inseparable in Vedic tradition. These hymns should be studied by anyone seeking to understand the foundations of Indian literature and spiritual culture, as they represent the pinnacle of Vedic poetic craft.",
  },
  {
    number: 7,
    emoji: "🌊",
    title: "Rivers of the Sacred",
    color: "#06b6d4",
    hymns: 104,
    family: "Vasiṣṭha Maitrāvaruṇi",
    description:
      "Rivers of the Sacred. Vasiṣṭha's 104 hymns flow like the seven sacred rivers they celebrate. Dive into verses for Varuṇa, god of cosmic waters and universal law, and discover ancient sacred geography. Vasiṣṭha, born of Varuṇa-Mitra and the celestial nymph Urvaśī, brings an intimate understanding of water's divine nature—both as physical rivers that nourish civilization and as the flowing streams of cosmic Ṛta that maintain universal order.",
    deities: ["Varuṇa (Cosmic Waters)", "Mitra-Varuṇa (Divine Monarchs)", "Indra (Rain Bringer)", "Sarasvatī (Sacred River)", "Āpaḥ (The Waters)"],
    significance:
      "Mitra-Varuṇa are described as youthful monarchs clad in glistening garments, residing in a golden palace with a thousand pillars and gates, lords of rivers, rain, and heavenly order. When Sage Vasiṣṭha faced water scarcity during a yajña, Varuṇa created a river for him—illustrating the deep bond between this seer and the water deities. The famous river hymn (7.49) preserves invaluable geographical knowledge of ancient India while celebrating water as the source of life, purity, and cosmic law.",
  },
  {
    number: 8,
    emoji: "🍃",
    title: "Mysteries of Soma",
    color: "#10b981",
    hymns: 103,
    family: "Kāṇva and multiple seers",
    description:
      "Mysteries of Soma. The Kāṇva family's 103 hymns explore the mystical soma drink—entering the esoteric realm where ritual meets altered consciousness and spiritual elevation. These verses describe soma as an entheogenic substance associated with the dissolution of ego, key to enlightenment in mystical traditions. Notably, this mandala bears the most striking similarity to the Avesta, suggesting deep connections to ancient Persian mystical practices.",
    deities: ["Indra (Soma Drinker)", "Soma (Sacred Elixir)", "Agni (Ritual Fire)", "Aśvins (Divine Healers)", "Maruts (Storm Spirits)"],
    significance:
      "Hymns 8.49-8.59, known as the Vālakhilya, are considered apocryphal—a recent addition representing post-Rigvedic developments in soma mysticism. The Kāṇva seers reveal soma not merely as a ritual beverage but as a gateway to transcendent states of consciousness. The effects of soma—spiritual elevation, ego dissolution, and divine communion—place these hymns at the intersection of mysticism, shamanism, and Vedic ritual. The Persian connections hint at shared Indo-Iranian spiritual practices predating the split of these ancient cultures.",
  },
  {
    number: 9,
    emoji: "💚",
    title: "The Soma Mandala",
    color: "#84cc16",
    hymns: 114,
    family: "Multiple seers (organized by metre, not authorship)",
    description:
      "💚 UNIQUE: The only mandala in the entire Rigveda dedicated to a single deity. All 114 hymns address Soma Pavamāna—'the Purifying, the Flowing One.' This mandala focuses exclusively on one sacred moment: when the pressed soma juice is poured across the sheep's fleece that purifies it. Unlike all other mandalas organized by authorship, Mandala 9 is structured by metrical patterns, emphasizing the rhythm and flow of purification itself.",
    deities: ["Soma Pavamāna (Purified Soma) - exclusively"],
    significance:
      "Pavamāna means 'that which flows' and 'that which purifies'—capturing soma's dual nature as both liquid and sanctifying force. This is the only major grouping in the Rigveda devoted to a single ritual procedure, treating the deified soma at the precise moment of purification. The mandala's unique organization by metre rather than author suggests that the hypnotic, flowing quality of the verses mirrors the filtering of soma through the ritual strainer. This is pure devotional focus—114 hymns contemplating the moment when the sacred becomes the supremely sacred.",
  },
];

export default function App() {
  const bgMusicRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showSlider, setShowSlider] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [showMandalaColor, setShowMandalaColor] = useState(false);

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

  const atomPositions = Array.from({ length: 9 }, (_, i) => {
    const angle = -(i / 9) * Math.PI * 2 + (4 * Math.PI) / 6; // Start at 11 o'clock, clockwise
    const radiusX = 8;
    const radiusY = 5;
    return [Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0];
  });

  return (
    <>
      {selectedAtom !== null && (
        <button
          onClick={() => {
            setSelectedAtom(null);
            setIsExploring(false);
            setShowMandalaColor(false);
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            color: "white",
            cursor: "pointer",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          ←
        </button>
      )}

      {selectedAtom !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "450px",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(20px)",
            borderLeft: `2px solid ${mandalaData[selectedAtom].color}40`,
            padding: "40px 30px",
            zIndex: 999,
            transform: showOverlay ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.5s ease",
            color: "white",
            overflowY: "auto",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <span style={{ fontSize: "3rem" }}>
              {mandalaData[selectedAtom].emoji}
            </span>
            <div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "5px",
                  fontWeight: 700,
                  color: mandalaData[selectedAtom].color,
                }}
              >
                Mandala {selectedAtom + 1}
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                }}
              >
                {mandalaData[selectedAtom].title}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "25px",
              fontSize: "0.85rem",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            <div>
              <strong style={{ color: mandalaData[selectedAtom].color }}>
                {mandalaData[selectedAtom].hymns}
              </strong>{" "}
              hymns
            </div>
            <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.3)", paddingLeft: "20px" }}>
              <strong>Family:</strong> {mandalaData[selectedAtom].family}
            </div>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                fontWeight: 600,
                color: mandalaData[selectedAtom].color,
              }}
            >
              Overview
            </h3>
            <p
              style={{
                lineHeight: "1.7",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "0.95rem",
              }}
            >
              {mandalaData[selectedAtom].description}
            </p>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                fontWeight: 600,
                color: mandalaData[selectedAtom].color,
              }}
            >
              Key Deities
            </h3>
            <ul
              style={{
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.9rem",
                paddingLeft: "20px",
                listStyle: "none",
              }}
            >
              {mandalaData[selectedAtom].deities.map((deity, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>
                  <span style={{ color: mandalaData[selectedAtom].color, marginRight: "8px" }}>
                    •
                  </span>
                  {deity}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "12px",
                fontWeight: 600,
                color: mandalaData[selectedAtom].color,
              }}
            >
              Significance
            </h3>
            <p
              style={{
                lineHeight: "1.7",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "0.95rem",
              }}
            >
              {mandalaData[selectedAtom].significance}
            </p>
          </div>

          <button
            onClick={() => {
              setShowOverlay(false);
              setTimeout(() => setIsExploring(true), 500);
            }}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "16px 24px",
              background: `linear-gradient(135deg, ${mandalaData[selectedAtom].color}, ${mandalaData[selectedAtom].color}dd)`,
              border: `2px solid ${mandalaData[selectedAtom].color}`,
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 8px 20px ${mandalaData[selectedAtom].color}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ✨ Click to Explore
          </button>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <div
          style={{
            opacity: showSlider ? 1 : 0,
            transform: showSlider ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.3s ease",
            pointerEvents: showSlider ? "auto" : "none",
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            orient="vertical"
            style={{
              accentColor: "white",
              cursor: "pointer",
              writingMode: "bt-lr",
              WebkitAppearance: "slider-vertical",
              height: "100px",
              width: "20px",
            }}
          />
        </div>
        <button
          onClick={toggleMute}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            color: "white",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 0, 9] }}
        eventSource={document.getElementById("root")}
        eventPrefix="client"
      >
        <Background showMandalaColor={showMandalaColor} selectedAtom={selectedAtom} mandalaData={mandalaData} />

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

        {atomPositions.map((position, index) => (
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
              color={mandalaData[index].color}
            />
          </Float>
        ))}

        <Rig
          selectedAtom={selectedAtom}
          atomPositions={atomPositions}
          setShowOverlay={setShowOverlay}
          isExploring={isExploring}
          setShowMandalaColor={setShowMandalaColor}
        />

        <Stars
          saturation={showMandalaColor && selectedAtom !== null ? 0.3 : 0}
          count={400}
          speed={0.5}
          color={showMandalaColor && selectedAtom !== null ? mandalaData[selectedAtom].color : "white"}
        />
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.8} radius={0.9} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </>
  );
}

function Background({ showMandalaColor, selectedAtom, mandalaData }) {
  const { scene } = useThree();

  useEffect(() => {
    if (!scene.background) {
      scene.background = new THREE.Color(0, 0, 0);
    }
  }, [scene]);

  useFrame(() => {
    if (!scene.background) return;

    if (showMandalaColor && selectedAtom !== null) {
      const hexColor = mandalaData[selectedAtom].color;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
      if (result) {
        const r = (parseInt(result[1], 16) / 255) * 0.2;
        const g = (parseInt(result[2], 16) / 255) * 0.2;
        const b = (parseInt(result[3], 16) / 255) * 0.2;
        const targetColor = new THREE.Color(r, g, b);
        scene.background.lerp(targetColor, 0.05);
      }
    } else {
      const targetColor = new THREE.Color(0, 0, 0);
      scene.background.lerp(targetColor, 0.05);
    }
  });

  return null;
}

function Rig({ selectedAtom, atomPositions, setShowOverlay, isExploring, setShowMandalaColor }) {
  const { controls } = useThree();

  useEffect(() => {
    if (isExploring && selectedAtom !== null && controls) {
      const targetPos = atomPositions[selectedAtom];

      // Directly zoom very close into the number
      controls.setLookAt(
        targetPos[0],
        targetPos[1],
        targetPos[2] + 0.01,
        targetPos[0],
        targetPos[1],
        targetPos[2],
        true
      );

      // Change color after zoom completes
      const timer = setTimeout(() => {
        setShowMandalaColor(true);
      }, 600);

      return () => clearTimeout(timer);
    } else if (selectedAtom !== null && controls && !isExploring) {
      const targetPos = atomPositions[selectedAtom];
      // First zoom in centered on atom
      controls.setLookAt(
        targetPos[0],
        targetPos[1],
        targetPos[2] + 2,
        targetPos[0],
        targetPos[1],
        targetPos[2],
        true
      );

      // Wait 800ms then show overlay AND shift camera position
      const timer = setTimeout(() => {
        setShowOverlay(true);
        // Pan camera to the right - makes atom appear on left side of 2D screen
        controls.setLookAt(
          targetPos[0] + 0.5,
          targetPos[1],
          targetPos[2] + 2,
          targetPos[0] + 0.5,
          targetPos[1],
          targetPos[2],
          true
        );
      }, 500);

      return () => clearTimeout(timer);
    } else if (controls && !isExploring) {
      // Hide overlay immediately when zooming out
      setShowOverlay(false);
      setShowMandalaColor(false);
      // Zoom out to default view
      controls.setLookAt(0, 0, 9, 0, 0, 0, true);
    }
  }, [selectedAtom, controls, atomPositions, setShowOverlay, isExploring, setShowMandalaColor]);

  return (
    <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
  );
}

function Atom({ number, onClick, isZoomed, color, ...props }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const sphereMatRef = useRef();
  const audioRef = useRef(null);

  // Convert hex color to THREE.Color with brightness multiplier
  const hexToThreeColor = (hex, brightness = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return new THREE.Color(
        (parseInt(result[1], 16) / 255) * brightness,
        (parseInt(result[2], 16) / 255) * brightness,
        (parseInt(result[3], 16) / 255) * brightness
      );
    }
    return new THREE.Color(6, 0.5, 2);
  };

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

function Electron({ radius = 2.75, speed = 6, hovered, color, ...props }) {
  const ref = useRef();
  const matRef = useRef();
  const [trailWidth, setTrailWidth] = useState(1);

  // Convert hex color to THREE.Color with brightness multiplier
  const hexToThreeColor = (hex, brightness = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return new THREE.Color(
        (parseInt(result[1], 16) / 255) * brightness,
        (parseInt(result[2], 16) / 255) * brightness,
        (parseInt(result[3], 16) / 255) * brightness
      );
    }
    return new THREE.Color(10, 1, 10);
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.set(
      Math.sin(t) * radius,
      (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25,
      0
    );

    if (matRef.current) {
      const targetColor = hovered
        ? hexToThreeColor(color, 10)
        : hexToThreeColor(color, 6);
      matRef.current.color.lerp(targetColor, 0.1);
    }

    const targetWidth = hovered ? 3 : 1;
    setTrailWidth((current) => current + (targetWidth - current) * 0.1);
  });

  return (
    <group {...props}>
      <Trail
        width={trailWidth}
        length={9}
        color={hovered ? hexToThreeColor(color, 5) : hexToThreeColor(color, 2.5)}
        attenuation={(t) => t * t}
      >
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial
            ref={matRef}
            color={hexToThreeColor(color, 6)}
            toneMapped={false}
          />
        </mesh>
      </Trail>
    </group>
  );
}
