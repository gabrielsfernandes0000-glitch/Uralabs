"use client";

// Box3D — vault URA Labs custom. Modelo procedural Three.js que CONVERSA com o
// design system: near-black body, accent seam por tier (gold/orange/gold bright),
// emissive glow sutil, rounded corners. Anti-wooden-chest, pro-vault-premium.

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, RoundedBox, ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

type Tier = "basic" | "premium" | "legendary";

const TIER: Record<Tier, {
  body: string;         // cor principal — ligeiramente mais clara pra pegar luz
  bodyTop: string;      // cor da face de cima (mais clara pra destacar topo)
  accent: string;       // cor do seam + LEDs
  accentEmissive: number;
  bodyMetalness: number;
  bodyRoughness: number;
  glow: string;         // CSS radial glow atras
  rim: string;          // luz lateral colorida
  logoColor: string;    // "selo" do URA no topo
}> = {
  basic: {
    body: "#27272a",
    bodyTop: "#3f3f46",
    accent: "#d4d4d8",
    accentEmissive: 0.6,
    bodyMetalness: 0.75,
    bodyRoughness: 0.4,
    glow: "rgba(212,212,216,0.22)",
    rim: "#f4f4f5",
    logoColor: "#e4e4e7",
  },
  premium: {
    body: "#1e1b2e",       // base levemente roxeada em vez de quase-preto puro
    bodyTop: "#2a2340",
    accent: "#FF5500",     // brand orange
    accentEmissive: 1.5,
    bodyMetalness: 0.85,
    bodyRoughness: 0.3,
    glow: "rgba(255,85,0,0.42)",
    rim: "#ff7a33",
    logoColor: "#FF8844",
  },
  legendary: {
    body: "#1c1510",       // base quente escura pra dourado refletir
    bodyTop: "#28201a",
    accent: "#C9A461",     // URA gold
    accentEmissive: 2.0,
    bodyMetalness: 0.95,
    bodyRoughness: 0.2,
    glow: "rgba(201,164,97,0.55)",
    rim: "#fcd34d",
    logoColor: "#fcd34d",
  },
};

function URAFlameMark({ color, emissive }: { color: string; emissive: number }) {
  // "U" em extrude — representa a marca URA sem precisar de SVG custom
  const shape = new THREE.Shape();
  const w = 0.18, h = 0.22, t = 0.07;
  shape.moveTo(-w / 2, h / 2);
  shape.lineTo(-w / 2, -h / 2 + t);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + t, -h / 2);
  shape.lineTo(w / 2 - t, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + t);
  shape.lineTo(w / 2, h / 2);
  shape.lineTo(w / 2 - t, h / 2);
  shape.lineTo(w / 2 - t, -h / 2 + t);
  shape.lineTo(-w / 2 + t, -h / 2 + t);
  shape.lineTo(-w / 2 + t, h / 2);
  shape.lineTo(-w / 2, h / 2);
  return (
    <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 }]} />
      <meshStandardMaterial
        color={color}
        metalness={1}
        roughness={0.15}
        emissive={color}
        emissiveIntensity={emissive}
      />
    </mesh>
  );
}

function VaultMesh({ tier, paused }: { tier: Tier; paused?: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const t = TIER[tier];

  useFrame((_, delta) => {
    if (paused || !group.current) return;
    group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]} rotation={[-0.32, 0.4, 0]}>
      {/* Main body — dark matte with rounded corners */}
      <RoundedBox args={[1.3, 1.0, 1.3]} radius={0.08} smoothness={5}>
        <meshStandardMaterial
          color={t.body}
          metalness={t.bodyMetalness}
          roughness={t.bodyRoughness}
        />
      </RoundedBox>

      {/* Horizontal accent seam — glowing LED band around the middle */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.33, 0.05, 1.33]} />
        <meshStandardMaterial
          color={t.accent}
          emissive={t.accent}
          emissiveIntensity={t.accentEmissive}
          metalness={1}
          roughness={0.2}
        />
      </mesh>

      {/* Inner groove (visual depth pro seam) */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.35, 0.015, 1.35]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={1} />
      </mesh>

      {/* Vertical accent strips (4 cantos) — thin colored lines */}
      {[
        [0.65, 0.65], [-0.65, 0.65], [0.65, -0.65], [-0.65, -0.65],
      ].map(([x, z], i) => (
        <mesh key={`strip-${i}`} position={[x, 0.04, z]}>
          <boxGeometry args={[0.04, 0.95, 0.04]} />
          <meshStandardMaterial
            color={t.accent}
            emissive={t.accent}
            emissiveIntensity={t.accentEmissive * 0.6}
            metalness={1}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* Top chamfered panel — mais claro pra destacar a face superior */}
      <mesh position={[0, 0.502, 0]}>
        <boxGeometry args={[1.15, 0.01, 1.15]} />
        <meshStandardMaterial
          color={t.bodyTop}
          metalness={t.bodyMetalness * 0.8}
          roughness={t.bodyRoughness * 1.2}
        />
      </mesh>

      {/* URA "U" mark embossed on top */}
      <URAFlameMark color={t.logoColor} emissive={t.accentEmissive * 0.5} />

      {/* Base recesso */}
      <mesh position={[0, -0.51, 0]}>
        <boxGeometry args={[1.2, 0.02, 1.2]} />
        <meshStandardMaterial color="#050507" metalness={0.6} roughness={0.8} />
      </mesh>

      {/* Base LED ring (sob o box) */}
      <mesh position={[0, -0.52, 0]}>
        <ringGeometry args={[0.55, 0.62, 32]} />
        <meshStandardMaterial
          color={t.accent}
          emissive={t.accent}
          emissiveIntensity={t.accentEmissive * 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Box3D({ tier, size = 200, paused = false }: { tier: Tier; size?: number; paused?: boolean }) {
  const t = TIER[tier];
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "18% 10% 10% 10%",
          background: `radial-gradient(ellipse at center, ${t.glow} 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />
      <Canvas
        camera={{ position: [0, 1.2, 2.2], fov: 38 }}
        dpr={[1, 1.5]}
        frameloop={paused ? "never" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent", position: "relative", zIndex: 1 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={1.0} color={t.rim} />
        <directionalLight position={[0, -2, 3]} intensity={0.5} color="#ffffff" />
        <pointLight position={[0, 1.5, 2]} intensity={1.2} color={t.accent} />
        <pointLight position={[2, 0, 1]} intensity={0.8} color={t.rim} />
        <Suspense fallback={null}>
          <VaultMesh tier={tier} paused={paused} />
          <ContactShadows position={[0, -0.55, 0]} opacity={0.5} scale={3} blur={2.4} far={2} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
