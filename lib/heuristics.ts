import type { HeuristicType } from "./types";

export function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function euclidean(r1: number, c1: number, r2: number, c2: number): number {
  return Math.hypot(r1 - r2, c1 - c2);
}

export function chebyshev(r1: number, c1: number, r2: number, c2: number): number {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

export function calculateHeuristic(
  type: HeuristicType,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): number {
  switch (type) {
    case "manhattan":
      return manhattan(r1, c1, r2, c2);
    case "euclidean":
      return euclidean(r1, c1, r2, c2);
    case "chebyshev":
      return chebyshev(r1, c1, r2, c2);
    default: {
      const unexpected: never = type;
      throw new Error(`Unknown heuristic: ${String(unexpected)}`);
    }
  }
}
