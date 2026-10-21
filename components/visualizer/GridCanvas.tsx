"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { SearchResult } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Theme: Light Editorial Paper Grid                                         */
/* -------------------------------------------------------------------------- */

const COLORS = {
  substrate: "#f2ede9",
  gridLine: "#e4dfd8",
  wall: "#1a1a1e",
  start: "#15803d",
  startDeep: "#166534",
  goal: "#c5692b",
  goalDeep: "#9a430e",
  visitedFrom: [221, 208, 244], // #ddd0f4 (fresh)
  visitedTo: [238, 231, 249], // #eee7f9 (settled)
  visitedBorder: "198,181,232", // #c6b5e8
  path: "#c5692b",
  pathHalo: "rgba(197,105,43,0.18)",
} as const;

const VISITED_ANIM_MS = 380;
const PATH_STAGGER_MS = 22;
const MAX_CELL_PX = 32;
const MIN_CELL_PX = 8;

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type Point = [row: number, col: number];

export interface GridSnapshot {
  rows: number;
  cols: number;
  /** walls[row][col] === true when the cell is a wall. */
  walls: boolean[][];
  start: Point;
  goal: Point;
}

export interface GridCanvasHandle {
  getSnapshot(): GridSnapshot;
  /** Remove visited/frontier/path overlays, keep walls and endpoints. */
  clearSearch(): void;
  /** Remove walls and search overlays. */
  clearWalls(): void;
  /** Reset everything including Start/Goal positions. */
  reset(): void;
  /** Replace walls (e.g. maze generators). Endpoints are never overwritten. */
  setWalls(cells: Point[], opts?: { replace?: boolean }): void;
  /** Animate a search result. `speed` = visited cells revealed per frame. */
  playResult(result: SearchResult, opts?: { speed?: number }): Promise<void>;
  /** Draw a search result immediately without animation. */
  showResult(result: SearchResult): void;
  cancelPlayback(): void;
}

