import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { buildHeartShards, HEART_HEIGHT, MAX_EDGE } from "../src/components/finale/heartShards.ts";
import { seeded } from "../src/components/decor/random.ts";

const build = (seed = 14) => buildHeartShards(THREE, { shardCount: 36, rand: seeded(seed) });

test("fractures into many pieces, never more than requested", () => {
  const { shards } = build();
  assert.ok(shards.length >= 12, `only ${shards.length} shards`);
  assert.ok(shards.length <= 36);
});

test("pieces reassemble into a heart HEART_HEIGHT tall and a bit wider than tall", () => {
  const model = build();
  const union = new THREE.Box3();
  for (const s of model.shards) {
    s.geometry.computeBoundingBox();
    union.union(s.geometry.boundingBox!.clone().translate(s.center));
  }
  const size = union.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.y - HEART_HEIGHT) < 0.01, `height ${size.y}`);
  assert.ok(Math.abs(model.height - HEART_HEIGHT) < 0.01);
  assert.ok(model.width > model.height && model.width < model.height * 1.5, `width ${model.width}`);
  // centred on the origin
  const c = union.getCenter(new THREE.Vector3());
  assert.ok(c.length() < 0.05, `centre ${c.toArray()}`);
});

test("each piece is a triangle mesh centred on its own origin with a unit direction", () => {
  for (const s of build().shards) {
    const pos = s.geometry.getAttribute("position");
    const nor = s.geometry.getAttribute("normal");
    assert.ok(pos.count > 0 && pos.count % 3 === 0);
    assert.equal(nor.count, pos.count);
    s.geometry.computeBoundingBox();
    const own = s.geometry.boundingBox!.getCenter(new THREE.Vector3());
    assert.ok(own.length() < 1e-4);
    assert.ok(Math.abs(s.direction.length() - 1) < 1e-6);
  }
});

test("no long slivers: every triangle edge is at most MAX_EDGE", () => {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (const s of build().shards) {
    const pos = s.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
      const longest = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
      assert.ok(longest <= MAX_EDGE + 1e-6, `edge ${longest}`);
    }
  }
});

test("same seed gives the same fracture", () => {
  const one = build(5).shards.map((s) => s.center.toArray());
  const two = build(5).shards.map((s) => s.center.toArray());
  assert.deepEqual(one, two);
});
