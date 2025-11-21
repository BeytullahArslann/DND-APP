import React, { useMemo, useEffect, forwardRef } from 'react';
import { useBox, useSphere } from '@react-three/cannon';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface DieProps {
  sides: number;
  position: [number, number, number];
  color?: string;
}

// Wood material properties
const woodMaterialProps = {
    color: "#E3C9A6", // Light oak/pine
    roughness: 0.6,
    metalness: 0.1,
};

const createGeometry = (sides: number) => {
    let geo: THREE.BufferGeometry;
    switch (sides) {
      case 4: geo = new THREE.TetrahedronGeometry(1.2); break;
      case 6: geo = new THREE.BoxGeometry(1.4, 1.4, 1.4); break; // Placeholder, swapped in component
      case 8: geo = new THREE.OctahedronGeometry(1.2); break;
      case 10: geo = new THREE.OctahedronGeometry(1.3); break;
      case 12: geo = new THREE.DodecahedronGeometry(1.2); break;
      case 20: geo = new THREE.IcosahedronGeometry(1.3); break;
      default: geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    }
    return geo;
};

const FaceNumbers = ({ geometry, sides }: { geometry: THREE.BufferGeometry, sides: number }) => {
    const data = useMemo(() => {
        if (sides === 6) {
            const dist = 0.71;
            return [
                { pos: [dist, 0, 0], rot: [0, Math.PI/2, 0], num: 1 },
                { pos: [-dist, 0, 0], rot: [0, -Math.PI/2, 0], num: 6 },
                { pos: [0, dist, 0], rot: [-Math.PI/2, 0, 0], num: 2 },
                { pos: [0, -dist, 0], rot: [Math.PI/2, 0, 0], num: 5 },
                { pos: [0, 0, dist], rot: [0, 0, 0], num: 3 },
                { pos: [0, 0, -dist], rot: [0, Math.PI, 0], num: 4 },
            ];
        }

        // Generic Face Finding for non-cubes
        const nonIndexed = geometry.toNonIndexed();
        const pos = nonIndexed.attributes.position.array;
        const norm = nonIndexed.attributes.normal.array;
        const foundFaces: {pos: THREE.Vector3, norm: THREE.Vector3}[] = [];

        for(let i=0; i < pos.length; i+=9) {
            const v1 = new THREE.Vector3(pos[i], pos[i+1], pos[i+2]);
            const v2 = new THREE.Vector3(pos[i+3], pos[i+4], pos[i+5]);
            const v3 = new THREE.Vector3(pos[i+6], pos[i+7], pos[i+8]);
            const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
            const n1 = new THREE.Vector3(norm[i], norm[i+1], norm[i+2]);

            const exists = foundFaces.some(f => f.pos.distanceTo(center) < 0.1);
            if (!exists) foundFaces.push({ pos: center, norm: n1 });
        }

        return foundFaces.map((f, i) => {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.norm.normalize());
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            return {
                pos: f.pos.multiplyScalar(1.02).toArray(),
                rot: [euler.x, euler.y, euler.z],
                num: (i % sides) + 1
            };
        });
    }, [geometry, sides]);

    return (
        <>
            {data.map((d, i) => (
                <Text
                    key={i}
                    position={d.pos as [number, number, number]}
                    rotation={d.rot as [number, number, number]}
                    fontSize={0.25}
                    color="#3E2723" // Dark brown burnt look
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={0.9}
                    font="https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2" // Stick to standard font for reliability
                >
                    {d.num}
                </Text>
            ))}
        </>
    );
};

const Die = ({ sides, position, color }: DieProps) => {
  const geometry = useMemo(() => createGeometry(sides), [sides]);

  // Physics
  const [ref, api] = (() => {
     if (sides === 6) {
         // Box physics matches the RoundedBox visual reasonably well
         return useBox(() => ({ mass: 1, position, args: [1.4, 1.4, 1.4], friction: 0.3, restitution: 0.5 }));
     }
     return useSphere(() => ({ mass: 1, position, args: [1.2], friction: 0.3, restitution: 0.5 }));
  })();

  // Throw effect
  useEffect(() => {
      if (api) {
          api.velocity.set((Math.random()-0.5)*10, -5-Math.random()*5, (Math.random()-0.5)*10);
          api.angularVelocity.set((Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*15);
      }
  }, [api]);

  return (
    <group ref={ref as any}>
      {sides === 6 ? (
          <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.15} smoothness={4} castShadow receiveShadow>
               <meshStandardMaterial {...woodMaterialProps} />
          </RoundedBox>
      ) : (
          <mesh castShadow receiveShadow geometry={geometry}>
               <meshStandardMaterial {...woodMaterialProps} />
          </mesh>
      )}
      <FaceNumbers geometry={geometry} sides={sides} />
    </group>
  );
};

export default Die;
