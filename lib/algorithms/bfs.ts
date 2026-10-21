import type { HeuristicType, NodeStatus, SearchResult } from "../types";

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0], // Up
  [1, 0], // Down
  [0, -1], // Left
  [0, 1], // Right
];

/**
 * Breadth-First Search (uninformed). Optimal for unit step cost.
 * The queue is a flat Int32Array of cell indices with a head pointer, so
 * dequeue is O(1) (no Array.shift). Each cell is enqueued at most once, so at
 * most rows*cols entries are ever written. Terminates when the queue drains.
 *
 * `heuristic` is accepted only for the shared signature and is ignored.
 * `pathCost` is the number of steps in `path`, or -1 if unreachable (`path` empty).
 */
export function runAlgorithm(
  grid: NodeStatus[][],
  start: [number, number],
  goal: [number, number],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the shared signature
  _heuristic: HeuristicType,
): SearchResult {
  const t0 = performance.now();
  const visitedOrder: [number, number][] = [];
  const path: [number, number][] = [];
  let pathCost = -1;

  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const [sr, sc] = start;
  const [gr, gc] = goal;

  const open = (r: number, c: number): boolean =>
    r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== "WALL";

  if (open(sr, sc) && open(gr, gc)) {
    const total = rows * cols;
    const parent = new Int32Array(total).fill(-1);
    const seen = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const startIdx = sr * cols + sc;
    const goalIdx = gr * cols + gc;
    seen[startIdx] = 1;
    queue[tail++] = startIdx;

    let found = false;
    while (head < tail) {
      const idx = queue[head++];
      const r = (idx / cols) | 0;
      const c = idx - r * cols;
      visitedOrder.push([r, c]);

      if (idx === goalIdx) {
        found = true;
        break;
      }

      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (!open(nr, nc)) continue;
        const nIdx = nr * cols + nc;
        if (seen[nIdx]) continue;
        seen[nIdx] = 1;
        parent[nIdx] = idx;
        queue[tail++] = nIdx;
      }
    }

    if (found) {
      for (let i = goalIdx; i !== -1; i = parent[i]) {
        const r = (i / cols) | 0;
        path.push([r, i - r * cols]);
      }
      path.reverse();
      pathCost = path.length - 1;
    }
  }

  return {
    path,
    visitedOrder,
    nodesExplored: visitedOrder.length,
    pathCost,
    executionTimeMs: performance.now() - t0,
  };
}
