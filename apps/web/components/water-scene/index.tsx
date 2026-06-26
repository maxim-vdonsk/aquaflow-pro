"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

function CyberParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const count = 1200;
  const c1 = useMemo(() => new THREE.Color(0x7df9ff), []);
  const c2 = useMemo(() => new THREE.Color(0xb06bff), []);
  const c3 = useMemo(() => new THREE.Color(0xff3e88), []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const t = Math.random();
      const c = t < 0.45 ? c1 : t < 0.78 ? c2 : c3;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [c1, c2, c3]);

  const { linePositions, lineColors } = useMemo(() => {
    const linePositions = new Float32Array(count * 6);
    const lineColors = new Float32Array(count * 6);
    let lineIdx = 0;
    const maxLines = Math.floor(count * 0.3);
    for (let i = 0; i < Math.min(120, count) && lineIdx < maxLines; i++) {
      for (let j = i + 1; j < Math.min(120, count) && lineIdx < maxLines; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.2) {
          linePositions[lineIdx * 6] = positions[i * 3];
          linePositions[lineIdx * 6 + 1] = positions[i * 3 + 1];
          linePositions[lineIdx * 6 + 2] = positions[i * 3 + 2];
          linePositions[lineIdx * 6 + 3] = positions[j * 3];
          linePositions[lineIdx * 6 + 4] = positions[j * 3 + 1];
          linePositions[lineIdx * 6 + 5] = positions[j * 3 + 2];
          lineColors[lineIdx * 6] = c1.r;
          lineColors[lineIdx * 6 + 1] = c1.g;
          lineColors[lineIdx * 6 + 2] = c1.b;
          lineColors[lineIdx * 6 + 3] = c2.r;
          lineColors[lineIdx * 6 + 4] = c2.g;
          lineColors[lineIdx * 6 + 5] = c2.b;
          lineIdx++;
        }
      }
    }
    return { linePositions, lineColors };
  }, [positions, c1, c2]);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.5 - target.current.x) * 0.05;
    target.current.y += (mouse.current.y * 0.3 - target.current.y) * 0.05;

    const points = pointsRef.current;
    const lines = linesRef.current;
    if (!points || !lines) return;

    points.rotation.y += 0.0006;
    points.rotation.x = target.current.y * 0.25;
    lines.rotation.copy(points.rotation);
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}

export function WaterScene() {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,249,255,0.10),transparent_60%)]" />
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <CyberParticles />
      </Canvas>
    </div>
  );
}
