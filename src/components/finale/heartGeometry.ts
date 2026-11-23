import type * as Three from "three";

type ThreeModule = typeof Three;

/** Big heart height in world units. */
export const HEART_HEIGHT = 2;

/** three.js "heart" example outline. It is upside down (point at the top); buildHeartGeometry flips it. */
function heartShape(THREE: ThreeModule): Three.Shape {
  const s = new THREE.Shape();
  s.moveTo(5, 5);
  s.bezierCurveTo(5, 5, 4, 0, 0, 0);
  s.bezierCurveTo(-6, 0, -6, 7, -6, 7);
  s.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  s.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
  s.bezierCurveTo(16, 7, 16, 0, 10, 0);
  s.bezierCurveTo(7, 0, 5, 5, 5, 5);
  return s;
}

/**
 * A puffy extruded heart, `height` tall, point down, centred on the origin.
 * `detail` "low" is for the many small hearts the big one turns into.
 */
export function buildHeartGeometry(
  THREE: ThreeModule,
  { height = HEART_HEIGHT, detail = "high" }: { height?: number; detail?: "high" | "low" } = {},
): Three.BufferGeometry {
  const high = detail === "high";
  const geometry = new THREE.ExtrudeGeometry(heartShape(THREE), {
    depth: 4,
    curveSegments: high ? 24 : 8,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: high ? 4 : 2,
    bevelSize: 1.5,
    bevelThickness: 2,
  });
  geometry.rotateZ(Math.PI); // point down
  geometry.center();
  geometry.computeBoundingBox();
  const raw = geometry.boundingBox!.getSize(new THREE.Vector3());
  const scale = height / raw.y;
  geometry.scale(scale, scale, scale);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * `count` points spread over the heart's surface, pulled slightly inwards: where the small hearts
 * appear when the big one bursts, so together they still read as the big heart's shape.
 */
export function sampleHeartPoints(
  THREE: ThreeModule,
  geometry: Three.BufferGeometry,
  count: number,
  rand: () => number,
  inset = 0.85,
): Three.Vector3[] {
  const pos = geometry.getAttribute("position");
  const triangles = Math.floor(pos.count / 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const points: Three.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.floor(rand() * triangles) * 3;
    a.fromBufferAttribute(pos, t);
    b.fromBufferAttribute(pos, t + 1);
    c.fromBufferAttribute(pos, t + 2);
    let u = rand();
    let v = rand();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    points.push(
      new THREE.Vector3()
        .copy(a)
        .addScaledVector(b.sub(a), u)
        .addScaledVector(c.sub(a), v)
        .multiplyScalar(inset),
    );
  }
  return points;
}
