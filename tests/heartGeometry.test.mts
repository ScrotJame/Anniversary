import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { buildHeartGeometry, HEART_HEIGHT, sampleHeartPoints } from "../src/components/finale/heartGeometry.ts";
import { seeded } from "../src/components/decor/random.ts";

test("heart is HEART_HEIGHT tall, a bit wider than tall, centred, point down", () => {
  const g = buildHeartGeometry(THREE);
  const box = g.boundingBox!;
  const size = box.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.y - HEART_HEIGHT) < 0.01, `height ${size.y}`);
  assert.ok(size.x > size.y && size.x < size.y * 1.5, `width ${size.x}`);
  assert.ok(box.getCenter(new THREE.Vector3()).length() < 0.01);
  // the point: the lowest vertex sits near x = 0, the lobes (top) are off-centre
  const pos = g.getAttribute("position");
  let lowest = 0;
  for (let i = 1; i < pos.count; i++) if (pos.getY(i) < pos.getY(lowest)) lowest = i;
  assert.ok(Math.abs(pos.getX(lowest)) < 0.1, `point at x ${pos.getX(lowest)}`);
});

test("custom height and low detail for the small hearts", () => {
  const high = buildHeartGeometry(THREE);
  const low = buildHeartGeometry(THREE, { height: 0.3, detail: "low" });
  assert.ok(Math.abs(low.boundingBox!.getSize(new THREE.Vector3()).y - 0.3) < 0.005);
  assert.ok(low.getAttribute("position").count < high.getAttribute("position").count / 3);
});

test("burst points lie inside the heart and are seeded", () => {
  const g = buildHeartGeometry(THREE);
  const box = g.boundingBox!;
  const pts = sampleHeartPoints(THREE, g, 80, seeded(3));
  assert.equal(pts.length, 80);
  for (const p of pts) assert.ok(box.containsPoint(p), `outside: ${p.toArray()}`);
  const again = sampleHeartPoints(THREE, g, 80, seeded(3)).map((p) => p.toArray());
  assert.deepEqual(pts.map((p) => p.toArray()), again);
});
