type Wall = [number, number];

// ponytail: Math.random, no seed. Pass a rng in if a maze must replay.

function size(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/** In-bounds default start or goal. Those cells stay open. */
function isTerminal(row: number, col: number, rows: number, cols: number): boolean {
  if (row < 0 || col < 0 || row >= rows || col >= cols) return false;
  return (row === 1 && col === 1) || (row === rows - 2 && col === cols - 2);
}

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/**
 * Recursive division. Bisects each chamber with one horizontal or vertical
 * wall and a single open cell. The outer ring is walled so the route cannot
 * walk around the maze. Start `[1, 1]` and goal `[rows - 2, cols - 2]` stay open.
 */
export function generateRecursiveDivision(rows: number, cols: number): Wall[] {
  rows = size(rows);
  cols = size(cols);
  if (rows < 3 || cols < 3) return [];

  const wall = new Uint8Array(rows * cols);
  const mark = (row: number, col: number): void => {
    if (!isTerminal(row, col, rows, cols)) wall[row * cols + col] = 1;
  };

  for (let c = 0; c < cols; c++) {
    mark(0, c);
    mark(rows - 1, c);
  }
  for (let r = 1; r < rows - 1; r++) {
    mark(r, 0);
    mark(r, cols - 1);
  }

  const divide = (r0: number, r1: number, c0: number, c1: number): void => {
    const height = r1 - r0 + 1;
    const width = c1 - c0 + 1;
    if (height < 3 || width < 3) return;

    // Split the long axis. Square chambers pick an axis at random.
    const horizontal = width === height ? Math.random() < 0.5 : height > width;
    if (horizontal) {
      const wallRow = r0 + 1 + 2 * randInt(0, Math.floor((height - 3) / 2));
      const gap = randInt(c0, c1);
      for (let c = c0; c <= c1; c++) if (c !== gap) mark(wallRow, c);
      // Leave the rows beside the wall out of both chambers so a later
      // perpendicular wall cannot brick up the passage.
      divide(r0, wallRow - 2, c0, c1);
      divide(wallRow + 2, r1, c0, c1);
      return;
    }

    const wallCol = c0 + 1 + 2 * randInt(0, Math.floor((width - 3) / 2));
    const gap = randInt(r0, r1);
    for (let r = r0; r <= r1; r++) if (r !== gap) mark(r, wallCol);
    divide(r0, r1, c0, wallCol - 2);
    divide(r0, r1, wallCol + 2, c1);
  };

  divide(1, rows - 2, 1, cols - 2);

  const walls: Wall[] = [];
  for (let i = 0; i < wall.length; i++) {
    if (wall[i] === 0) continue;
    const row = Math.floor(i / cols);
    walls.push([row, i - row * cols]);
  }
  return walls;
}

/**
 * Scattered walls. Each non-terminal cell is a wall with probability `density`
 * (default 0.25). Values outside 0..1 are clamped.
 */
export function generateRandomObstacles(
  rows: number,
  cols: number,
  density = 0.25,
): Wall[] {
  rows = size(rows);
  cols = size(cols);
  const p = Number.isFinite(density) ? Math.min(1, Math.max(0, density)) : 0.25;
  const walls: Wall[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (isTerminal(row, col, rows, cols)) continue;
      if (Math.random() < p) walls.push([row, col]);
    }
  }
  return walls;
}

/**
 * Diagonal stair. Each row lays the diagonal cell and the tread beside it,
 * a solid run a search cannot cut through. The middle row stays open so the
 * run can still be crossed. Terminals stay open.
 */
export function generateStairPattern(rows: number, cols: number): Wall[] {
  rows = size(rows);
  cols = size(cols);
  const walls: Wall[] = [];
  const passage = Math.floor(rows / 2);
  for (let row = 0; row < rows; row++) {
    if (row === passage) continue;
    if (row < cols && !isTerminal(row, row, rows, cols)) walls.push([row, row]);
    if (row + 1 < cols && !isTerminal(row, row + 1, rows, cols)) walls.push([row, row + 1]);
  }
  return walls;
}
