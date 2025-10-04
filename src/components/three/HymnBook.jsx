import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { hexToThreeColor } from "../../utils/ColorUtils";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 5;
const PAGE_HEIGHT = 6;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// Create page geometry with bone weights
const createPageGeometry = () => {
  const pageGeometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    1
  );

  pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = pageGeometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndexes = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  pageGeometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(skinIndexes, 4)
  );
  pageGeometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(skinWeights, 4)
  );

  return pageGeometry;
};

// Shared geometry and skeleton - created once
const sharedPageGeometry = createPageGeometry();
const createSkeleton = () => {
  const bones = [];
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    let bone = new THREE.Bone();
    bones.push(bone);
    if (i === 0) {
      bone.position.x = 0;
    } else {
      bone.position.x = SEGMENT_WIDTH;
    }
    if (i > 0) {
      bones[i - 1].add(bone);
    }
  }
  return new THREE.Skeleton(bones);
};

const Page = ({ hymn, color, number, currentPage, opened, bookClosed }) => {
  const groupRef = useRef();
  const skinnedMeshRef = useRef();
  const textGroupRef = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const manualSkinnedMesh = useMemo(() => {
    const skeleton = createSkeleton();
    const baseColor = new THREE.Color(color);

    const materials = [
      new THREE.MeshStandardMaterial({ color: color, toneMapped: false }), // left
      new THREE.MeshStandardMaterial({ color: color, toneMapped: false }), // right
      new THREE.MeshStandardMaterial({ color: color, toneMapped: false }), // top
      new THREE.MeshStandardMaterial({ color: color, toneMapped: false }), // bottom
      new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(1.1),
        toneMapped: false,
        roughness: 0.2,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.3
      }), // front
      new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(0.7),
        toneMapped: false,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2
      }), // back
    ];

    const mesh = new THREE.SkinnedMesh(sharedPageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [color]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += THREE.MathUtils.degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? groupRef.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = THREE.MathUtils.degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }

      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;

      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }

    // Update text position to follow the page
    if (textGroupRef.current && groupRef.current) {
      textGroupRef.current.position.copy(groupRef.current.position);
      textGroupRef.current.rotation.copy(groupRef.current.rotation);
    }
  });

  const isCurrentPage = currentPage === number;

  return (
    <>
      <group ref={groupRef}>
        <primitive
          object={manualSkinnedMesh}
          ref={skinnedMeshRef}
          position-z={-number * PAGE_DEPTH + currentPage * PAGE_DEPTH}
        />
      </group>

      {/* Text overlay on page - follows page rotation */}
      {hymn && isCurrentPage && (
        <group ref={textGroupRef} position={[PAGE_WIDTH / 2, 0, -number * PAGE_DEPTH + currentPage * PAGE_DEPTH + 0.01]}>
          <Text
            position={[0, 2.3, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            Hymn {hymn.number}
          </Text>

          {hymn.title && (
            <Text
              position={[0, 1.85, 0]}
              fontSize={0.18}
              color="rgba(255, 255, 255, 0.85)"
              anchorX="center"
              anchorY="middle"
              fontWeight={500}
              maxWidth={4.2}
              outlineWidth={0.006}
              outlineColor="#000000"
            >
              {hymn.title}
            </Text>
          )}

          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[4, 0.02]} />
            <meshStandardMaterial color="white" opacity={0.5} transparent toneMapped={false} />
          </mesh>

          {hymn.sanskrit && (
            <Text
              position={[0, 0.9, 0]}
              fontSize={0.18}
              color="rgba(255, 255, 255, 0.95)"
              anchorX="center"
              anchorY="middle"
              maxWidth={4.2}
              lineHeight={1.3}
              textAlign="center"
              outlineWidth={0.003}
              outlineColor="#000000"
              fontWeight={600}
            >
              {hymn.sanskrit}
            </Text>
          )}

          {hymn.transliteration && (
            <Text
              position={[0, 0.1, 0]}
              fontSize={0.15}
              color="rgba(255, 255, 255, 0.75)"
              anchorX="center"
              anchorY="middle"
              maxWidth={4.2}
              lineHeight={1.2}
              textAlign="center"
              outlineWidth={0.003}
              outlineColor="#000000"
              fontStyle="italic"
            >
              {hymn.transliteration}
            </Text>
          )}

          {hymn.translation && (
            <Text
              position={[0, -0.9, 0]}
              fontSize={0.16}
              color="rgba(255, 255, 255, 0.95)"
              anchorX="center"
              anchorY="middle"
              maxWidth={4.2}
              lineHeight={1.2}
              textAlign="center"
              outlineWidth={0.003}
              outlineColor="#000000"
            >
              {hymn.translation}
            </Text>
          )}

          {hymn.verseCount > 0 && (
            <Text
              position={[0, -2.2, 0]}
              fontSize={0.14}
              color="rgba(255, 255, 255, 0.5)"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.003}
              outlineColor="#000000"
            >
              {hymn.verseCount} verses
            </Text>
          )}
        </group>
      )}
    </>
  );
};

export default function HymnBook({ hymns, color, position, mandalaNumber, selectedHymnIndex }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [delayedPage, setDelayedPage] = useState(0);

  // Sync with selected hymn
  useEffect(() => {
    if (selectedHymnIndex !== null) {
      setCurrentPage(selectedHymnIndex + 1); // +1 for cover page
    }
  }, [selectedHymnIndex]);

  // Delayed page turning animation
  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (currentPage === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(currentPage - delayedPage) > 2 ? 50 : 150
          );
          if (currentPage > delayedPage) {
            return delayedPage + 1;
          }
          if (currentPage < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [currentPage]);

  // Open book after delay on init
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Open to first hymn
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const pages = [
    { hymn: null, isCover: true }, // Cover page
    ...hymns.map(h => ({ hymn: h, isCover: false })),
  ];

  return (
    <group position={position} rotation-y={-Math.PI / 2}>
      {/* Book spine */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.15, PAGE_HEIGHT, PAGE_DEPTH * 2]} />
        <meshStandardMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Left page - static decorative */}
      <group position={[-PAGE_WIDTH / 2 - 0.075, 0, 0]}>
        <mesh>
          <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
          <meshStandardMaterial color="#1a1a1a" toneMapped={false} />
        </mesh>

        <RoundedBox
          args={[PAGE_WIDTH + 0.1, PAGE_HEIGHT + 0.1, 0.05]}
          radius={0.05}
          position={[0, 0, -0.025]}
        >
          <meshStandardMaterial color={color} transparent opacity={0.3} toneMapped={false} />
        </RoundedBox>

        <Text
          position={[0, 0, 0.01]}
          fontSize={0.5}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight={300}
          opacity={0.3}
        >
          ॐ
        </Text>
      </group>

      {/* Pages */}
      {pages.map((pageData, index) => (
        <Page
          key={index}
          hymn={pageData.isCover ? { number: `Mandala ${mandalaNumber}`, title: "RIG VEDA" } : pageData.hymn}
          color={color}
          number={index}
          currentPage={delayedPage}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
        />
      ))}
    </group>
  );
}
