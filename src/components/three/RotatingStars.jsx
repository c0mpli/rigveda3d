import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function RotatingStars({ showMandalaColor, selectedAtom, mandalaData }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      // Rotate on all three axes for true 3D spherical rotation
      groupRef.current.rotation.x += 0.0001;
      groupRef.current.rotation.y += 0.00015;
      groupRef.current.rotation.z += 0.00008;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars
        radius={150}
        depth={150}
        saturation={showMandalaColor && selectedAtom !== null ? 0.3 : 0}
        count={1000}
        speed={0.5}
        factor={5}
        fade
        color={showMandalaColor && selectedAtom !== null ? mandalaData[selectedAtom].color : "white"}
      />
    </group>
  );
}
