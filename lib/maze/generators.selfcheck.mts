import assert from "node:assert/strict";
import {
  generateRandomObstacles,
  generateRecursiveDivision,
  generateStairPattern,
} from "./generators.ts";

function reachable(rows: number, cols: number, walls: readonly [number, number][]): boolean {
  const sr = 1;
  const sc = 1;
  const gr = rows - 2;
  const gc = cols - 2;
  if (sr >= rows || sc >= cols || gr < 0 || gc < 0 || gr >= rows || gc >= cols) return true;

  const blocked = new Uint8Array(rows * cols);
  for (const [r, c] of walls) blocked[r * cols + c] = 1;
  const start = sr * cols + sc;
  const goal = gr * cols + gc;
  if (blocked[start] || blocked[goal]) return false;

  const seen = new Uint8Array(rows * cols);
  const queue = [start];
  seen[start] = 1;
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    if (i === goal) return true;
    const r = Math.floor(i / cols);
    const c = i - r * cols;
    const next = [r > 0 ? i - cols : -1, r + 1 < rows ? i + cols : -1, c > 0 ? i - 1 : -1, c + 1 < cols ? i + 1 : -1];
    for (const n of next) {
      if (n < 0 || seen[n] || blocked[n]) continue;
      seen[n] = 1;
      queue.push(n);
    }
  }
  return false;
}

function assertWalls(rows: number, cols: number, walls: readonly [number, number][]): void {
  const seen = new Set<string>();
  for (const [r, c] of walls) {
    assert.ok(r >= 0 && c >= 0 && r < rows && c < cols, `out of bounds ${r},${c}`);
    assert.ok(!(r === 1 && c === 1), `start walled on ${rows}x${cols}`);
    assert.ok(!(r === rows - 2 && c === cols - 2), `goal walled on ${rows}x${cols}`);
    const key = `${r},${c}`;
    assert.ok(!seen.has(key), `duplicate ${key}`);
    seen.add(key);
  }
}

const sizes: readonly [number, number][] = [
  [5, 5],
  [6, 6],
  [7, 9],
  [8, 8],
  [8, 12],
  [9, 9],
  [9, 10],
  [10, 9],
  [15, 15],
  [16, 17],
  [25, 45],
  [45, 25],
];

for (const [rows, cols] of sizes) {
  for (let trial = 0; trial < 40; trial++) {
    const walls = generateRecursiveDivision(rows, cols);
    assertWalls(rows, cols, walls);
    assert.ok(reachable(rows, cols, walls), `division disconnected ${rows}x${cols} trial ${trial}`);
    for (let c = 0; c < cols; c++) {
      assert.ok(walls.some(([r, col]) => r === 0 && col === c), "missing top border");
      assert.ok(walls.some(([r, col]) => r === rows - 1 && col === c), "missing bottom border");
    }
    assert.ok(
      walls.some(([r, c]) => r > 0 && r < rows - 1 && c > 0 && c < cols - 1),
      "no interior wall",
    );
  }

  const stairs = generateStairPattern(rows, cols);
  assertWalls(rows, cols, stairs);
  assert.ok(reachable(rows, cols, stairs), `stair disconnected ${rows}x${cols}`);
  assert.ok(
    stairs.some(([r, c]) => c === r || c === r + 1),
    "stair is not diagonal",
  );
}

assert.deepEqual(generateRecursiveDivision(0, 10), []);
assert.deepEqual(generateRecursiveDivision(2, 8), []);
assert.deepEqual(generateRecursiveDivision(Number.NaN, 4), []);
assert.deepEqual(generateStairPattern(0, 0), []);

const empty = generateRandomObstacles(12, 12, 0);
assert.deepEqual(empty, []);
const full = generateRandomObstacles(10, 10, 1);
assertWalls(10, 10, full);
assert.equal(full.length, 100 - 2);
assert.ok(!full.some(([r, c]) => r === 1 && c === 1));
assert.ok(!full.some(([r, c]) => r === 8 && c === 8));

const scattered = generateRandomObstacles(20, 20);
assertWalls(20, 20, scattered);
assert.ok(scattered.length > 40 && scattered.length < 160, `density drift ${scattered.length}`);

const stair = generateStairPattern(10, 10);
assert.ok(!stair.some(([r, c]) => r === 1 && c === 1));
assert.ok(!stair.some(([r, c]) => r === 8 && c === 8));
assert.ok(!stair.some(([r]) => r === 5), "middle passage was walled");
assert.ok(stair.some(([r, c]) => r === 2 && c === 2));
assert.ok(stair.some(([r, c]) => r === 2 && c === 3));

console.log("maze generators ok");
