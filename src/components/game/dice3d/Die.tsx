import React, { useMemo } from 'react';
import { useBox, useSphere } from '@react-three/cannon';
import * as THREE from 'three';

interface DieProps {
  sides: number;
  position: [number, number, number];
  color?: string;
}

const Die = ({ sides, position, color = 'orange' }: DieProps) => {
  // Physics parameters
  const mass = 1;
  const friction = 0.3;
  const restitution = 0.5;

  // Random starting rotation
  const rotation = useMemo(() => [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
  ] as [number, number, number], []);

  const createGeometry = (sides: number) => {
    switch (sides) {
      case 4: return new THREE.TetrahedronGeometry(0.8);
      case 6: return new THREE.BoxGeometry(1, 1, 1);
      case 8: return new THREE.OctahedronGeometry(0.8);
      case 10: return new THREE.OctahedronGeometry(0.9);
      case 12: return new THREE.DodecahedronGeometry(0.8);
      case 20: return new THREE.IcosahedronGeometry(0.8);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  const geometry = useMemo(() => createGeometry(sides), [sides]);

  // Simplified physics shapes for stability
  // Box for cubes, Sphere approximation for others to ensure they roll
  const [ref] = (() => {
     if (sides === 6) {
         return useBox(() => ({ mass, position, rotation, args: [1, 1, 1], friction, restitution }));
     }
     return useSphere(() => ({ mass, position, rotation, args: [0.8], friction, restitution }));
  })();

  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 }), [color]);

  return (
    <mesh ref={ref as any} castShadow receiveShadow geometry={geometry} material={material} />
  );
};

export default Die;
