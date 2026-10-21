"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, OctagonX, Swords } from "lucide-react";

import ControlBar, {
  SPEED_STEPS,
  type AlgorithmType,
  type MazeType,
} from "@/components/visualizer/ControlBar";
import GridCanvas, {
  type GridCanvasHandle,
  type GridSnapshot,
} from "@/components/visualizer/GridCanvas";
import MetricsHUD from "@/components/visualizer/MetricsHUD";
import VivaModal from "@/components/viva/VivaModal";

import { runAlgorithm as runAStar } from "@/lib/algorithms/astar";
import { runAlgorithm as runBFS } from "@/lib/algorithms/bfs";
import { runAlgorithm as runGBFS } from "@/lib/algorithms/gbfs";
import {
  generateRandomObstacles,
  generateRecursiveDivision,
} from "@/lib/maze/generators";
import type { HeuristicType, NodeStatus, SearchResult } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const ROWS = 25; // odd dimensions suit recursive division
const COLS = 45;

const ALGORITHM_LABEL: Record<AlgorithmType, string> = {
  astar: "A*",
  bfs: "BFS",
  gbfs: "GBFS",
};

const HEURISTIC_LABEL: Record<HeuristicType, string> = {
  manhattan: "Manhattan",
  euclidean: "Euclidean",
  chebyshev: "Chebyshev",
};

const RACE_ORDER: AlgorithmType[] = ["astar", "bfs", "gbfs"];
const FRAME_MS = 1000 / 60;
const RACE_PAUSE_MS = 600;
const TIMING_RUNS = 5;

type Runner = typeof runAStar;
const RUNNERS: Record<AlgorithmType, Runner> = {
  astar: runAStar,
  bfs: runBFS,
  gbfs: runGBFS,
};

interface RaceRow {
  algorithm: AlgorithmType;
  heuristic: string;
  result: SearchResult;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function toGrid(s: GridSnapshot): NodeStatus[][] {
  return s.walls.map((row) => row.map((w) => (w ? "WALL" : "EMPTY")));
}

/** Run an algorithm; keep the fastest of a few runs for a steadier timing. */
function timedRun(
  algo: AlgorithmType,
  s: GridSnapshot,
  heuristic: HeuristicType,
  runs = 1,
): SearchResult {
  const grid = toGrid(s);
  let best = RUNNERS[algo](grid, s.start, s.goal, heuristic);
  for (let i = 1; i < runs; i++) {
    const r = RUNNERS[algo](grid, s.start, s.goal, heuristic);
    if (r.executionTimeMs < best.executionTimeMs) {
      best = { ...best, executionTimeMs: r.executionTimeMs };
    }
  }
  return best;
}

/** Cells revealed per animation frame for a given per-step delay. */
function cellsPerFrame(ms: number): number {
  return ms > 0 ? FRAME_MS / ms : Infinity;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const stepsOf = (r: SearchResult) => (r.path.length > 0 ? r.pathCost : -1);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const gridRef = useRef<GridCanvasHandle>(null);

  // Global state
  const [snapshot, setSnapshot] = useState<GridSnapshot | null>(null);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("astar");
  const [heuristic, setHeuristic] = useState<HeuristicType>("manhattan");
  const [speedIndex, setSpeedIndex] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isOptimal, setIsOptimal] = useState<boolean | null>(null);
  const [race, setRace] = useState<RaceRow[] | null>(null);
  const [racing, setRacing] = useState<AlgorithmType | null>(null);
  const [vivaOpen, setVivaOpen] = useState(false);

  // Cancellation token: bumping it invalidates any in-flight animation loop.
  const runId = useRef(0);

  const refreshSnapshot = useCallback(() => {
    const s = gridRef.current?.getSnapshot();
    if (s) setSnapshot(s);
    return s ?? null;
  }, []);

  useEffect(() => {
    refreshSnapshot();
    const grid = gridRef.current;
    return () => {
      // runId is a plain counter, not a DOM ref: bumping it cancels loops.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      runId.current++;
      grid?.cancelPlayback();
    };
  }, [refreshSnapshot]);

  /** Stop any running animation and release the UI. */
  const cancel = useCallback(() => {
    runId.current++;
    gridRef.current?.cancelPlayback();
    setIsRunning(false);
    setRacing(null);
  }, []);

