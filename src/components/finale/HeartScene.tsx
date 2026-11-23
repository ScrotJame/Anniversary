"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type * as Three from "three";
import { between, seeded } from "@/components/decor/random";
import { buildHeartShards } from "./heartShards";

const SPIN_SPEED = 0.6; // rad/s, left → right
const RESUME_AFTER = 1000; // ms without a tap before spinning again
const SHAKE_MS = 150;
const EXPLODE_MS = 1200;
const CRACK_GAP = 0.09; // how far shards drift apart at full crack (heart is 2 units tall)
const GRAVITY = 6;

type Phase = "spinning" | "paused" | "exploding" | "done";

type Piece = {
  mesh: Three.Mesh;
  home: Three.Vector3;
  direction: Three.Vector3;
  velocity: Three.Vector3;
  spin: Three.Vector3;
};

/**
 * The 3D heart. three.js is imported lazily inside the effect, so only the Finale pays for it
 * and nothing runs during static export. Calls onUnsupported if WebGL cannot start.
 */
export default function HeartScene({
  hitsToBreak,
  onBroken,
  onUnsupported,
}: {
  hitsToBreak: number;
  onBroken: () => void;
  onUnsupported: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<() => void>(() => {});
  const onBrokenRef = useRef(onBroken);
  const onUnsupportedRef = useRef(onUnsupported);
  const reduce = useReducedMotion() ?? false;
  const reduceRef = useRef(reduce);
  const [done, setDone] = useState(false);

  useEffect(() => {
    onBrokenRef.current = onBroken;
    onUnsupportedRef.current = onUnsupported;
    reduceRef.current = reduce;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let teardown = () => {};

    import("three")
      .then((THREE) => {
        if (disposed) return;
        let renderer: Three.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          onUnsupportedRef.current();
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 8);

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffb3c6, 1.2);
        rim.position.set(-4, -2, -3);
        scene.add(rim);

        const heart = new THREE.Group();
        scene.add(heart);
        // glows from inside the heart: visible through the cracks as they open
        const core = new THREE.PointLight(0xff4d8d, 0, 4, 2);
        heart.add(core);

        const material = new THREE.MeshStandardMaterial({
          color: 0xd92648,
          roughness: 0.35,
          metalness: 0.1,
          emissive: 0x5a0014,
          emissiveIntensity: 0.35,
          side: THREE.DoubleSide,
        });

        const rand = seeded(14);
        const model = buildHeartShards(THREE, { shardCount: 36, rand });
        const pieces: Piece[] = model.shards.map((s) => {
          const mesh = new THREE.Mesh(s.geometry, material);
          mesh.position.copy(s.center);
          heart.add(mesh);
          return {
            mesh,
            home: s.center,
            direction: s.direction,
            velocity: new THREE.Vector3(),
            spin: new THREE.Vector3(),
          };
        });

        const resize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const visibleW = visibleH * camera.aspect;
          // ~62% of the screen width on phones, capped so it doesn't swallow a desktop screen
          heart.scale.setScalar(Math.min(1.25, (visibleW * 0.62) / model.width));
        };
        const observer = new ResizeObserver(resize);
        observer.observe(mount);
        resize();

        const state = { phase: "spinning" as Phase, hits: 0, lastHit: 0, shakeUntil: 0, explodeStart: 0 };
        let raf = 0;
        let alive = true;

        const dispose = () => {
          if (!alive) return;
          alive = false;
          cancelAnimationFrame(raf);
          observer.disconnect();
          for (const p of pieces) p.mesh.geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          hitRef.current = () => {};
        };
        teardown = dispose;

        hitRef.current = () => {
          if (state.phase === "exploding" || state.phase === "done") return;
          const now = performance.now();
          state.hits += 1;
          if (state.hits >= hitsToBreak) {
            state.phase = "exploding";
            state.explodeStart = now;
            material.transparent = true;
            material.needsUpdate = true;
            for (const p of pieces) {
              p.velocity.copy(p.direction).multiplyScalar(between(rand, 3, 6));
              p.velocity.y += between(rand, 0.5, 2.5);
              p.velocity.z += between(rand, -1.5, 1.5);
              p.spin.set(between(rand, -6, 6), between(rand, -6, 6), between(rand, -6, 6));
            }
            onBrokenRef.current();
            return;
          }
          state.phase = "paused";
          state.lastHit = now;
          state.shakeUntil = now + SHAKE_MS;
        };

        const target = new THREE.Vector3();
        let last = performance.now();
        const frame = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          const still = reduceRef.current;

          if (state.phase === "paused" && now - state.lastHit > RESUME_AFTER) state.phase = "spinning";
          if (state.phase === "spinning" && !still) heart.rotation.y += SPIN_SPEED * dt;

          const shake = !still && now < state.shakeUntil ? (state.shakeUntil - now) / SHAKE_MS : 0;
          heart.position.set(Math.sin(now * 0.09) * 0.06 * shake, Math.cos(now * 0.11) * 0.04 * shake, 0);

          if (state.phase === "exploding") {
            const t = (now - state.explodeStart) / EXPLODE_MS;
            if (!still) {
              for (const p of pieces) {
                p.velocity.y -= GRAVITY * dt;
                p.mesh.position.addScaledVector(p.velocity, dt);
                p.mesh.rotation.x += p.spin.x * dt;
                p.mesh.rotation.y += p.spin.y * dt;
                p.mesh.rotation.z += p.spin.z * dt;
              }
            }
            material.opacity = Math.max(0, 1 - t * t);
            core.intensity = Math.max(0, 1 - t) * 8;
            if (t >= 1) {
              state.phase = "done";
              dispose();
              setDone(true);
              return;
            }
          } else {
            const crack = state.hits / hitsToBreak;
            const ease = 1 - Math.exp(-dt * 14);
            for (const p of pieces) {
              target.copy(p.home).addScaledVector(p.direction, crack * CRACK_GAP);
              p.mesh.position.lerp(target, ease);
            }
            core.intensity = crack * 8;
            material.emissiveIntensity = 0.35 + crack * 0.9;
          }

          renderer.render(scene, camera);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      })
      .catch(() => {
        if (!disposed) onUnsupportedRef.current();
      });

    return () => {
      disposed = true;
      teardown();
    };
  }, [hitsToBreak]);

  if (done) return null;
  return <div ref={mountRef} className="absolute inset-0 touch-manipulation" onPointerDown={() => hitRef.current()} />;
}
