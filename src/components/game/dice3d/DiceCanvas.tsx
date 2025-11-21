import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import Die from './Die';
import * as THREE from 'three';

interface DiceCanvasProps {
  dice: { type: number; id: string }[];
  rolling: boolean;
}

// A container box for the dice to roll inside
const DiceTray = () => {
    // Floor
    usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -2, 0],
        material: { friction: 0.3, restitution: 0.6 }
    }));

    // Walls (Invisible physics, visible mesh borders)
    // Back
    useBox(() => ({ position: [0, 0, -8], args: [20, 5, 1] }));
    // Front
    useBox(() => ({ position: [0, 0, 8], args: [20, 5, 1] }));
    // Left
    useBox(() => ({ position: [-12, 0, 0], args: [1, 5, 16] }));
    // Right
    useBox(() => ({ position: [12, 0, 0], args: [1, 5, 16] }));

    return (
        <group position={[0, -2.05, 0]}>
            {/* Table Surface */}
            <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#281a12" roughness={0.8} />
            </mesh>

            {/* Tray Visuals */}
            <mesh receiveShadow position={[0, 0.1, 0]}>
                 <boxGeometry args={[24, 0.2, 16]} />
                 <meshStandardMaterial color="#3d2616" roughness={0.6} />
            </mesh>
            {/* Tray Borders */}
            <mesh castShadow position={[0, 1, -8]}>
                <boxGeometry args={[24, 2, 0.5]} />
                <meshStandardMaterial color="#5c3a21" />
            </mesh>
            <mesh castShadow position={[0, 1, 8]}>
                <boxGeometry args={[24, 2, 0.5]} />
                <meshStandardMaterial color="#5c3a21" />
            </mesh>
            <mesh castShadow position={[-12, 1, 0]}>
                <boxGeometry args={[0.5, 2, 16.5]} />
                <meshStandardMaterial color="#5c3a21" />
            </mesh>
             <mesh castShadow position={[12, 1, 0]}>
                <boxGeometry args={[0.5, 2, 16.5]} />
                <meshStandardMaterial color="#5c3a21" />
            </mesh>

            {/* Felt/Carpet inside tray */}
            <mesh receiveShadow position={[0, 0.21, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[23, 15]} />
                <meshStandardMaterial color="#1e293b" roughness={1} />
            </mesh>
        </group>
    );
}

export const DiceCanvas = ({ dice, rolling }: DiceCanvasProps) => {
  const diceWithPos = useMemo(() => {
      return dice.map((d, i) => ({
          ...d,
          startPos: [
              (Math.random() - 0.5) * 4,
              4 + i * 0.5,
              (Math.random() - 0.5) * 2
          ] as [number, number, number],
          color: getColor(d.type)
      }));
  }, [dice]);

  return (
    <Canvas shadows camera={{ position: [0, 12, 8], fov: 45 }}>
      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.4} />
      <spotLight
          position={[10, 20, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#fbbf24" />

      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="sunset" blur={0.6} />

      <Physics gravity={[0, -20, 0]}>
        <DiceTray />
        {diceWithPos.map((d) => (
          <Die
            key={d.id}
            sides={d.type}
            position={d.startPos}
            color={d.color}
          />
        ))}
      </Physics>

      <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={40} blur={2.5} far={4} color="#000000" />
      <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          maxDistance={20}
          minDistance={5}
      />
    </Canvas>
  );
};

const getColor = (sides: number) => {
    // More sophisticated colors
    switch (sides) {
        case 4: return '#ef4444';
        case 6: return '#3b82f6';
        case 8: return '#22c55e';
        case 10: return '#9333ea';
        case 12: return '#ea580c';
        case 20: return '#eab308';
        default: return '#ffffff';
    }
};