  const resetResults = useCallback(() => {
    setResult(null);
    setIsOptimal(null);
    setRace(null);
  }, []);

  /** Animate one result on the canvas. Resolves when finished or cancelled. */
  const play = useCallback(
    async (res: SearchResult) => {
      const grid = gridRef.current;
      if (!grid) return;
      const ms = SPEED_STEPS[speedIndex].ms;
      if (ms === 0) {
        grid.showResult(res);
        return;
      }
      await grid.playResult(res, { speed: cellsPerFrame(ms) });
    },
    [speedIndex],
  );

  /* ------------------------------ single run ------------------------------ */

  const handleVisualize = useCallback(async () => {
    const snap = refreshSnapshot();
    if (!snap || isRunning) return;

    const id = ++runId.current;
    setRace(null);
    const res = timedRun(algorithm, snap, heuristic);
    setResult(res);

    // Optimal iff the found cost matches BFS's (unit costs => BFS is optimal).
    if (res.path.length === 0) {
      setIsOptimal(null);
    } else if (algorithm === "gbfs") {
      setIsOptimal(res.pathCost === timedRun("bfs", snap, heuristic).pathCost);
    } else {
      setIsOptimal(true);
    }

    setIsRunning(true);
    await play(res);
    if (runId.current === id) setIsRunning(false);
  }, [algorithm, heuristic, isRunning, play, refreshSnapshot]);

  /* ------------------------------- race mode ------------------------------ */

  const handleRace = useCallback(async () => {
    const snap = refreshSnapshot();
    if (!snap || isRunning) return;

    const id = ++runId.current;
    setResult(null);
    setIsOptimal(null);

    // Compute everything up front so the table is complete and timings are
    // not polluted by animation work.
    const rows: RaceRow[] = RACE_ORDER.map((algo) => ({
      algorithm: algo,
      heuristic: algo === "bfs" ? "None (uninformed)" : HEURISTIC_LABEL[heuristic],
      result: timedRun(algo, snap, heuristic, TIMING_RUNS),
    }));
    setRace(rows);

    setIsRunning(true);
    for (const row of rows) {
      if (runId.current !== id) return;
      setRacing(row.algorithm);
      await play(row.result);
      if (runId.current !== id) return;
      await sleep(RACE_PAUSE_MS);
    }
    if (runId.current === id) {
      setRacing(null);
      setIsRunning(false);
    }
  }, [heuristic, isRunning, play, refreshSnapshot]);

  /* ------------------------------ board actions --------------------------- */

  const handleClearPath = useCallback(() => {
    cancel();
    gridRef.current?.clearSearch();
    resetResults();
  }, [cancel, resetResults]);

  const handleClearBoard = useCallback(() => {
    cancel();
    gridRef.current?.clearWalls();
    resetResults();
    refreshSnapshot();
  }, [cancel, refreshSnapshot, resetResults]);

  const handleGenerateMaze = useCallback(
    (type: MazeType) => {
      cancel();
      const walls =
        type === "recursive-division"
          ? generateRecursiveDivision(ROWS, COLS)
          : generateRandomObstacles(ROWS, COLS, 0.25);
      gridRef.current?.setWalls(walls, { replace: true });
      resetResults();
      refreshSnapshot();
    },
    [cancel, refreshSnapshot, resetResults],
  );

  const handleGridChange = useCallback(
    (s: GridSnapshot) => {
      setSnapshot(s);
      resetResults();
    },
    [resetResults],
  );

  /* -------------------------------- render -------------------------------- */

