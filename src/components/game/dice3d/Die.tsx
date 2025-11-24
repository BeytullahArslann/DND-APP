import React, { useMemo, useEffect, useRef } from 'react';
import { useBox, useConvexPolyhedron } from '@react-three/cannon';
import { Text3D, Center, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import helvetikerRegular from 'three/examples/fonts/helvetiker_regular.typeface.json';

interface DieProps {
  id: string;
  sides: number;
  position: [number, number, number];
  color?: string;
  onSettled: (id: string, result: number) => void;
}

// Wood material properties - Polished Light Wood
const woodMaterialProps = {
    color: "#DEB887", // Burlywood / Light Oak
    roughness: 0.4,
    metalness: 0.0,
};

const createGeometry = (sides: number) => {
    let geo: THREE.BufferGeometry;
    switch (sides) {
      case 4: geo = new THREE.TetrahedronGeometry(1.4); break;
      case 6: geo = new THREE.BoxGeometry(1.4, 1.4, 1.4); break;
      case 8: geo = new THREE.OctahedronGeometry(1.2); break;
      case 10: geo = new THREE.OctahedronGeometry(1.4); break; // D10 approximation
      case 12: geo = new THREE.DodecahedronGeometry(1.2); break;
      case 20: geo = new THREE.IcosahedronGeometry(1.3); break;
      default: geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    }
    return geo;
};

// Helper to get vertices and faces for convex polyhedron
const toConvexProps = (bufferGeometry: THREE.BufferGeometry) => {
    const geo = bufferGeometry.clone();

    // If indexed
    let vertices: number[][] = [];
    let faces: number[][] = [];

    if (geo.index) {
       const pos = geo.attributes.position;
       for (let i = 0; i < pos.count; i++) {
           vertices.push([pos.getX(i), pos.getY(i), pos.getZ(i)]);
       }
       const index = geo.index;
       for (let i = 0; i < index.count; i+=3) {
           faces.push([index.getX(i), index.getY(i), index.getZ(i)]);
       }
    } else {
        // Non-indexed: every 3 vertices is a face
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            vertices.push([pos.getX(i), pos.getY(i), pos.getZ(i)]);
        }
        for (let i = 0; i < pos.count; i+=3) {
            faces.push([i, i+1, i+2]);
        }
    }

    return [vertices, faces];
};

const FaceNumbers = ({ geometry, sides }: { geometry: THREE.BufferGeometry, sides: number }) => {
    const data = useMemo(() => {
        if (sides === 6) {
            const dist = 0.71; // Slightly embedded or on surface
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
        const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
        const pos = nonIndexed.attributes.position.array;
        const norm = nonIndexed.attributes.normal.array;
        const foundFaces: {pos: THREE.Vector3, norm: THREE.Vector3}[] = [];

        for(let i=0; i < pos.length; i+=9) {
            const v1 = new THREE.Vector3(pos[i], pos[i+1], pos[i+2]);
            const v2 = new THREE.Vector3(pos[i+3], pos[i+4], pos[i+5]);
            const v3 = new THREE.Vector3(pos[i+6], pos[i+7], pos[i+8]);
            const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
            const n1 = new THREE.Vector3(norm[i], norm[i+1], norm[i+2]);

            // Check if face already found (close enough)
            const exists = foundFaces.some(f => f.pos.distanceTo(center) < 0.1);
            if (!exists) foundFaces.push({ pos: center, norm: n1 });
        }

        return foundFaces.map((f, i) => {
            const quaternion = new THREE.Quaternion();
            // Rotate text to face outward
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.norm.normalize());
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            return {
                pos: f.pos.multiplyScalar(1.02).toArray(), // Slightly offset
                rot: [euler.x, euler.y, euler.z],
                num: (i % sides) + 1
            };
        });
    }, [geometry, sides]);

    return (
        <>
            {data.map((d, i) => (
                <group
                    key={i}
                    position={d.pos as [number, number, number]}
                    rotation={d.rot as [number, number, number]}
                >
                    <Center>
                        <Text3D
                            font={helvetikerRegular as any}
                            size={0.25}
                            height={0.02}
                            curveSegments={12}
                        >
                            {d.num}
                            <meshStandardMaterial color="#3E2723" />
                        </Text3D>
                    </Center>
                </group>
            ))}
        </>
    );
};

