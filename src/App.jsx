import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Trail, Float, Sphere, Stars, Text, Html, CameraControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function App() {
  const bgMusicRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showSlider, setShowSlider] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);

  useEffect(() => {
    bgMusicRef.current = new Audio('/sounds/spacebg.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = volume;

    // Try to autoplay immediately
    bgMusicRef.current.play().catch(() => {
      // If autoplay fails, wait for user interaction
      const playAudio = () => {
        bgMusicRef.current.play().catch(() => {});
        document.removeEventListener('click', playAudio);
        document.removeEventListener('touchstart', playAudio);
      };

      document.addEventListener('click', playAudio);
      document.addEventListener('touchstart', playAudio);
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
          onClick={() => setSelectedAtom(null)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          ←
        </button>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
      >
        <div
          style={{
            opacity: showSlider ? 1 : 0,
            transform: showSlider ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.3s ease',
            pointerEvents: showSlider ? 'auto' : 'none'
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
              accentColor: 'white',
              cursor: 'pointer',
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical',
              height: '100px',
              width: '20px'
            }}
          />
        </div>
        <button
          onClick={toggleMute}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 9] }} eventSource={document.getElementById('root')} eventPrefix="client">
        <color attach="background" args={["black"]} />

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
            isSelected={selectedAtom === index}
          />
        </Float>
      ))}

      <Rig selectedAtom={selectedAtom} atomPositions={atomPositions} />

      <Stars saturation={0} count={400} speed={0.5} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} radius={0.7} />
      </EffectComposer>
      </Canvas>
    </>
  );
}

function Rig({ selectedAtom, atomPositions }) {
  const { controls } = useThree();

  useEffect(() => {
    if (selectedAtom !== null && controls) {
      const targetPos = atomPositions[selectedAtom];
      // Zoom in close to the atom
      controls.setLookAt(
        targetPos[0], targetPos[1], targetPos[2] + 2,
        targetPos[0], targetPos[1], targetPos[2],
        true
      );
    } else if (controls) {
      // Zoom out to default view
      controls.setLookAt(0, 0, 9, 0, 0, 0, true);
    }
  }, [selectedAtom, controls, atomPositions]);

  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />;
}

function Atom({ number, onClick, ...props }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const sphereMatRef = useRef();
  const audioRef = useRef(null);

  const handlePointerEnter = () => {
    setHovered(true);
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/hover.mp3');
      audioRef.current.volume = 1.0;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 0.5 : 0.4;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
    if (sphereMatRef.current) {
      const targetColor = hovered
        ? new THREE.Color(10, 2, 5)
        : new THREE.Color(6, 0.5, 2);
      sphereMatRef.current.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <group ref={groupRef} {...props} scale={0.4}>
      <mesh
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
        visible={false}
      >
        <sphereGeometry args={[3]} />
      </mesh>
      <Electron position={[0, 0, 0.5]} speed={3} hovered={hovered} />
      <Electron
        position={[0, 0, 0.5]}
        rotation={[0, 0, Math.PI / 3]}
        speed={3.5}
        hovered={hovered}
      />
      <Electron
        position={[0, 0, 0.5]}
        rotation={[0, 0, -Math.PI / 3]}
        speed={4}
        hovered={hovered}
      />
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color={hovered ? [0.2, 0.2, 0.2] : [10, 5, 10]}
        anchorX="center"
        anchorY="middle"
      >
        <meshBasicMaterial toneMapped={false} />
        {number}
      </Text>
      <Sphere args={[0.35, 64, 64]}>
        <meshBasicMaterial
          ref={sphereMatRef}
          color={[6, 0.5, 2]}
          toneMapped={false}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </group>
  );
}

function Electron({ radius = 2.75, speed = 6, hovered, ...props }) {
  const ref = useRef();
  const matRef = useRef();
  const [trailWidth, setTrailWidth] = useState(1);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.set(
      Math.sin(t) * radius,
      (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25,
      0
    );

    if (matRef.current) {
      const targetColor = hovered
        ? new THREE.Color(15, 3, 15)
        : new THREE.Color(10, 1, 10);
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
        color={hovered ? new THREE.Color(4, 2, 15) : new THREE.Color(2, 1, 10)}
        attenuation={(t) => t * t}
      >
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial
            ref={matRef}
            color={[10, 1, 10]}
            toneMapped={false}
          />
        </mesh>
      </Trail>
    </group>
  );
}
