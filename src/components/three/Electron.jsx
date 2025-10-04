import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import { hexToThreeColor } from "../../utils/ColorUtils";

export default function Electron({ radius = 2.75, speed = 6, hovered, color, ...props }) {
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