const Die = ({ id, sides, position, onSettled }: DieProps) => {
  const geometry = useMemo(() => createGeometry(sides), [sides]);

  // Calculate face mapping (Normal -> Number)
  const faceMap = useMemo(() => {
       if (sides === 6) {
           return [
               { norm: new THREE.Vector3(1,0,0), num: 1 },
               { norm: new THREE.Vector3(-1,0,0), num: 6 },
               { norm: new THREE.Vector3(0,1,0), num: 2 },
               { norm: new THREE.Vector3(0,-1,0), num: 5 },
               { norm: new THREE.Vector3(0,0,1), num: 3 },
               { norm: new THREE.Vector3(0,0,-1), num: 4 },
           ];
       }

       const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
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

       return foundFaces.map((f, i) => ({
           norm: f.norm.clone().normalize(),
           num: (i % sides) + 1
       }));

  }, [geometry, sides]);


  // Physics
  const [ref, api] = (() => {
     if (sides === 6) {
         return useBox(() => ({
             mass: 1,
             position,
             args: [1.4, 1.4, 1.4],
             friction: 0.3,
             restitution: 0.5
         }));
     }

     // Use ConvexPolyhedron for others
     const [vertices, faces] = useMemo(() => toConvexProps(geometry), [geometry]);
     return useConvexPolyhedron(() => ({
         mass: 1,
         position,
         args: [vertices, faces],
         friction: 0.3,
         restitution: 0.5
     }));
  })();

  // Logic to detect settling
  const velocity = useRef([0, 0, 0]);
  const angularVelocity = useRef([0, 0, 0]);
  const quaternion = useRef([0, 0, 0, 1]);
  const isSettled = useRef(false);
  const stableFrames = useRef(0);

  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);
  useEffect(() => api.angularVelocity.subscribe((v) => (angularVelocity.current = v)), [api.angularVelocity]);
  useEffect(() => api.quaternion.subscribe((q) => (quaternion.current = q)), [api.quaternion]);

  // Initial spin
  useEffect(() => {
      if (api) {
          const kick = 10;
          api.velocity.set((Math.random()-0.5)*kick, (Math.random())*5, (Math.random()-0.5)*kick);
          api.angularVelocity.set((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
          isSettled.current = false;
          stableFrames.current = 0;
      }
  }, [api]);

  // Frame Loop for Check
  useEffect(() => {
      const interval = setInterval(() => {
          if (isSettled.current) return;

          const v = velocity.current;
          const av = angularVelocity.current;
          const vMag = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
          const avMag = Math.sqrt(av[0]**2 + av[1]**2 + av[2]**2);

          if (vMag < 0.1 && avMag < 0.1) {
              stableFrames.current++;
          } else {
              stableFrames.current = 0;
          }

          if (stableFrames.current > 10) {
              isSettled.current = true;
              calculateResult();
          }
      }, 100);
      return () => clearInterval(interval);
  }, [sides]);

  const calculateResult = () => {
      const q = new THREE.Quaternion(quaternion.current[0], quaternion.current[1], quaternion.current[2], quaternion.current[3]);

      let bestDot = -Infinity;
      let result = 1;

      const up = new THREE.Vector3(0, 1, 0);

      faceMap.forEach(face => {
          const worldNorm = face.norm.clone().applyQuaternion(q);
          const dot = worldNorm.dot(up);
          if (dot > bestDot) {
              bestDot = dot;
              result = face.num;
          }
      });

      if (sides === 4) {
          let bestDownDot = -Infinity;
          let bottomFaceNum = 1;
          const down = new THREE.Vector3(0, -1, 0);

           faceMap.forEach(face => {
              const worldNorm = face.norm.clone().applyQuaternion(q);
              const dot = worldNorm.dot(down);
              if (dot > bestDownDot) {
                  bestDownDot = dot;
                  bottomFaceNum = face.num;
              }
          });
          result = bottomFaceNum;
      }

      onSettled(id, result);
  };

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
