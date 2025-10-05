import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function CameraController({ position }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...position);
    camera.updateProjectionMatrix();
  }, [camera, position]);

  return null;
}
