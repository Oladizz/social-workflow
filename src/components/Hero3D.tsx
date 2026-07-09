import React from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  PresentationControls, 
  Float, 
  RoundedBox, 
  Environment, 
  MeshTransmissionMaterial
} from '@react-three/drei';
import * as THREE from 'three';

const StackedDesign = () => {
  // Dotted lines connecting the corners
  const lineMaterial = new THREE.LineDashedMaterial({
    color: 0x999999,
    dashSize: 0.1,
    gapSize: 0.1,
    opacity: 0.5,
    transparent: true
  });

  const width = 3;
  const height = 0.4;
  const depth = 3;
  const gap = 1.8;

  // Corners relative to center
  const corners = [
    [-width/2 + 0.3, 0, -depth/2 + 0.3],
    [width/2 - 0.3, 0, -depth/2 + 0.3],
    [-width/2 + 0.3, 0, depth/2 - 0.3],
    [width/2 - 0.3, 0, depth/2 - 0.3],
  ];

  return (
    <group rotation={[Math.PI / 6, Math.PI / 4, 0]}>
      {/* Top Glass Layer */}
      <RoundedBox 
        args={[width, height, depth]} 
        radius={0.2} 
        smoothness={4} 
        position={[0, gap/2, 0]}
      >
        <MeshTransmissionMaterial 
          thickness={0.5} 
          roughness={0} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.04} 
          backside={true}
          clearcoat={1}
          clearcoatRoughness={0}
        />
        {/* Subtle rim outline to mimic the drawing */}
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(width, height, depth)]} />
          <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.3} />
        </lineSegments>
      </RoundedBox>

      {/* Bottom Purple Layer */}
      <RoundedBox 
        args={[width, height, depth]} 
        radius={0.2} 
        smoothness={4} 
        position={[0, -gap/2, 0]}
      >
        <meshStandardMaterial 
          color="#6a0dad" 
          roughness={0.2} 
          metalness={0.8} 
        />
      </RoundedBox>

      {/* Connecting Dotted Lines */}
      {corners.map((corner, index) => {
        const points = [
          new THREE.Vector3(corner[0], gap/2 - height/2, corner[2]),
          new THREE.Vector3(corner[0], -gap/2 + height/2, corner[2])
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={index} geometry={geometry} material={lineMaterial} computeLineDistances />
        );
      })}
    </group>
  );
};

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, -10]} intensity={0.5} color="#8a2be2" />
        
        {/* Environment map for the glass reflections */}
        <Environment preset="city" />

        {/* Adds mouse interaction */}
        <PresentationControls 
          global 
          rotation={[0, 0, 0]} 
          polar={[-0.1, 0.1]} 
          azimuth={[-0.2, 0.2]} 
          config={{ mass: 2, tension: 400 }} 
          snap={{ mass: 4, tension: 400 }}
        >
          {/* Adds smooth floating animation */}
          <Float 
            speed={2} 
            rotationIntensity={0.2} 
            floatIntensity={0.5} 
            floatingRange={[-0.1, 0.1]}
          >
            <StackedDesign />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
}
