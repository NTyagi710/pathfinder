export type NodeStatus =
  | "EMPTY"
  | "WALL"
  | "START"
  | "GOAL"
  | "VISITED"
  | "FRONTIER"
  | "PATH";

/** g is cost from the start, h is the heuristic to the goal, f is the heap key. */
export interface GridNode {
  row: number;
  col: number;
  status: NodeStatus;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

export interface SearchResult {
  /** Reconstructed route. Each entry is [row, col]. */
  path: [number, number][];
  /** Expansion order. Each entry is [row, col]. */
  visitedOrder: [number, number][];
  nodesExplored: number;
  pathCost: number;
  executionTimeMs: number;
}

export type HeuristicType = "manhattan" | "euclidean" | "chebyshev";
