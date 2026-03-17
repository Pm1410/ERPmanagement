'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function LandingHero3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0x60a5fa, 1.4);
    key.position.set(4, 4, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xa855f7, 1.0);
    rim.position.set(-6, -2, 5);
    scene.add(rim);

    // Main hero object (torus knot) + glass ring
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.15, 0.34, 220, 18),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.55,
        roughness: 0.22,
        emissive: 0x0b1020,
        emissiveIntensity: 0.35,
      }),
    );
    scene.add(knot);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.04, 12, 256),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.75,
        metalness: 0.15,
        roughness: 0.25,
        transmission: 0.9,
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    );
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    // Particle field
    const particleCount = 900;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 5.2 * Math.pow(Math.random(), 0.6);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particlesGeo,
      new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.02, opacity: 0.55, transparent: true }),
    );
    scene.add(particles);

    const resize = () => {
      const w = host.clientWidth;
      const h = Math.max(320, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      knot.rotation.x = t * 0.35;
      knot.rotation.y = t * 0.55;
      ring.rotation.z = t * 0.25;
      particles.rotation.y = t * 0.06;

      // subtle bob
      knot.position.y = Math.sin(t * 0.9) * 0.1;
      ring.position.y = Math.sin(t * 0.9) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      particlesGeo.dispose();
      (particles.material as THREE.Material).dispose();
      (knot.geometry as THREE.BufferGeometry).dispose();
      (knot.material as THREE.Material).dispose();
      (ring.geometry as THREE.BufferGeometry).dispose();
      (ring.material as THREE.Material).dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-[360px] w-full">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
      <div className="absolute left-4 top-4 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white/80">
        Live 3D preview
      </div>
    </div>
  );
}

