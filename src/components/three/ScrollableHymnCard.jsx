import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import {
  CARD_VERTEX_SHADER,
  CARD_FRAGMENT_SHADER,
} from "../../utils/CardShader";
import { hexToThreeColor } from "../../utils/ColorUtils";
import "./ScrollableHymnCard.css";

const CARD_SIZE = [15, 15, 0.3]; // Width, Height, Depth - thin for card-like appearance

export default function ScrollableHymnCard({
  hymn,
  mandala,
  color,
  position,
  targetVerseNumber,
  onWordSelect,
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
  const [rotationTarget, setRotationTarget] = useState(0);
  const previousHymnNumber = useRef(hymn.hymnNumber);

  const { size } = useThree();
  const [responsiveScale, setResponsiveScale] = useState(1);

  // Calculate responsive scaling based on viewport
  useEffect(() => {
    const width = size.width;
    const height = size.height;

    // Base scale for desktop (1920x1080)
    const baseWidth = 1920;
    const baseHeight = 1080;

    // Calculate scale factor based on smaller dimension to prevent overflow
    const scaleX = width / baseWidth;
    const scaleY = height / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1.2); // Cap at 1.2x max

    setResponsiveScale(Math.max(scale, 0.5)); // Minimum 0.5x
  }, [size]);

  // Spring animation for cube rotation
  const { rotation } = useSpring({
    rotation: rotationTarget,
    config: { mass: 1, tension: 180, friction: 26 },
  });

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Reset audio and scroll when hymn changes + trigger rotation
  useEffect(() => {
    const currentHymnNumber = hymn.hymnNumber;
    const prevHymnNumber = previousHymnNumber.current;

    // Calculate rotation based on hymn difference
    const difference = currentHymnNumber - prevHymnNumber;

    // Determine direction: positive difference = counter-clockwise, negative = clockwise (reversed)
    const direction = difference > 0 ? -1 : 1;

    // Single elegant flip - 180 degrees
    const rotationAmount = Math.PI * direction;

    // Trigger flip animation - always snap to 180 degree increments (front/back alignment)
    setRotationTarget((prev) => {
      const newRotation = prev + rotationAmount;
      // Round to nearest 180 degrees to ensure face alignment
      return Math.round(newRotation / Math.PI) * Math.PI;
    });

    // Update previous hymn number
    previousHymnNumber.current = currentHymnNumber;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentVerseIndex(0);
    setCurrentWordIndex(0);

    // Reset scroll to top or scroll to target verse
    // Force immediate scroll to top first
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    // Then handle target verse scroll if needed
    if (targetVerseNumber && scrollContainerRef.current) {
      setTimeout(() => {
        const verseElement = document.getElementById(
          `verse-${hymn.hymnNumber}-${targetVerseNumber - 1}`
        );
        if (verseElement && scrollContainerRef.current) {
          // Calculate position relative to scroll container
          const container = scrollContainerRef.current;
          const verseOffset = verseElement.offsetTop;

          // Scroll within the container instead of the viewport
          container.scrollTo({
            top: verseOffset - 20, // 20px offset from top for better visibility
            behavior: "smooth"
          });
        }
      }, 300);
    }
  }, [hymn.hymnNumber, mandala, targetVerseNumber]);

  // Handle word click - notify parent
  const handleWordClick = (word) => {
    setSelectedWord({ word });
    if (onWordSelect) {
      onWordSelect(word);
    }
  };

  // Handle verse click - jump to that verse in audio
  const handleVerseClick = (e, verseIndex) => {
    e.stopPropagation(); // Prevent event bubbling

    // Create audio if it doesn't exist
    if (!audioRef.current) {
      const audioPath = `/data/audio/${mandala}/${hymn.hymnNumber}.mp3`;
      audioRef.current = new Audio(audioPath);
      audioRef.current.volume = 0.8;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentVerseIndex(0);
        setCurrentWordIndex(0);
      };

      audioRef.current.onerror = () => {
        console.warn(`Audio file not found: ${audioPath}`);
        setIsPlaying(false);
      };

      // Set up time update listener
      audioRef.current.addEventListener("timeupdate", () => {
        if (!hymn.verses || hymn.verses.length === 0) return;

        const audio = audioRef.current;
        if (!audio) return;

        const duration = audio.duration;
        const currentTime = audio.currentTime;

        if (duration && !isNaN(duration) && duration > 0) {
          const verseCount = hymn.verses.length;
          const verseDuration = duration / verseCount;
          const newVerseIndex = Math.min(
            Math.floor(currentTime / verseDuration),
            verseCount - 1
          );

          if (newVerseIndex !== currentVerseIndex) {
            setCurrentVerseIndex(newVerseIndex);
            setCurrentWordIndex(0);

            setTimeout(() => {
              const verseElement = document.getElementById(
                `verse-${hymn.hymnNumber}-${newVerseIndex}`
              );
              if (verseElement) {
                const container = verseElement.closest(".hymn-verses-scroll");
                if (container) {
                  const verseTop = verseElement.offsetTop;
                  const containerHeight = container.clientHeight;
                  const verseHeight = verseElement.clientHeight;
                  const scrollPosition =
                    verseTop - containerHeight / 2 + verseHeight / 2;

                  container.scrollTo({
                    top: scrollPosition,
                    behavior: "smooth",
                  });
                }
              }
            }, 100);
          }

          const currentVerse = hymn.verses[newVerseIndex];
          if (currentVerse && currentVerse.sanskrit) {
            const words = currentVerse.sanskrit.split(/\s+/);
            const actualWords = words.filter(word => !/^[|ǀ॥]+$/.test(word));
            const wordCount = actualWords.length;
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

    // Wait for metadata to load, then seek to verse
    const seekToVerse = () => {
      const duration = audioRef.current.duration;
      if (duration && !isNaN(duration) && duration > 0) {
        const verseCount = hymn.verses.length;
        const verseDuration = duration / verseCount;
        const targetTime = verseIndex * verseDuration;
        audioRef.current.currentTime = targetTime;
        setCurrentVerseIndex(verseIndex);
        setCurrentWordIndex(0);
      }
    };

    if (audioRef.current.readyState >= 1) {
      // Metadata already loaded
      seekToVerse();
    } else {
      // Wait for metadata
      audioRef.current.addEventListener('loadedmetadata', seekToVerse, { once: true });
    }
  };

  // Helper function to render hymn content
  const renderHymnContent = () => (
    <div
      className="scrollable-hymn-container"
      onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.stopPropagation();
              setWordHighlightEnabled(!wordHighlightEnabled);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio();
            }}
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
              key={`${hymn.hymnNumber}-${index}`}
              id={`verse-${hymn.hymnNumber}-${index}`}
              className={`verse-item ${
                currentVerseIndex === index ? "active" : ""
              }`}
              onClick={(e) => handleVerseClick(e, index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="verse-number" style={{ color }}>
                Verse {mandala}.{hymn.hymnNumber}.{index + 1}
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
                  {verse.transliteration}
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
  );

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

    // Filter out separator characters like |, ǀ, ॥ from word count for highlighting
    const isSeparator = (word) => /^[|ǀ॥]+$/.test(word);

    // Track actual word index (excluding separators)
    let wordCount = 0;

    return words.map((word, index) => {
      const isSep = isSeparator(word);
      const currentWordForHighlight = isSep ? -1 : wordCount;

      const isHighlighted =
        isCurrentVerse &&
        isPlaying &&
        enableHighlight &&
        wordHighlightEnabled &&
        currentWordForHighlight === currentWordIndex &&
        !isSep;

      const isSelected = selectedWord && selectedWord.word === word && !isSep;

      // Increment word count only for non-separators
      if (!isSep) wordCount++;

      return (
        <span
          key={index}
          className={`${isSep ? '' : 'clickable-word'} ${
            isHighlighted ? "highlighted-word" : ""
          } ${isSelected ? "selected-word" : ""}`}
          onClick={(e) => {
            if (!isSep) {
              e.stopPropagation();
              handleWordClick(word);
            }
          }}
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
        if (!audio) return;

        const duration = audio.duration;
        const currentTime = audio.currentTime;

        if (duration && !isNaN(duration) && duration > 0) {
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

            // Auto-scroll to current verse within the scroll container
            setTimeout(() => {
              const verseElement = document.getElementById(
                `verse-${hymn.hymnNumber}-${newVerseIndex}`
              );
              if (verseElement) {
                const container = verseElement.closest(".hymn-verses-scroll");
                if (container) {
                  const verseTop = verseElement.offsetTop;
                  const containerHeight = container.clientHeight;
                  const verseHeight = verseElement.clientHeight;

                  // Scroll to center the verse in the container
                  const scrollPosition =
                    verseTop - containerHeight / 2 + verseHeight / 2;

                  container.scrollTo({
                    top: scrollPosition,
                    behavior: "smooth",
                  });
                }
              }
            }, 100);
          }

          // Calculate word-level timing within the current verse
          const currentVerse = hymn.verses[newVerseIndex];
          if (currentVerse && currentVerse.sanskrit) {
            const words = currentVerse.sanskrit.split(/\s+/);
            // Filter out separator characters for word count
            const actualWords = words.filter(word => !/^[|ǀ॥]+$/.test(word));
            const wordCount = actualWords.length;
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

  const htmlScale = useMemo(() => responsiveScale, [responsiveScale]);

  return (
    <animated.group
      ref={cardRef}
      position={position}
      rotation-y={rotation}
      scale={responsiveScale}
      {...props}
    >
      {/* Card background cube with shader */}
      <mesh castShadow>
        <boxGeometry args={CARD_SIZE} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          {...shaderMaterial}
        />
      </mesh>

      {/* Front face */}
      <Html
        transform
        position={[0, 0, CARD_SIZE[2] / 2 + 0.01]}
        rotation={[0, 0, 0]}
        scale={htmlScale}
        occlude
        zIndexRange={[100, 0]}
        style={{
          width: "500px",
          height: "600px",
          pointerEvents: "auto",
        }}
      >
        {renderHymnContent()}
      </Html>

      {/* Back face (flipped) */}
      <Html
        transform
        position={[0, 0, -CARD_SIZE[2] / 2 - 0.01]}
        rotation={[0, Math.PI, 0]}
        scale={htmlScale}
        occlude
        zIndexRange={[100, 0]}
        style={{
          width: "500px",
          height: "600px",
          pointerEvents: "auto",
        }}
      >
        {renderHymnContent()}
      </Html>
    </animated.group>
  );
}
