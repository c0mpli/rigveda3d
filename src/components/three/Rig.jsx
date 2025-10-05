import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";

export default function Rig({
  selectedAtom,
  atomPositions,
  setShowOverlay,
  isExploring,
  setShowMandalaColor,
  defaultCameraZ = 9,
}) {
  const { controls } = useThree();

  useEffect(() => {
    if (isExploring && selectedAtom !== null && controls) {
      const targetPos = atomPositions[selectedAtom];

      // First, zoom into the atom to ensure we're looking at it
      controls.setLookAt(
        targetPos[0],
        targetPos[1],
        targetPos[2] + 0.01,
        targetPos[0],
        targetPos[1],
        targetPos[2],
        true
      );

      // Then after zoom, position camera at sphere center looking forward (zoomed out a bit)
      const reposition = setTimeout(() => {
        controls.setLookAt(
          targetPos[0],
          targetPos[1],
          targetPos[2] + 2,
          targetPos[0],
          targetPos[1],
          targetPos[2] - 1,
          true
        );
      }, 600);

      // Change color after zoom completes
      const colorTimer = setTimeout(() => {
        setShowMandalaColor(true);
      }, 600);

      return () => {
        clearTimeout(reposition);
        clearTimeout(colorTimer);
      };
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
      controls.setLookAt(0, 0, defaultCameraZ, 0, 0, 0, true);
    }
  }, [
    selectedAtom,
    controls,
    atomPositions,
    setShowOverlay,
    isExploring,
    setShowMandalaColor,
    defaultCameraZ,
  ]);

  return (
    <CameraControls
      makeDefault
      minPolarAngle={isExploring ? 0 : 0}
      maxPolarAngle={isExploring ? Math.PI : Math.PI / 2}
      minDistance={isExploring ? 0.1 : 1}
      maxDistance={isExploring ? 0.1 : 50}
      enabled={!isExploring}
      mouseButtons={{
        left: isExploring ? 0 : 1,
        middle: isExploring ? 0 : 2,
        right: isExploring ? 0 : 2,
        wheel: isExploring ? 0 : 8,
      }}
      touches={{
        one: isExploring ? 0 : 32,
        two: isExploring ? 0 : 512,
        three: isExploring ? 0 : 0,
      }}
    />
  );
}
