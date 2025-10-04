import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  CARD_VERTEX_SHADER,
  CARD_FRAGMENT_SHADER,
} from "../../utils/CardShader";
import { hexToThreeColor } from "../../utils/ColorUtils";
import "./ScrollableHymnCard.css";

const CARD_SIZE = [10, 12];

export default function ScrollableHymnCard({
  hymn,
  mandala,
  color,
  position,
  ...props
}) {
  const cardRef = useRef();
  const materialRef = useRef();
  const audioRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordHighlightEnabled, setWordHighlightEnabled] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Reset audio and scroll when hymn changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentVerseIndex(0);
    setCurrentWordIndex(0);

    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [hymn.hymnNumber, mandala]);

  // Handle word click - open in new tab
  const handleWordClick = (word) => {
    const url = `https://www.learnsanskrit.cc/translate?search=${encodeURIComponent(
      word
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSelectedWord({ word });
  };

  const shaderMaterial = useMemo(
    () => ({
      vertexShader: CARD_VERTEX_SHADER,
      fragmentShader: CARD_FRAGMENT_SHADER,
      uniforms: {
        uColor: { value: hexToThreeColor(color, 1.0) },
        uTime: { value: 0 },
        uAlpha: { value: 0.75 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    }),
    [color]
  );

  // Helper function to render text with word highlighting (only for Sanskrit)
  const renderHighlightedText = (
    text,
    isCurrentVerse,
    enableHighlight = false
  ) => {
    if (!text) return text;

    const words = text.split(/\s+/);
    return words.map((word, index) => {
      const isHighlighted =
        isCurrentVerse &&
        isPlaying &&
        enableHighlight &&
        wordHighlightEnabled &&
        index === currentWordIndex;
      const isSelected = selectedWord && selectedWord.word === word;

      return (
        <span
          key={index}
          className={`clickable-word ${
            isHighlighted ? "highlighted-word" : ""
          } ${isSelected ? "selected-word" : ""}`}
          onClick={() => handleWordClick(word)}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) {
      // Create audio element for the hymn (files are named as {hymnNumber}.mp3)
      const audioPath = `/data/audio/${mandala}/${hymn.hymnNumber}.mp3`;
      audioRef.current = new Audio(audioPath);

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentVerseIndex(0);
        setCurrentWordIndex(0);
      });

      audioRef.current.addEventListener("error", () => {
        console.warn(`Audio file not found: ${audioPath}`);
        setIsPlaying(false);
      });

      // Track playback progress and highlight verses and words
      audioRef.current.addEventListener("timeupdate", () => {
        if (!hymn.verses || hymn.verses.length === 0) return;

        const audio = audioRef.current;
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        if (duration && !isNaN(duration)) {
          // Estimate verse timing based on equal distribution
          const verseCount = hymn.verses.length;
          const verseDuration = duration / verseCount;
          const newVerseIndex = Math.min(
            Math.floor(currentTime / verseDuration),
            verseCount - 1
          );

          if (newVerseIndex !== currentVerseIndex) {
            setCurrentVerseIndex(newVerseIndex);
            setCurrentWordIndex(0); // Reset word index when verse changes

            // Auto-scroll to current verse
            const verseElement = document.getElementById(
              `verse-${newVerseIndex}`
            );
            if (verseElement && scrollContainerRef.current) {
              verseElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }

          // Calculate word-level timing within the current verse
          const currentVerse = hymn.verses[newVerseIndex];
          if (currentVerse && currentVerse.sanskrit) {
            const words = currentVerse.sanskrit.split(/\s+/);
            const wordCount = words.length;
            const wordDuration = verseDuration / wordCount;
            const timeInVerse = currentTime - newVerseIndex * verseDuration;
            const newWordIndex = Math.min(
              Math.floor(timeInVerse / wordDuration),
              wordCount - 1
            );

            if (newWordIndex !== currentWordIndex) {
              setCurrentWordIndex(newWordIndex);
            }
          }
        }
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback failed:", err.message);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  return (
    <group ref={cardRef} position={position} {...props}>
      {/* Card background with shader */}
      <mesh castShadow>
        <planeGeometry args={CARD_SIZE} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          {...shaderMaterial}
        />
      </mesh>

      {/* HTML content */}
      <Html
        transform
        position={[0, 0, 0.1]}
        scale={0.65}
        occlude
        zIndexRange={[100, 0]}
        style={{
          width: "500px",
          height: "600px",
          pointerEvents: "auto",
        }}
      >
        <div
          className="scrollable-hymn-container"
          style={{
            width: "4666px",
            height: "5333px",
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div className="hymn-header">
            <div className="hymn-title-section">
              <h2 className="hymn-number" style={{ color }}>
                Hymn {hymn.number}
              </h2>
              {hymn.title && <h3 className="hymn-title">{hymn.title}</h3>}
              <div className="hymn-meta">
                {hymn.verseCount > 0 && (
                  <span className="verse-count">{hymn.verseCount} verses</span>
                )}
              </div>
            </div>
            <div className="hymn-controls">
              <button
                className="toggle-highlight-btn"
                onClick={() => setWordHighlightEnabled(!wordHighlightEnabled)}
                style={{ borderColor: color, color }}
                title={
                  wordHighlightEnabled
                    ? "Disable Word Highlight"
                    : "Enable Word Highlight"
                }
              >
                {wordHighlightEnabled ? "✨" : "○"}
              </button>
              <button
                className="play-audio-btn"
                onClick={handlePlayAudio}
                style={{ borderColor: color, color }}
                title={isPlaying ? "Pause Audio" : "Play Audio"}
              >
                {isPlaying ? "⏸" : "🔊"}
              </button>
            </div>
          </div>

          {/* Scrollable verses content */}
          <div className="hymn-verses-scroll" ref={scrollContainerRef}>
            {hymn.verses && hymn.verses.length > 0 ? (
              hymn.verses.map((verse, index) => (
                <div
                  key={index}
                  id={`verse-${index}`}
                  className={`verse-item ${
                    currentVerseIndex === index ? "active" : ""
                  }`}
                >
                  <div className="verse-number" style={{ color }}>
                    Verse {index + 1}
                  </div>

                  {verse.sanskrit && (
                    <div
                      className="verse-sanskrit"
                      style={{ color: hexToThreeColor(color, 1.3) }}
                    >
                      {renderHighlightedText(
                        verse.sanskrit,
                        currentVerseIndex === index,
                        true
                      )}
                    </div>
                  )}

                  {verse.transliteration && (
                    <div
                      className="verse-sanskrit"
                      style={{ color: hexToThreeColor(color, 1.3) }}
                    >
                      {renderHighlightedText(
                        verse.transliteration,
                        currentVerseIndex === index,
                        true
                      )}
                    </div>
                  )}

                  {verse.translation && (
                    <div className="verse-translation">{verse.translation}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-verses">No verses available</div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
