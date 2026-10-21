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
 * Greedy Best-First Search: always expands the open node with minimum h(n).
 * Fast but NOT optimal. Each cell is enqueued at most once (first discovery
 * fixes its parent), so it always terminates, including when the goal is unreachable.
 *
 * `pathCost` is the number of steps in `path`, or -1 if unreachable (`path` empty).
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

    const discovered = new Uint8Array(rows * cols);
    const heap = new MinHeap<GridNode>();

    const h0 = h(sr, sc);
    discovered[sr * cols + sc] = 1;
    heap.insert({ row: sr, col: sc, status: "FRONTIER", g: 0, h: h0, f: h0, parent: null });

    let goalNode: GridNode | null = null;

    while (!heap.isEmpty()) {
      const node = heap.extractMin();
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
        if (discovered[nIdx]) continue;
        discovered[nIdx] = 1;
        const nh = h(nr, nc);
        // f = h: priority is the heuristic only. g is tracked just for pathCost.
        heap.insert({ row: nr, col: nc, status: "FRONTIER", g: node.g + 1, h: nh, f: nh, parent: node });
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
