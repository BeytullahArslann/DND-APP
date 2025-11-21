import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import Die from './Die';
import * as THREE from 'three';

interface DiceCanvasProps {
  dice: { type: number; id: string }[];
  rolling: boolean;
  onDieSettled: (id: string, result: number) => void;
}

const Tray = () => {
  // Physics Floor (Invisible)
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    material: { friction: 0.6, restitution: 0.5 }
  }));

  // Physics Walls (Invisible)
  useBox(() => ({ position: [0, 0, -7.5], args: [22, 10, 1] })); // Top
  useBox(() => ({ position: [0, 0, 7.5], args: [22, 10, 1] }));  // Bottom
  useBox(() => ({ position: [-10.5, 0, 0], args: [1, 10, 16] })); // Left
  useBox(() => ({ position: [10.5, 0, 0], args: [1, 10, 16] }));  // Right

  // Visual Materials
  const trayMaterial = (
      <meshStandardMaterial
          color="#5D4037" // Darker wood for tray
          roughness={0.6}
          metalness={0.1}
      />
  );

  return (
    <group>
      {/* Floor Physics Ref */}
      <mesh ref={ref as any} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>

      {/* Visual Tray Floor - thick wood plank */}
      <RoundedBox args={[20, 14, 0.5]} radius={0.1} smoothness={4} position={[0, -2.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
         {trayMaterial}
      </RoundedBox>

      {/* Visual Walls - Rounded and Thick with Bevel effect */}
      {/* Top Wall */}
      <RoundedBox args={[22, 1.5, 1]} radius={0.2} smoothness={4} position={[0, -1.5, -7.5]} castShadow receiveShadow>
          {trayMaterial}
      </RoundedBox>
      {/* Bottom Wall */}
      <RoundedBox args={[22, 1.5, 1]} radius={0.2} smoothness={4} position={[0, -1.5, 7.5]} castShadow receiveShadow>
          {trayMaterial}
      </RoundedBox>
      {/* Left Wall */}
      <RoundedBox args={[1, 1.5, 16]} radius={0.2} smoothness={4} position={[-10.5, -1.5, 0]} castShadow receiveShadow>
          {trayMaterial}
      </RoundedBox>
      {/* Right Wall */}
      <RoundedBox args={[1, 1.5, 16]} radius={0.2} smoothness={4} position={[10.5, -1.5, 0]} castShadow receiveShadow>
          {trayMaterial}
      </RoundedBox>

      {/* Table Surface underneath */}
      <mesh receiveShadow position={[0, -2.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#D7CCC8" roughness={1} />
      </mesh>
    </group>
  );
};

export const DiceCanvas = ({ dice, rolling, onDieSettled }: DiceCanvasProps) => {
  const diceWithPos = useMemo(() => {
      return dice.map((d, i) => ({
          ...d,
          startPos: [
              (Math.random() - 0.5) * 3, // Closer to center
              8 + i * 1.5, // Drop from height
              (Math.random() - 0.5) * 2
          ] as [number, number, number],
      }));
  }, [dice]);

  return (
    <Canvas shadows camera={{ position: [0, 18, 6], fov: 35 }}>
      {/* Warm Studio Lighting */}
      <ambientLight intensity={0.4} color="#FFE0B2" />

      <spotLight
          position={[5, 20, 10]}
          angle={0.4}
          penumbra={0.5}
          intensity={1.5}
          castShadow
          shadow-bias={-0.0001}
          color="#FFF3E0"
      />

      {/* Fill light */}
      <pointLight position={[-10, 5, -5]} intensity={0.5} color="#D7CCC8" />

      <Environment preset="apartment" blur={0.6} background={false} />

      <Physics gravity={[0, -40, 0]} defaultContactMaterial={{ friction: 0.3, restitution: 0.5 }}>
        <Tray />
        {diceWithPos.map((d) => (
          <Die
            key={d.id}
            id={d.id}
            sides={d.type}
            position={d.startPos}
            onSettled={onDieSettled}
          />
        ))}
      </Physics>

      <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={50} blur={2} far={10} color="#000000" />

      <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0, 0]}
      />
    </Canvas>
  );
};
