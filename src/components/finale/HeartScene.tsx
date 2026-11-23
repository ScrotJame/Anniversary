"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type * as Three from "three";
import { between, seeded } from "@/components/decor/random";
import { buildHeartGeometry, sampleHeartPoints } from "./heartGeometry";

const SPIN_SPEED = 0.6; // rad/s, left → right
const RESUME_AFTER = 1000; // ms without a tap before spinning again
const RESET_AFTER = 2000; // ms without a tap before the tap count starts over
const PULSE_MS = 180; // heartbeat on each tap
const POP_MS = 300; // big heart swells, then shrinks away
const MINI_COUNT = 90;
const MINI_HEIGHT = 0.26; // world units; the big heart is 2 tall
const MINI_LIFE = 1700; // ms each small heart flies
const GRAVITY = 5;
const MINI_COLORS = ["#ff5c77", "#d92648", "#f08a98", "#e8485f", "#ff8fab", "#ffd1dc", "#c9a227"];

type Phase = "spinning" | "paused" | "bursting" | "done";

type Mini = {
  position: Three.Vector3;
  velocity: Three.Vector3;
  rotation: Three.Euler;
  spin: Three.Vector3;
  size: number;
  delay: number;
};

const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

/**
 * The 3D heart. Taps only make it beat and pause; nothing shows how close it is to opening, and
 * the count silently starts over after RESET_AFTER without a tap. On the last tap it turns into a
 * burst of small 3D hearts. three.js is imported lazily inside the effect, so only the Finale
 * pays for it and nothing runs during static export. Calls onUnsupported if WebGL cannot start.
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
        // flash from inside the heart as it bursts
        const core = new THREE.PointLight(0xff4d8d, 0, 6, 2);
        heart.add(core);

        const material = new THREE.MeshStandardMaterial({
          color: 0xd92648,
          roughness: 0.35,
          metalness: 0.1,
          emissive: 0x5a0014,
          emissiveIntensity: 0.35,
        });
        const geometry = buildHeartGeometry(THREE);
        const big = new THREE.Mesh(geometry, material);
        heart.add(big);
        const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;

        // the small hearts, hidden until the burst
        const rand = seeded(14);
        const miniGeometry = buildHeartGeometry(THREE, { height: MINI_HEIGHT, detail: "low" });
        const miniMaterial = new THREE.MeshStandardMaterial({
          roughness: 0.4,
          metalness: 0.05,
          emissive: 0x3a0010,
          emissiveIntensity: 0.4,
        });
        const minisMesh = new THREE.InstancedMesh(miniGeometry, miniMaterial, MINI_COUNT);
        minisMesh.visible = false;
        minisMesh.frustumCulled = false; // they fly far from where the bounding sphere was computed
        heart.add(minisMesh);
        const color = new THREE.Color();
        const minis: Mini[] = sampleHeartPoints(THREE, geometry, MINI_COUNT, rand).map((p, i) => {
          minisMesh.setColorAt(i, color.set(MINI_COLORS[i % MINI_COLORS.length]));
          const out = p.lengthSq() > 1e-6 ? p.clone().normalize() : new THREE.Vector3(0, 0, 1);
          const velocity = out.multiplyScalar(between(rand, 2.2, 5));
          velocity.y += between(rand, 0.8, 3);
          velocity.z += between(rand, 0.5, 2.5); // a little towards the viewer
          return {
            position: p,
            velocity,
            rotation: new THREE.Euler(between(rand, -0.5, 0.5), between(rand, -1, 1), between(rand, -0.6, 0.6)),
            spin: new THREE.Vector3(between(rand, -5, 5), between(rand, -7, 7), between(rand, -4, 4)),
            size: between(rand, 0.65, 1.35),
            // inner points first, so the heart seems to dissolve outwards
            delay: (p.length() / 1.2) * 140 + between(rand, 0, 60),
          };
        });
        const home = minis.map((m) => m.position.clone());
        if (minisMesh.instanceColor) minisMesh.instanceColor.needsUpdate = true;

        let baseScale = 1;
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
          baseScale = Math.min(1.25, (visibleW * 0.62) / width);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(mount);
        resize();

        const state = { phase: "spinning" as Phase, hits: 0, lastHit: 0, pulseAt: -Infinity, burstStart: 0 };
        let raf = 0;
        let alive = true;

        const dispose = () => {
          if (!alive) return;
          alive = false;
          cancelAnimationFrame(raf);
          observer.disconnect();
          geometry.dispose();
          material.dispose();
          miniGeometry.dispose();
          miniMaterial.dispose();
          minisMesh.dispose();
          renderer.forceContextLoss();
          renderer.dispose();
          renderer.domElement.remove();
          hitRef.current = () => {};
        };
        teardown = dispose;

        hitRef.current = () => {
          if (state.phase === "bursting" || state.phase === "done") return;
          const now = performance.now();
          // too slow: the earlier taps no longer count
          if (now - state.lastHit > RESET_AFTER) state.hits = 0;
          state.hits += 1;
          state.lastHit = now;
          state.pulseAt = now;
          if (state.hits >= hitsToBreak) {
            state.phase = "bursting";
            state.burstStart = now;
            minisMesh.visible = !reduceRef.current;
            onBrokenRef.current();
            return;
          }
          state.phase = "paused";
        };

        const dummy = new THREE.Object3D();
        let last = performance.now();
        const frame = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          const still = reduceRef.current;

          if (state.phase === "paused" && now - state.lastHit > RESUME_AFTER) state.phase = "spinning";
          if (state.phase === "spinning" && !still) heart.rotation.y += SPIN_SPEED * dt;

          const beat = Math.min(1, (now - state.pulseAt) / PULSE_MS);
          const pulse = still ? 1 : 1 + 0.07 * Math.sin(Math.PI * beat);
          heart.scale.setScalar(baseScale * pulse);

          if (state.phase === "bursting") {
            const t = now - state.burstStart;
            // swell for the first 40%, then shrink to nothing
            const pop = t / POP_MS;
            const shrink = Math.max(0, 1 - (pop - 0.4) / 0.6);
            const s = pop < 0.4 ? 1 + 0.15 * Math.sin((pop / 0.4) * (Math.PI / 2)) : 1.15 * shrink * shrink;
            big.scale.setScalar(s);
            big.visible = s > 0.001;
            core.intensity = Math.max(0, 1 - t / 900) * 14;

            let finished = true;
            if (minisMesh.visible) {
              for (let i = 0; i < minis.length; i++) {
                const m = minis[i];
                const age = t - POP_MS * 0.3 - m.delay;
                if (age < MINI_LIFE) finished = false;
                let size = 0;
                if (age > 0) {
                  m.velocity.y -= GRAVITY * dt;
                  m.position.addScaledVector(m.velocity, dt);
                  m.rotation.x += m.spin.x * dt;
                  m.rotation.y += m.spin.y * dt;
                  m.rotation.z += m.spin.z * dt;
                  const grow = easeOutBack(Math.min(1, age / 220));
                  const fade = Math.min(1, Math.max(0, (MINI_LIFE - age) / (MINI_LIFE * 0.3)));
                  size = m.size * grow * fade;
                }
                dummy.position.copy(age > 0 ? m.position : home[i]);
                dummy.rotation.copy(m.rotation);
                dummy.scale.setScalar(Math.max(size, 1e-4));
                dummy.updateMatrix();
                minisMesh.setMatrixAt(i, dummy.matrix);
              }
              minisMesh.instanceMatrix.needsUpdate = true;
            } else {
              finished = t > POP_MS + 200;
            }

            if (finished) {
              state.phase = "done";
              dispose();
              setDone(true);
              return;
            }
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
  return (
    <div
      ref={mountRef}
      className="absolute inset-0 touch-manipulation"
      role="button"
      tabIndex={0}
      aria-label="Chạm để mở trái tim"
      onPointerDown={() => hitRef.current()}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (!e.repeat) hitRef.current();
      }}
    />
  );
}
