import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import { OrbitControls, Stage, Environment, ContactShadows } from '@react-three/drei';
import Die from './Die';

interface DiceCanvasProps {
  dice: { type: number; id: string }[];
  rolling: boolean;
}

const Floor = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    material: { friction: 0.3, restitution: 0.5 }
  }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1e1e2e" transparent opacity={0.4} />
    </mesh>
  );
};

const Walls = () => {
    // Invisible walls to keep dice in view
    usePlane(() => ({ position: [0, 0, -10], rotation: [0, 0, 0] })); // Back
    usePlane(() => ({ position: [0, 0, 10], rotation: [0, Math.PI, 0] })); // Front
    usePlane(() => ({ position: [-10, 0, 0], rotation: [0, Math.PI / 2, 0] })); // Left
    usePlane(() => ({ position: [10, 0, 0], rotation: [0, -Math.PI / 2, 0] })); // Right
    return null;
}

export const DiceCanvas = ({ dice, rolling }: DiceCanvasProps) => {
  // Generate positions for dice so they don't overlap instantly
  const diceWithPos = useMemo(() => {
      return dice.map((d, i) => ({
          ...d,
          // Spread them out a bit
          startPos: [
              (Math.random() - 0.5) * 5,
              5 + i * 1.5, // Stagger height
              (Math.random() - 0.5) * 3
          ] as [number, number, number],
          color: getColor(d.type)
      }));
  }, [dice]); // Re-calculate only when dice array changes (e.g. new roll)

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <Environment preset="city" />

      <Physics gravity={[0, -15, 0]}>
        <Floor />
        <Walls />
        {diceWithPos.map((d) => (
          <Die
            key={d.id}
            sides={d.type}
            position={d.startPos}
            color={d.color}
          />
        ))}
      </Physics>

      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
    </Canvas>
  );
};

const getColor = (sides: number) => {
    switch (sides) {
        case 4: return '#ef4444'; // Red
        case 6: return '#3b82f6'; // Blue
        case 8: return '#22c55e'; // Green
        case 10: return '#a855f7'; // Purple
        case 12: return '#f97316'; // Orange
        case 20: return '#eab308'; // Yellow
        default: return '#ffffff';
    }
};
