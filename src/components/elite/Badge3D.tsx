"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function CoinScene({ textureUrl, accentColor }: { textureUrl: string; accentColor: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  const accent = new THREE.Color(accentColor);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 3, -2]} intensity={0.3} color="#4466ff" />
      <pointLight position={[0, 2, 3]} intensity={0.4} color={accentColor} />

      <group
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Coin body */}
        <mesh>
          <cylinderGeometry args={[1.7, 1.7, 0.2, 64]} />
          <meshStandardMaterial
            color="#1c1c1c"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Front face with badge texture */}
        <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>

        {/* Back face - dark */}
        <mesh position={[0, -0.101, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.6, 64]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Accent ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.72, 0.035, 16, 64]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={hovered ? 2 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.2}
      />
    </>
  );
}

interface Badge3DProps {
  textureUrl: string;
  accentColor?: string;
  size?: number;
  className?: string;
}

export function Badge3D({
  textureUrl,
  accentColor = "#FF5500",
  size = 280,
  className = "",
}: Badge3DProps) {
  return (
    <div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 4.5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <CoinScene textureUrl={textureUrl} accentColor={accentColor} />
      </Canvas>
    </div>
  );
}
