import type * as Three from "three";

type ThreeModule = typeof Three;

export type Shard = {
  /** This piece's triangles, translated so the piece's own centre is the origin. */
  geometry: Three.BufferGeometry;
  /** Where the piece sits in the assembled heart. */
  center: Three.Vector3;
  /** Unit vector from the heart's centre through this piece: cracks and the explosion push along it. */
  direction: Three.Vector3;
};

export type HeartModel = { shards: Shard[]; width: number; height: number };

/** Assembled heart height in world units. */
export const HEART_HEIGHT = 2;
/** Longest allowed triangle edge, so the flat front/back caps break into chunks instead of long slivers. */
export const MAX_EDGE = 0.22;

/** three.js "heart" example outline. It is upside down (point at the top); buildHeartShards flips it. */
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

/** Split triangles along their longest edge until every edge is ≤ maxEdge. Keeps winding order. */
function subdivide(pos: ArrayLike<number>, nor: ArrayLike<number>, maxEdge: number) {
  const outPos: number[] = [];
  const outNor: number[] = [];
  // each entry: 3 positions then 3 normals (18 numbers)
  const stack: number[][] = [];
  for (let i = 0; i < pos.length; i += 9) {
    stack.push([...Array.from({ length: 9 }, (_, k) => pos[i + k]), ...Array.from({ length: 9 }, (_, k) => nor[i + k])]);
  }
  while (stack.length > 0) {
    const t = stack.pop()!;
    const vtx = (base: number, v: number) => t.slice(base + v * 3, base + v * 3 + 3);
    const dist = (u: number, v: number) =>
      Math.hypot(t[u * 3] - t[v * 3], t[u * 3 + 1] - t[v * 3 + 1], t[u * 3 + 2] - t[v * 3 + 2]);
    const edges = [dist(0, 1), dist(1, 2), dist(2, 0)];
    const a = edges.indexOf(Math.max(...edges));
    if (edges[a] <= maxEdge) {
      outPos.push(...t.slice(0, 9));
      outNor.push(...t.slice(9, 18));
      continue;
    }
    const b = (a + 1) % 3;
    const c = (a + 2) % 3;
    const mid = (base: number) => [0, 1, 2].map((k) => (t[base + a * 3 + k] + t[base + b * 3 + k]) / 2);
    const mp = mid(0);
    const mn = mid(9);
    // (a, m, c) and (m, b, c) keep the a → b → c winding
    stack.push([...vtx(0, a), ...mp, ...vtx(0, c), ...vtx(9, a), ...mn, ...vtx(9, c)]);
    stack.push([...mp, ...vtx(0, b), ...vtx(0, c), ...mn, ...vtx(9, b), ...vtx(9, c)]);
  }
  return { pos: outPos, nor: outNor };
}

/**
 * A puffy extruded heart, HEART_HEIGHT tall and centred on the origin, cut into up to
 * `shardCount` pieces: each triangle joins the nearest of `shardCount` random seed points
 * (a Voronoi fracture). Pieces fit together exactly until something moves them.
 */
export function buildHeartShards(
  THREE: ThreeModule,
  { shardCount = 36, rand }: { shardCount?: number; rand: () => number },
): HeartModel {
  const extruded = new THREE.ExtrudeGeometry(heartShape(THREE), {
    depth: 4,
    curveSegments: 24,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 1.5,
    bevelThickness: 2,
  });
  extruded.rotateZ(Math.PI); // point down
  extruded.center();
  extruded.computeBoundingBox();
  const raw = extruded.boundingBox!.getSize(new THREE.Vector3());
  const scale = HEART_HEIGHT / raw.y;
  extruded.scale(scale, scale, scale);

  // ExtrudeGeometry is already non-indexed; toNonIndexed() would only warn
  const flat = extruded.index ? extruded.toNonIndexed() : extruded;
  const { pos, nor } = subdivide(flat.getAttribute("position").array, flat.getAttribute("normal").array, MAX_EDGE);
  flat.dispose();
  extruded.dispose();

  const box = new THREE.Box3().setFromArray(pos);
  const seeds = Array.from(
    { length: shardCount },
    () =>
      new THREE.Vector3(
        THREE.MathUtils.lerp(box.min.x, box.max.x, rand()),
        THREE.MathUtils.lerp(box.min.y, box.max.y, rand()),
        THREE.MathUtils.lerp(box.min.z, box.max.z, rand()),
      ),
  );

  const groups = seeds.map(() => ({ pos: [] as number[], nor: [] as number[] }));
  const centroid = new THREE.Vector3();
  for (let i = 0; i < pos.length; i += 9) {
    centroid.set(
      (pos[i] + pos[i + 3] + pos[i + 6]) / 3,
      (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3,
      (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3,
    );
    let best = 0;
    let bestDist = Infinity;
    for (let k = 0; k < seeds.length; k++) {
      const d = seeds[k].distanceToSquared(centroid);
      if (d < bestDist) {
        bestDist = d;
        best = k;
      }
    }
    groups[best].pos.push(...pos.slice(i, i + 9));
    groups[best].nor.push(...nor.slice(i, i + 9));
  }

  const shards = groups
    .filter((g) => g.pos.length > 0)
    .map((g) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(g.pos, 3));
      geometry.setAttribute("normal", new THREE.Float32BufferAttribute(g.nor, 3));
      geometry.computeBoundingBox();
      const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
      const direction = center.lengthSq() > 1e-6 ? center.clone().normalize() : new THREE.Vector3(0, 0, 1);
      return { geometry, center, direction };
    });

  return { shards, width: box.max.x - box.min.x, height: box.max.y - box.min.y };
}
