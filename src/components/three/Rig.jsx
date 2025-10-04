import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";

export default function Rig({ selectedAtom, atomPositions, setShowOverlay, isExploring, setShowMandalaColor }) {
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