export interface GridCanvasProps {
  rows?: number;
  cols?: number;
  /** Locks editing (e.g. while an algorithm is running). */
  disabled?: boolean;
  /** Clear stale visited/path overlays when the user edits the grid. */
  clearSearchOnEdit?: boolean;
  /** Fired once per finished edit gesture (pointer up), not on every move. */
  onChange?: (snapshot: GridSnapshot) => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Internal mutable store (lives in a ref: never triggers React renders)     */
/* -------------------------------------------------------------------------- */

const V_NONE = 0;
const V_VISITED = 1;

interface Store {
  rows: number;
  cols: number;
  cell: number;
  dpr: number;
  walls: Uint8Array;
  visited: Uint8Array;
  visitedAt: Float64Array;
  path: Point[];
  pathStart: number;
  start: Point;
  goal: Point;
  // playback
  queue: Point[] | null;
  queueIdx: number;
  queueAcc: number;
  queueSpeed: number;
  queuePath: Point[];
  resolvePlayback: (() => void) | null;
  // drawing
  raf: number;
  dirty: boolean;
}

function defaultEndpoints(rows: number, cols: number): { start: Point; goal: Point } {
  const r = Math.floor(rows / 2);
  return {
    start: [r, Math.max(0, Math.floor(cols / 4))],
    goal: [r, Math.min(cols - 1, Math.floor((cols * 3) / 4))],
  };
}

function createStore(rows: number, cols: number): Store {
  const { start, goal } = defaultEndpoints(rows, cols);
  return {
    rows,
    cols,
    cell: 20,
    dpr: 1,
    walls: new Uint8Array(rows * cols),
    visited: new Uint8Array(rows * cols),
    visitedAt: new Float64Array(rows * cols),
    path: [],
    pathStart: 0,
    start,
    goal,
    queue: null,
    queueIdx: 0,
    queueAcc: 0,
    queueSpeed: 1,
    queuePath: [],
    resolvePlayback: null,
    raf: 0,
    dirty: true,
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export const GridCanvas = forwardRef<GridCanvasHandle, GridCanvasProps>(
  function GridCanvas(
    {
      rows = 25,
      cols = 45,
      disabled = false,
      clearSearchOnEdit = true,
      onChange,
      className,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const storeRef = useRef<Store>(null as unknown as Store);
    if (
      !storeRef.current ||
      storeRef.current.rows !== rows ||
      storeRef.current.cols !== cols
    ) {
      storeRef.current = createStore(rows, cols);
    }

    // Keep latest props accessible from stable handlers without re-binding.
    const propsRef = useRef({ disabled, clearSearchOnEdit, onChange });
    propsRef.current = { disabled, clearSearchOnEdit, onChange };

    const drag = useRef<{
      mode: "draw" | "erase" | "start" | "goal" | null;
      last: Point | null;
      changed: boolean;
    }>({ mode: null, last: null, changed: false });

    /* ------------------------------ drawing -------------------------------- */

    const draw = useCallback((now: number): boolean => {
      const s = storeRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!s || !canvas || !ctx) return false;

      const { rows, cols, cell, dpr } = s;
      const W = cols * cell;
      const H = rows * cell;
      let animating = false;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = COLORS.substrate;
      ctx.fillRect(0, 0, W, H);

      // Hairline grid
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = Math.round(c * cell) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let r = 0; r <= rows; r++) {
        const y = Math.round(r * cell) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();

      // Visited wash with scale-in
      const [vf, vt] = [COLORS.visitedFrom, COLORS.visitedTo];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (s.visited[i] === V_NONE) continue;
          const t = Math.min(1, Math.max(0, (now - s.visitedAt[i]) / VISITED_ANIM_MS));
          if (t < 1) animating = true;
          const e = easeOutCubic(t);
          const scale = 0.25 + 0.75 * e;
          const size = (cell - 1) * scale;
          const off = (cell - size) / 2;
          const R = Math.round(vf[0] + (vt[0] - vf[0]) * e);
          const G = Math.round(vf[1] + (vt[1] - vf[1]) * e);
          const B = Math.round(vf[2] + (vt[2] - vf[2]) * e);
          ctx.fillStyle = `rgb(${R},${G},${B})`;
          ctx.strokeStyle = `rgba(${COLORS.visitedBorder},${0.25 + 0.75 * e})`;
          ctx.lineWidth = 1;
          roundRect(ctx, c * cell + off + 0.5, r * cell + off + 0.5, size, size, cell * 0.2 * scale);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Walls
      ctx.fillStyle = COLORS.wall;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!s.walls[r * cols + c]) continue;
          roundRect(ctx, c * cell + 0.5, r * cell + 0.5, cell - 1, cell - 1, cell * 0.12);
          ctx.fill();
        }
      }

      // Final path ribbon (progressively revealed)
      const n = s.path.length;
      if (n > 0) {
        const revealed = Math.min(n, ((now - s.pathStart) / PATH_STAGGER_MS) + 1);
        if (revealed < n) animating = true;
        if (revealed > 1) {
          const pts: [number, number][] = [];
          const whole = Math.floor(revealed);
          for (let k = 0; k < whole; k++) {
            pts.push([s.path[k][1] * cell + cell / 2, s.path[k][0] * cell + cell / 2]);
          }
          if (whole < n) {
            const f = revealed - whole;
            const a = s.path[whole - 1];
            const b = s.path[whole];
            pts.push([
              (a[1] + (b[1] - a[1]) * f) * cell + cell / 2,
              (a[0] + (b[0] - a[0]) * f) * cell + cell / 2,
            ]);
          }
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          for (const [w, color] of [
            [cell * 0.72, COLORS.pathHalo],
            [cell * 0.42, COLORS.path],
          ] as const) {
            ctx.strokeStyle = color;
            ctx.lineWidth = w;
            ctx.beginPath();
            pts.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
            ctx.stroke();
          }
        }
      }

      // Endpoints on top
      const badge = (p: Point, fill: string, deep: string) => {
        const cx = p[1] * cell + cell / 2;
        const cy = p[0] * cell + cell / 2;
        const rad = cell * 0.4;
        ctx.fillStyle = fill;
        ctx.strokeStyle = deep;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.32, 0, Math.PI * 2);
        ctx.fill();
      };
      badge(s.start, COLORS.start, COLORS.startDeep);
      badge(s.goal, COLORS.goal, COLORS.goalDeep);

      return animating;
    }, []);

