"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 46;
const CONNECT_DISTANCE = 2.6;
const FIELD_RADIUS = 5.5;

function generateNodes() {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // Distribute inside a flattened sphere so the mesh reads as a network
    // volume rather than a flat disc or a perfect ball.
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = FIELD_RADIUS * Math.cbrt(Math.random());
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    const z = r * Math.cos(phi) * 0.8;
    positions.push(new THREE.Vector3(x, y, z));
  }
  return positions;
}

function buildEdges(nodes: THREE.Vector3[]) {
  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < CONNECT_DISTANCE) {
        edges.push([nodes[i], nodes[j]]);
      }
    }
  }
  return edges;
}

function Mesh() {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const nodes = useMemo(() => generateNodes(), []);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [edges]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.15,
      0.03
    );
    group.current.rotation.y += mouse.current.x * 0.0006;
  });

  function handlePointerMove(e: { clientX: number; clientY: number }) {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  }

  return (
    <group
      ref={group}
      onPointerMove={handlePointerMove}
      scale={Math.min(viewport.width / 9, 1.15)}
    >
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#3DD9EB"
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </lineSegments>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial
            color={i % 5 === 0 ? "#7C8CFF" : "#3DD9EB"}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function NetworkScene() {
  return (
    <div
      className="absolute inset-0 -z-10"
      aria-hidden="true"
      style={{
        maskImage:
          "radial-gradient(ellipse at center, black 45%, transparent 78%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 45%, transparent 78%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Mesh />
      </Canvas>
    </div>
  );
}
