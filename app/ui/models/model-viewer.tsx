"use client"

import { Canvas, useFrame } from "@react-three/fiber";
import { TrackballControls, Environment } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { STLLoader } from "three-stdlib";
import { useLoader } from "@react-three/fiber";
import {Suspense, useMemo } from 'react';
import { EffectComposer, SSAO, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function STLModel({ url, autoRotate }: { url: string, autoRotate?: boolean }) {
    const geometry = useLoader(STLLoader, url);
    const meshRef = useRef<THREE.Mesh>(null);

    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);
    geometry.center();

    const size = new THREE.Vector3();
    geometry.boundingBox?.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5/maxDim;
    
    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: "#cccccc",
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 0.5,
        reflectivity: 0.6,
    }), []);

    useFrame(() => {
        if (autoRotate && meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });


    return (
        <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
        >
        {/* <meshStandardMaterial color="#c0c0ca" metalness={0.3} roughness={0.4} /> */}
        </mesh>
  );
}

export function STLViewer({modelUrl} : {modelUrl: string}) {
  return (
    <div className='flex justify-center items-center'>
        <Canvas className='h-2xl w-2xl bg-blue-50'
        camera={{ position: [0, 0, 5], fov: 60 }}
        shadows>
            <TrackballControls />
            <ambientLight intensity={0.6} />

            <hemisphereLight
            groundColor="#444444" 
            intensity={0.6} 
            position={[0, 50, 0]} 
            />

            <directionalLight 
            color="white" 
            intensity={0.8} 
            position={[10, 10, 10]} 
            castShadow 
            />
            <Environment preset="studio" />

            <STLModel url={modelUrl} />

            
        </Canvas>
    </div>
  );
}