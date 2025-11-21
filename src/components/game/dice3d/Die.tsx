import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useBox, useConvexPolyhedron } from '@react-three/cannon';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

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
    // Merge vertices to fix seams if needed, but simple geometries are usually fine.
    // Actually, useConvexPolyhedron needs vertices and faces.

    // Convert to non-indexed for easier processing or keep indexed?
    // cannon-es expects vertices as array of arrays, and faces as array of indices

    // If indexed
    let vertices: number[][] = [];
    let faces: number[][] = [];

    // We need to merge duplicate vertices for ConvexPolyhedron to work well
    // Using a simple merge implementation or relying on the geometry structure

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

            // Check if face already found (close enough)
            const exists = foundFaces.some(f => f.pos.distanceTo(center) < 0.1);
            if (!exists) foundFaces.push({ pos: center, norm: n1 });
        }

        // Sort faces if possible to match standard dice layouts (complicated),
        // or just assign 1..N arbitrarily but deterministically
        // For physics result calculation, we need to know which number corresponds to which normal vector.

        return foundFaces.map((f, i) => {
            const quaternion = new THREE.Quaternion();
            // Rotate text to face outward
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.norm.normalize());
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            return {
                pos: f.pos.multiplyScalar(1.02).toArray(),
                rot: [euler.x, euler.y, euler.z],
                num: (i % sides) + 1,
                norm: f.norm.clone().normalize() // Store normal for calculation
            };
        });
    }, [geometry, sides]);

    // Expose face data for calculation?
    // We can't easily pass it back to the parent logic from here,
    // but the parent Die component needs this data to calculate the result.
    // We'll re-calculate or memoize "Face Normals & Numbers" in the parent component.

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
                    font="https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2"
                >
                    {d.num}
                </Text>
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

       // Same logic as FaceNumbers component to ensure sync
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

          // If stable for ~0.5 seconds (approx 30 checks at 16ms? No, interval is needed)
          // Let's say stable for 10 checks at 100ms = 1s
          if (stableFrames.current > 10) {
              isSettled.current = true;
              calculateResult();
          }
      }, 100);
      return () => clearInterval(interval);
  }, [sides]); // dependency on sides to reset if props change?

  const calculateResult = () => {
      const q = new THREE.Quaternion(quaternion.current[0], quaternion.current[1], quaternion.current[2], quaternion.current[3]);

      // We need to find which face normal is pointing UP (World Y+)
      // We transform local face normals by the die's rotation
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

      // Special case for d4 (tetrahedron): The "up" face is actually a vertex pointing up?
      // Or if it lands flat, a face is pointing DOWN.
      // Standard d4 numbers are near vertices or edges.
      // If face numbers are used, the number displayed is usually the one upright on the bottom face visible from side?
      // Or top-down view: d4 usually has numbers at corners.
      // Our FaceNumbers puts numbers on faces.
      // If d4 lands on a face, the OPPOSITE face (or vertex) is up.
      // Tetrahedron geometry: 4 faces. If one is down (-Y), which one is up? None (vertex is up).
      // So for d4, we might want to check which face is DOWN (dot product with -Y closest to 1)
      // and map that to the result?
      // Standard d4s read the number at the peak (top vertex) or bottom edge.
      // Our `FaceNumbers` renders numbers on faces.
      // If a face is flat on ground, the number on that face is hidden.
      // So we assume the result is determined by the face pointing mostly UP?
      // A d4 never has a face pointing perfectly UP. It has a vertex pointing up.
      // So for d4, we check which face is DOWN (closest to -Y), and the result is... determined by that?
      // Let's assume for simplicity we check dot product with UP.
      // For d4, the max dot product with UP will be the face that is "most up" (which is none, they are all slanted).
      // Actually, if it sits on a face, 3 faces are slanted up, 1 is down.
      // The 3 slanted faces have same dot product.
      // This logic fails for d4.

      if (sides === 4) {
          // Find face pointing DOWN
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
          // Determine result based on bottom face?
          // Usually d4s have 3 numbers per face, and you read the one at the top.
          // Since we only render one number per face in FaceNumbers, this visual is non-standard for d4.
          // Let's just return the bottomFaceNum as the "result" for now,
          // or simplisticly mapped.
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