    /** Run the render loop only while something is moving; idle = zero cost. */
    const schedule = useCallback(() => {
      const s = storeRef.current;
      if (s.raf) return;
      const frame = (now: number) => {
        s.raf = 0;

        // Advance playback queue
        if (s.queue) {
          s.queueAcc += s.queueSpeed;
          let steps = Math.floor(s.queueAcc);
          s.queueAcc -= steps;
          while (steps-- > 0 && s.queueIdx < s.queue.length) {
            const [r, c]: Point = s.queue[s.queueIdx++];
            const i = r * s.cols + c;
            s.visited[i] = V_VISITED;
            s.visitedAt[i] = now;
          }
          if (s.queueIdx >= s.queue.length) {
            s.path = s.queuePath;
            s.pathStart = now;
            s.queue = null;
          }
        }

        const animating = draw(now) || s.queue !== null;
        if (animating) {
          s.raf = requestAnimationFrame(frame);
        } else if (s.resolvePlayback) {
          s.resolvePlayback();
          s.resolvePlayback = null;
        }
      };
      s.raf = requestAnimationFrame(frame);
    }, [draw]);

    /* ------------------------------ sizing --------------------------------- */

    const resize = useCallback(() => {
      const el = containerRef.current;
      const canvas = canvasRef.current;
      const s = storeRef.current;
      if (!el || !canvas) return;

      const byWidth = Math.floor(el.clientWidth / s.cols);
      const byHeight = Math.floor((window.innerHeight * 0.72) / s.rows);
      const cell = Math.max(MIN_CELL_PX, Math.min(MAX_CELL_PX, byWidth, byHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      s.cell = cell;
      s.dpr = dpr;
      const W = s.cols * cell;
      const H = s.rows * cell;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      schedule();
    }, [schedule]);

    useEffect(() => {
      resize();
      const el = containerRef.current;
      const ro = new ResizeObserver(resize);
      if (el) ro.observe(el);
      window.addEventListener("resize", resize);
      const s = storeRef.current;
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", resize);
        if (s.raf) cancelAnimationFrame(s.raf);
        s.raf = 0;
        s.resolvePlayback?.();
        s.resolvePlayback = null;
      };
    }, [resize, rows, cols]);

    /* ---------------------------- store helpers ---------------------------- */

    const clearSearchLayer = useCallback(() => {
      const s = storeRef.current;
      s.visited.fill(0);
      s.path = [];
      s.queue = null;
      s.queuePath = [];
      s.resolvePlayback?.();
      s.resolvePlayback = null;
    }, []);

    const snapshot = useCallback((): GridSnapshot => {
      const s = storeRef.current;
      const walls: boolean[][] = [];
      for (let r = 0; r < s.rows; r++) {
        const row: boolean[] = new Array(s.cols);
        for (let c = 0; c < s.cols; c++) row[c] = s.walls[r * s.cols + c] === 1;
        walls.push(row);
      }
      return {
        rows: s.rows,
        cols: s.cols,
        walls,
        start: [...s.start],
        goal: [...s.goal],
      };
    }, []);

    /* ----------------------------- imperative API -------------------------- */

    useImperativeHandle(
      ref,
      (): GridCanvasHandle => ({
        getSnapshot: snapshot,
        clearSearch() {
          clearSearchLayer();
          schedule();
        },
        clearWalls() {
          storeRef.current.walls.fill(0);
          clearSearchLayer();
          schedule();
        },
        reset() {
          const s = storeRef.current;
          const d = defaultEndpoints(s.rows, s.cols);
          s.start = d.start;
          s.goal = d.goal;
          s.walls.fill(0);
          clearSearchLayer();
          schedule();
        },
        setWalls(cells, opts) {
          const s = storeRef.current;
          if (opts?.replace) s.walls.fill(0);
          for (const [r, c] of cells) {
            if (r < 0 || c < 0 || r >= s.rows || c >= s.cols) continue;
            if ((r === s.start[0] && c === s.start[1]) || (r === s.goal[0] && c === s.goal[1])) continue;
            s.walls[r * s.cols + c] = 1;
          }
          clearSearchLayer();
          schedule();
        },
        showResult(result) {
          const s = storeRef.current;
          clearSearchLayer();
          const settled = performance.now() - 1e6;
          for (const [r, c] of result.visitedOrder) {
            const i = r * s.cols + c;
            s.visited[i] = V_VISITED;
            s.visitedAt[i] = settled;
          }
          s.path = result.path;
          s.pathStart = settled;
          schedule();
        },
        playResult(result, opts) {
          const s = storeRef.current;
          clearSearchLayer();
          s.queue = result.visitedOrder;
          s.queueIdx = 0;
          s.queueAcc = 0;
          s.queueSpeed = Math.max(0.1, opts?.speed ?? 1);
          s.queuePath = result.path;
          schedule();
          return new Promise<void>((resolve) => {
            s.resolvePlayback = resolve;
          });
        },
        cancelPlayback() {
          const s = storeRef.current;
          s.queue = null;
          s.resolvePlayback?.();
          s.resolvePlayback = null;
        },
      }),
      [snapshot, clearSearchLayer, schedule],
    );

    /* ----------------------------- pointer input --------------------------- */

    const cellFromEvent = (e: React.PointerEvent): Point | null => {
      const s = storeRef.current;
      const rect = canvasRef.current!.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) / s.cell);
      const r = Math.floor((e.clientY - rect.top) / s.cell);
      if (r < 0 || c < 0 || r >= s.rows || c >= s.cols) return null;
      return [r, c];
    };

    /** Apply the current drag mode to one cell. Only schedules a canvas redraw. */
    const applyAt = (r: number, c: number) => {
      const s = storeRef.current;
      const d = drag.current;
      const i = r * s.cols + c;
      const isStart = r === s.start[0] && c === s.start[1];
      const isGoal = r === s.goal[0] && c === s.goal[1];
      let changed = false;

      if (d.mode === "start") {
        if (!isGoal && !isStart) {
          s.start = [r, c];
          s.walls[i] = 0;
          changed = true;
        }
      } else if (d.mode === "goal") {
        if (!isStart && !isGoal) {
          s.goal = [r, c];
          s.walls[i] = 0;
          changed = true;
        }
      } else if (!isStart && !isGoal) {
        const want = d.mode === "draw" ? 1 : 0;
        if (s.walls[i] !== want) {
          s.walls[i] = want;
          changed = true;
        }
      }

      if (changed) {
        if (!d.changed && propsRef.current.clearSearchOnEdit) clearSearchLayer();
        d.changed = true;
        schedule();
      }
    };

    /** Walk the straight line between two cells so fast drags leave no gaps. */
    const applyLine = (from: Point, to: Point) => {
      let [r0, c0] = from;
      const [r1, c1] = to;
      const dr = Math.abs(r1 - r0);
      const dc = Math.abs(c1 - c0);
      const sr = r0 < r1 ? 1 : -1;
      const sc = c0 < c1 ? 1 : -1;
      let err = dc - dr;
      for (;;) {
        applyAt(r0, c0);
        if (r0 === r1 && c0 === c1) break;
        const e2 = 2 * err;
        if (e2 > -dr) {
          err -= dr;
          c0 += sc;
        }
        if (e2 < dc) {
          err += dc;
          r0 += sr;
        }
      }
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (propsRef.current.disabled || e.button !== 0) return;
      const p = cellFromEvent(e);
      if (!p) return;
      const s = storeRef.current;
      const [r, c] = p;

      const d = drag.current;
      d.changed = false;
      if (r === s.start[0] && c === s.start[1]) d.mode = "start";
      else if (r === s.goal[0] && c === s.goal[1]) d.mode = "goal";
      else d.mode = s.walls[r * s.cols + c] ? "erase" : "draw";

      d.last = p;
      e.currentTarget.setPointerCapture(e.pointerId);
      applyAt(r, c);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const d = drag.current;
      if (!d.mode || !d.last) return;
      const p = cellFromEvent(e);
      if (!p || (p[0] === d.last[0] && p[1] === d.last[1])) return;
      if (d.mode === "start" || d.mode === "goal") applyAt(p[0], p[1]);
      else applyLine(d.last, p);
      d.last = p;
    };

    const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const d = drag.current;
      if (!d.mode) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      const changed = d.changed;
      d.mode = null;
      d.last = null;
      d.changed = false;
      if (changed) propsRef.current.onChange?.(snapshot());
    };

    /* -------------------------------- render ------------------------------- */

    return (
      <div
        ref={containerRef}
        className={`flex w-full justify-center ${className ?? ""}`}
      >
        <canvas
          ref={canvasRef}
          role="application"
          aria-label={`Pathfinding grid, ${rows} rows by ${cols} columns. Drag to draw or erase walls; drag the start or goal marker to move it.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onContextMenu={(e) => e.preventDefault()}
          className={`block rounded-xl border border-[#d1cdc6] bg-[#f2ede9] shadow-[0_10px_30px_rgba(0,0,0,0.05)] ${
            disabled ? "cursor-not-allowed" : "cursor-crosshair"
          }`}
          style={{ touchAction: "none" }}
        />
      </div>
    );
  },
);

export default GridCanvas;
