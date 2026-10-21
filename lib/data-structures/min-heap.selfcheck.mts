import assert from "node:assert/strict";
import { calculateHeuristic } from "../heuristics.ts";
import { MinHeap } from "./MinHeap.ts";

type Item = { f: number; h: number; id: number };

function checkHeap(): void {
  const heap = new MinHeap<Item>();
  assert.equal(heap.isEmpty(), true);
  assert.equal(heap.size(), 0);
  assert.throws(() => heap.extractMin(), /empty/);

  const nodes: Item[] = [
    { f: 5, h: 1, id: 1 },
    { f: 3, h: 4, id: 2 },
    { f: 3, h: 1, id: 3 },
    { f: 3, h: 2, id: 4 },
    { f: 8, h: 0, id: 5 },
    { f: 1, h: 9, id: 6 },
  ];
  for (const node of nodes) heap.insert(node);
  assert.equal(heap.size(), nodes.length);

  const order: number[] = [];
  while (!heap.isEmpty()) order.push(heap.extractMin().id);
  assert.deepEqual(order, [6, 3, 4, 2, 1, 5]);
  assert.equal(heap.isEmpty(), true);

  const mixed = new MinHeap<Item>();
  mixed.insert({ f: 4, h: 0, id: 1 });
  mixed.insert({ f: 2, h: 0, id: 2 });
  assert.equal(mixed.extractMin().f, 2);
  mixed.insert({ f: 1, h: 1, id: 3 });
  mixed.insert({ f: 1, h: 0, id: 4 });
  mixed.insert({ f: 3, h: 0, id: 5 });
  assert.deepEqual(
    [mixed.extractMin().id, mixed.extractMin().id, mixed.extractMin().id, mixed.extractMin().id],
    [4, 3, 5, 1],
  );

  const values: Item[] = Array.from({ length: 200 }, (_, i) => ({
    f: (i * 17) % 50,
    h: (i * 13) % 20,
    id: i,
  }));
  const bulk = new MinHeap<Item>();
  for (const value of values) bulk.insert(value);
  const got: Item[] = [];
  while (!bulk.isEmpty()) got.push(bulk.extractMin());
  const expected = [...values].sort((a, b) => a.f - b.f || a.h - b.h);
  assert.deepEqual(
    got.map((node) => [node.f, node.h]),
    expected.map((node) => [node.f, node.h]),
  );

  assert.throws(() => bulk.insert({ f: Number.NaN, h: 0, id: 0 }));
  assert.throws(() => bulk.insert({ f: 1, h: Number.POSITIVE_INFINITY, id: 0 }));
}

function checkHeuristics(): void {
  assert.equal(calculateHeuristic("manhattan", 0, 0, 3, 4), 7);
  assert.equal(calculateHeuristic("euclidean", 0, 0, 3, 4), 5);
  assert.equal(calculateHeuristic("chebyshev", 0, 0, 3, 4), 4);
  assert.equal(calculateHeuristic("manhattan", 2, 2, 2, 2), 0);
  assert.equal(calculateHeuristic("euclidean", -2, 5, 1, 1), 5);
  assert.equal(calculateHeuristic("chebyshev", -2, 5, 1, 1), 4);
  assert.throws(() =>
    calculateHeuristic("octile" as never, 0, 0, 1, 1),
  );
}

checkHeap();
checkHeuristics();
console.log("ok");