  const wallCount = snapshot
    ? snapshot.walls.reduce((n, row) => n + row.filter(Boolean).length, 0)
    : 0;

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="section-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-12 md:pt-16">
        {/* Masthead */}
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">01 — Heuristic Search Suite</p>
            <button
              type="button"
              onClick={() => setVivaOpen(true)}
              className="rounded-full border border-border bg-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:bg-border/30 hover:text-foreground"
            >
              [ ? Theory &amp; Viva Defense ]
            </button>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.75rem,6vw,5rem)] font-medium leading-[0.9] tracking-[-0.04em] text-foreground">
            Watch machines{" "}
            <span className="pr-2 font-medium italic text-secondary-accent">
              reason
            </span>{" "}
            their way to the{" "}
            <span className="font-bold text-primary">goal.</span>
          </h1>
          <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-foreground/80 md:text-[17px]">
            Draw walls, drag the markers, pick a heuristic — or race A*, BFS and
            Greedy Best-First on the same board.
          </p>
        </header>

        {/* Controls */}
        <ControlBar
          algorithm={algorithm}
          onAlgorithmChange={setAlgorithm}
          heuristic={heuristic}
          onHeuristicChange={setHeuristic}
          speedIndex={speedIndex}
          onSpeedChange={setSpeedIndex}
          onVisualize={handleVisualize}
          onClearBoard={handleClearBoard}
          onClearPath={handleClearPath}
          onGenerateMaze={handleGenerateMaze}
          isRunning={isRunning}
        />

        {/* Race / stop row */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRace}
            disabled={isRunning}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Swords size={14} />
            Race all three
          </button>
          {isRunning && (
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground/80 transition-colors hover:bg-border/30"
            >
              <OctagonX size={14} />
              Stop
            </button>
          )}
          {racing && (
            <span className="telemetry text-[12px] font-bold text-primary">
              Now running: {ALGORITHM_LABEL[racing]}
            </span>
          )}
          {snapshot && (
            <span className="telemetry ml-auto flex items-center gap-2 text-[11px] text-foreground/50">
              <Flag size={12} />
              start ({snapshot.start.join(",")}) → goal ({snapshot.goal.join(",")}) ·{" "}
              {wallCount} walls
            </span>
          )}
        </div>

        {/* Board */}
        <GridCanvas
          ref={gridRef}
          rows={ROWS}
          cols={COLS}
          disabled={isRunning}
          onChange={handleGridChange}
        />

        {/* Telemetry */}
        {!race && <MetricsHUD result={result} isOptimal={isOptimal} />}

        {race && <ComparisonTable rows={race} racing={racing} />}
      </div>

      <VivaModal open={vivaOpen} onClose={() => setVivaOpen(false)} />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison table                                                          */
/* -------------------------------------------------------------------------- */

function ComparisonTable({
  rows,
  racing,
}: {
  rows: RaceRow[];
  racing: AlgorithmType | null;
}) {
  const found = rows.filter((r) => r.result.path.length > 0).map((r) => stepsOf(r.result));
  const best = found.length ? Math.min(...found) : null;

  const th = "eyebrow px-5 py-3.5 font-bold";
  const td = "px-5 py-4";

  return (
    <section aria-label="Algorithm comparison" className="flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-border pb-3">
        <h2 className="text-3xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl">
          Head to{" "}
          <span className="pr-2 font-medium italic text-secondary-accent">head.</span>
        </h2>
        <span className="eyebrow hidden md:block">/ Comparison</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card-solid shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className={th}>Algorithm</th>
              <th className={th}>Heuristic</th>
              <th className={th}>Nodes Visited</th>
              <th className={th}>Path Length</th>
              <th className={th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ algorithm, heuristic, result }) => {
              const steps = stepsOf(result);
              const optimal = best !== null && steps === best;
              const active = racing === algorithm;
              return (
                <tr
                  key={algorithm}
                  className={`border-b border-border last:border-0 transition-colors ${
                    active ? "bg-primary-wash" : ""
                  }`}
                >
                  <td className={`${td} font-bold text-foreground`}>
                    {ALGORITHM_LABEL[algorithm]}
                  </td>
                  <td className={`${td} font-medium text-foreground/70`}>{heuristic}</td>
                  <td className={`${td} telemetry font-bold`}>
                    {result.nodesExplored.toLocaleString()}
                  </td>
                  <td className={td}>
                    {steps < 0 ? (
                      <span className="eyebrow">No path</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="telemetry font-bold">{steps}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${
                            optimal
                              ? "bg-foreground text-card"
                              : "border border-primary bg-primary/10 text-primary"
                          }`}
                        >
                          {optimal ? "Optimal" : `+${steps - (best ?? 0)}`}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className={`${td} telemetry font-bold`}>
                    {result.executionTimeMs.toFixed(2)}
                    <span className="ml-1 text-foreground/40">ms</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="eyebrow">
        Time = fastest of {TIMING_RUNS} runs · computed before animation
      </p>
    </section>
  );
}
