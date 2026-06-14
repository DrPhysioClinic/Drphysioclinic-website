"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Environment, Float, Center } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";

import * as THREE from "three";

function SpineModel({ onRevealComplete, inView }: { onRevealComplete: () => void, inView: boolean }) {
  const { scene } = useGLTF("/spine.glb");
  const startTime = useRef<number | null>(null);
  const doneRef = useRef(false);

  const { clone, meshes } = useMemo(() => {
    const clonedScene = scene.clone(true);
    const m: THREE.Mesh[] = [];
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        m.push(child as THREE.Mesh);
      }
    });

    m.forEach((mesh) => {
      mesh.geometry.computeBoundingBox();
      const box = new THREE.Box3().setFromObject(mesh);
      mesh.userData.y = box.min.y;
      mesh.userData.origScale = mesh.scale.clone();
      mesh.scale.set(0, 0, 0); // Hide initially
    });

    // Sort bottom to top
    m.sort((a, b) => a.userData.y - b.userData.y);
    return { clone: clonedScene, meshes: m };
  }, [scene]);

  useEffect(() => {
    startTime.current = null;
    doneRef.current = false;
  }, [clone]);

  useFrame(() => {
    if (!inView || meshes.length === 0 || doneRef.current) return;

    if (startTime.current === null) {
      startTime.current = performance.now();
    }

    const elapsed = (performance.now() - startTime.current) / 1000;
    const staggerDuration = 0.08; // delay between each vertebrae
    const animDuration = 0.4; // time to scale up

    let allDone = true;

    meshes.forEach((mesh, index) => {
      const delay = index * staggerDuration;
      let progress = (elapsed - delay) / animDuration;
      
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      
      if (progress < 1) {
        allDone = false;
      }

      // Smooth step easing
      const eased = progress * progress * (3 - 2 * progress);
      const orig = mesh.userData.origScale as THREE.Vector3;
      
      // Lerp scale
      mesh.scale.lerpVectors(new THREE.Vector3(0,0,0), orig, eased);
    });

    if (allDone && elapsed > (meshes.length * staggerDuration + animDuration)) {
      doneRef.current = true;
      onRevealComplete();
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Only start rotating if the reveal is done
    if (doneRef.current && groupRef.current) {
      // Small delay before rotating if desired, or just rotate immediately after reveal
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <PresentationControls 
      global={false} 
      cursor={true} 
      snap={true} 
      speed={1} 
      zoom={1} 
      rotation={[0, 0, 0]}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Shifted X to 4 so it sits beautifully on the right side of the screen */}
        <group ref={groupRef} position={[4, -12, 0]}>
          <primitive object={clone} scale={0.45} />
        </group>
      </Float>
    </PresentationControls>
  );
}

function SceneController({ revealDone }: { revealDone: boolean }) {
  useFrame((state, delta) => {
    if (revealDone) {
      // Zoom camera in smoothly to a better framing distance
      state.camera.position.lerp(new THREE.Vector3(0, 0, 8), 2 * delta);
    }
  });
  return null;
}

export function Hero3DModel() {
  const [revealDone, setRevealDone] = useState(false);
  const [zoomDone, setZoomDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (revealDone) {
      const t = setTimeout(() => setZoomDone(true), 2500);
      return () => clearTimeout(t);
    }
  }, [revealDone]);

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[600px]">
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }} className="!pointer-events-auto">
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#157f76" />
        
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <SpineModel onRevealComplete={() => setRevealDone(true)} inView={inView} />
        </Suspense>

        <SceneController revealDone={revealDone} />
      </Canvas>
    </div>
  );
}

// Preload the model to prevent UI pop-in
useGLTF.preload("/spine.glb");
