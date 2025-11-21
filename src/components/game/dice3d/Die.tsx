import React, { useMemo, useEffect, useRef } from 'react';
import { useBox, useSphere } from '@react-three/cannon';
import * as THREE from 'three';

interface DieProps {
  sides: number;
  position: [number, number, number];
  color?: string;
}

const Die = ({ sides, position, color = 'orange' }: DieProps) => {
  const mass = 1;
  const friction = 0.2;
  const restitution = 0.6;

  // Initial rotation state
  const rotation = useMemo(() => [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
  ] as [number, number, number], []);

  const createGeometry = (sides: number) => {
    // Slightly larger geometries for better presence
    switch (sides) {
      case 4: return new THREE.TetrahedronGeometry(1.0);
      case 6: return new THREE.BoxGeometry(1.2, 1.2, 1.2);
      case 8: return new THREE.OctahedronGeometry(1.0);
      case 10: return new THREE.OctahedronGeometry(1.1);
      case 12: return new THREE.DodecahedronGeometry(1.0);
      case 20: return new THREE.IcosahedronGeometry(1.0);
      default: return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  const geometry = useMemo(() => createGeometry(sides), [sides]);

  // Physics setup
  const [ref, api] = (() => {
     if (sides === 6) {
         return useBox(() => ({ mass, position, rotation, args: [1.2, 1.2, 1.2], friction, restitution }));
     }
     return useSphere(() => ({ mass, position, rotation, args: [1.0], friction, restitution }));
  })();

  // "Throw" effect
  useEffect(() => {
      // Apply a random force (impulse) downwards and sideways to simulate a throw
      // And a random torque (spin)
      const force = [
          (Math.random() - 0.5) * 10,
          -5 - Math.random() * 5,
          (Math.random() - 0.5) * 10
      ] as [number, number, number];

      const torque = [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
      ] as [number, number, number];

      // We need to check if api is available (it usually is immediately)
      if (api) {
          api.velocity.set(...force);
          api.angularVelocity.set(...torque);
      }
  }, [api]);

  // Material: Physical material for "Gem/Resin" look
  // Transmission enables the glass/jelly look
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.3, // Semi-transparent
      thickness: 2, // Volume simulation
      clearcoat: 1, // Shiny coating
      clearcoatRoughness: 0.1,
      ior: 1.5, // Refraction index like glass/plastic
      attenuationColor: color,
      attenuationDistance: 1
  }), [color]);

  // Edges for better definition (simple wireframe overlay or just use the material)
  // A mesh with edgesGeometry is expensive. The clearcoat helps definition.

  return (
    <group>
        <mesh ref={ref as any} castShadow receiveShadow geometry={geometry} material={material} />
    </group>
  );
};

export default Die;
