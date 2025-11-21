import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import Die from './Die';
import * as THREE from 'three';

interface DiceCanvasProps {
  dice: { type: number; id: string }[];
  rolling: boolean;
}

const Tray = () => {
  // Physics Floor (Invisible)
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    material: { friction: 0.7, restitution: 0.3 }
  }));

  // Physics Walls (Invisible)
  // Walls aligned to match visual inner boundaries
  // Y=0 ensures they span from -2 to +2 (height 4)
  useBox(() => ({ position: [0, 0, -7.25], args: [22, 4, 1] })); // Top
  useBox(() => ({ position: [0, 0, 7.25], args: [22, 4, 1] }));  // Bottom
  useBox(() => ({ position: [-10.0, 0, 0], args: [1, 4, 16] })); // Left
  useBox(() => ({ position: [10.0, 0, 0], args: [1, 4, 16] }));  // Right

  // Visual Materials
  const rimMaterial = (
      <meshStandardMaterial
          color="#3E2723"
          roughness={0.7}
      />
  );

  return (
    <group>
      {/* Floor Physics Ref */}
      <mesh ref={ref as any} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>

      {/* Visual Tray Floor */}
      <mesh receiveShadow position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
         <boxGeometry args={[20, 14, 0.1]} />
         <meshStandardMaterial color="#6D4C41" roughness={0.8} />
      </mesh>

      {/* Visual Walls - Rounded and Thick */}
      {/* Top Wall */}
      <RoundedBox args={[22, 2, 1.5]} radius={0.5} smoothness={4} position={[0, -1, -7.5]} castShadow receiveShadow>
          {rimMaterial}
      </RoundedBox>
      {/* Bottom Wall */}
      <RoundedBox args={[22, 2, 1.5]} radius={0.5} smoothness={4} position={[0, -1, 7.5]} castShadow receiveShadow>
          {rimMaterial}
      </RoundedBox>
      {/* Left Wall */}
      <RoundedBox args={[1.5, 2, 13.5]} radius={0.5} smoothness={4} position={[-10.25, -1, 0]} castShadow receiveShadow>
          {rimMaterial}
      </RoundedBox>
      {/* Right Wall */}
      <RoundedBox args={[1.5, 2, 13.5]} radius={0.5} smoothness={4} position={[10.25, -1, 0]} castShadow receiveShadow>
          {rimMaterial}
      </RoundedBox>

      {/* Table Surface around the tray */}
      <mesh receiveShadow position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#EFEBE9" roughness={1} />
      </mesh>
    </group>
  );
};

export const DiceCanvas = ({ dice, rolling }: DiceCanvasProps) => {
  const diceWithPos = useMemo(() => {
      return dice.map((d, i) => ({
          ...d,
          startPos: [
              (Math.random() - 0.5) * 4,
              5 + i * 1.5,
              (Math.random() - 0.5) * 2
          ] as [number, number, number],
      }));
  }, [dice]);

  return (
    <Canvas shadows camera={{ position: [0, 14, 8], fov: 35 }}>
      {/* Lighting Setup for Studio Look */}
      <ambientLight intensity={0.6} color="#FFE0B2" />
      <spotLight
          position={[5, 15, 5]}
          angle={0.5}
          penumbra={1}
          intensity={1.2}
          castShadow
          shadow-bias={-0.0001}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#EFEBE9" />

      <Environment preset="apartment" blur={0.8} background={false} />

      <Physics gravity={[0, -30, 0]}>
        <Tray />
        {diceWithPos.map((d) => (
          <Die
            key={d.id}
            sides={d.type}
            position={d.startPos}
          />
        ))}
      </Physics>

      {/* Shadows on the floor */}
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={40} blur={2.5} far={4} color="#1a1a1a" />

      <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          maxDistance={25}
          minDistance={10}
      />
    </Canvas>
  );
};
