import { calculateHeuristic } from "../heuristics";
import { MinHeap } from "../data-structures/MinHeap";
import type { GridNode, HeuristicType, NodeStatus, SearchResult } from "../types";

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0], // Up
  [1, 0], // Down
  [0, -1], // Left
  [0, 1], // Right
];

/**
 * A* search: expands the open node with minimum f(n) = g(n) + h(n).
 * Unit step cost, 4-directional moves. Optimal when h is admissible
 * (Manhattan is; Euclidean/Chebyshev underestimate, so they stay admissible).
 *
 * `pathCost` is the number of steps in `path`, or -1 if the goal is unreachable
 * (in which case `path` is empty).
 */
export function runAlgorithm(
  grid: NodeStatus[][],
  start: [number, number],
  goal: [number, number],
  heuristic: HeuristicType,
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
    const h = (r: number, c: number): number =>
      calculateHeuristic(heuristic, r, c, gr, gc);

    const bestG = new Float64Array(rows * cols).fill(Infinity);
    const closed = new Uint8Array(rows * cols);
    const heap = new MinHeap<GridNode>();

    const h0 = h(sr, sc);
    bestG[sr * cols + sc] = 0;
    heap.insert({ row: sr, col: sc, status: "FRONTIER", g: 0, h: h0, f: h0, parent: null });

    let goalNode: GridNode | null = null;

    while (!heap.isEmpty()) {
      const node = heap.extractMin();
      const idx = node.row * cols + node.col;
      if (closed[idx]) continue; // stale duplicate (no decrease-key in heap)
      closed[idx] = 1;
      node.status = "VISITED";
      visitedOrder.push([node.row, node.col]);

      if (node.row === gr && node.col === gc) {
        goalNode = node;
        break;
      }

      for (const [dr, dc] of DIRECTIONS) {
        const nr = node.row + dr;
        const nc = node.col + dc;
        if (!open(nr, nc)) continue;
        const nIdx = nr * cols + nc;
        if (closed[nIdx]) continue;
        const g = node.g + 1;
        if (g >= bestG[nIdx]) continue;
        bestG[nIdx] = g;
        const nh = h(nr, nc);
        heap.insert({ row: nr, col: nc, status: "FRONTIER", g, h: nh, f: g + nh, parent: node });
      }
    }

    if (goalNode) {
      for (let n: GridNode | null = goalNode; n; n = n.parent) path.push([n.row, n.col]);
      path.reverse();
      pathCost = goalNode.g;
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
