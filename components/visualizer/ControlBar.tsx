"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Eraser,
  Gauge,
  Play,
  RotateCcw,
  Route,
  Shuffle,
  LayoutGrid,
} from "lucide-react";
import type { HeuristicType } from "@/lib/types";

export type AlgorithmType = "astar" | "bfs" | "gbfs";
export type MazeType = "recursive-division" | "random";

/** Delay per animation step in ms. 0 = instant. */
export const SPEED_STEPS = [
  { label: "Slow", ms: 50 },
  { label: "Normal", ms: 20 },
  { label: "Fast", ms: 5 },
  { label: "Instant", ms: 0 },
] as const;

const ALGORITHMS: { value: AlgorithmType; label: string }[] = [
  { value: "astar", label: "A*" },
  { value: "bfs", label: "BFS" },
  { value: "gbfs", label: "Greedy Best-First" },
];

const HEURISTICS: { value: HeuristicType; label: string }[] = [
  { value: "manhattan", label: "Manhattan" },
  { value: "euclidean", label: "Euclidean" },
  { value: "chebyshev", label: "Chebyshev" },
];

const MAZES: { value: MazeType; label: string }[] = [
  { value: "recursive-division", label: "Recursive Division" },
  { value: "random", label: "Random" },
];

export interface ControlBarProps {
  algorithm: AlgorithmType;
  onAlgorithmChange: (a: AlgorithmType) => void;
  heuristic: HeuristicType;
  onHeuristicChange: (h: HeuristicType) => void;
  /** Index into SPEED_STEPS (0-3). */
  speedIndex: number;
  onSpeedChange: (index: number) => void;
  onVisualize: () => void;
  onClearBoard: () => void;
  onClearPath: () => void;
  onGenerateMaze: (type: MazeType) => void;
  /** Disables controls while a search is animating. */
  isRunning?: boolean;
}

const eyebrow =
  "text-[9px] md:text-[10px] font-bold text-[#1a1a1e]/50 tracking-[0.2em] uppercase";

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
  disabled,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-[#d1cdc6] bg-white p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-[#1a1a1e] text-[#f5f0ea]"
                : "text-[#1a1a1e]/70 hover:bg-[#1a1a1e]/5"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MazeDropdown({
  onSelect,
  disabled,
}: {
  onSelect: (t: MazeType) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-[#d1cdc6] bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1a1a1e]/80 transition-colors hover:bg-[#d1cdc6]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Shuffle size={14} />
        Generate Maze
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 min-w-full overflow-hidden rounded-2xl border border-[#d1cdc6] bg-white p-1 shadow-[0_10px_30px_hsl(240_5%_50%/0.12)]"
        >
          {MAZES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect(m.value);
              }}
              className="flex w-full items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-[#1a1a1e]/80 transition-colors hover:bg-[#1a1a1e] hover:text-[#f5f0ea]"
            >
              {m.value === "random" ? (
                <Shuffle size={13} />
              ) : (
                <LayoutGrid size={13} />
              )}
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ControlBar({
  algorithm,
  onAlgorithmChange,
  heuristic,
  onHeuristicChange,
  speedIndex,
  onSpeedChange,
  onVisualize,
  onClearBoard,
  onClearPath,
  onGenerateMaze,
  isRunning = false,
}: ControlBarProps) {
  const usesHeuristic = algorithm === "astar" || algorithm === "gbfs";
  const speed = SPEED_STEPS[speedIndex] ?? SPEED_STEPS[1];

  return (
    <section
      aria-label="Pathfinding controls"
      className="rounded-3xl border border-[#d1cdc6] bg-gradient-to-b from-white to-[#f5f0ea] p-5 shadow-[0_10px_30px_hsl(240_5%_50%/0.12)] md:p-6"
    >
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
        {/* 01 Algorithm */}
        <div className="flex flex-col gap-2.5">
          <span className={eyebrow}>/ 01 Algorithm</span>
          <SegmentedPill
            label="Algorithm"
            options={ALGORITHMS}
            value={algorithm}
            onChange={onAlgorithmChange}
            disabled={isRunning}
          />
        </div>

        {/* 02 Heuristic */}
        {usesHeuristic && (
          <div className="flex flex-col gap-2.5">
            <span className={eyebrow}>02 Heuristic</span>
            <SegmentedPill
              label="Heuristic"
              options={HEURISTICS}
              value={heuristic}
              onChange={onHeuristicChange}
              disabled={isRunning}
            />
          </div>
        )}

        {/* 03 Speed */}
        <div className="flex min-w-[220px] flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className={eyebrow}>03 Speed</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#1a1a1e]">
              <Gauge size={13} className="text-[#c5692b]" />
              {speed.label}
              <span className="text-[#1a1a1e]/40">
                {speed.ms > 0 ? `${speed.ms}ms` : "0ms"}
              </span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={SPEED_STEPS.length - 1}
            step={1}
            value={speedIndex}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            aria-label="Animation speed"
            aria-valuetext={`${speed.label}${speed.ms ? `, ${speed.ms} milliseconds` : ""}`}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#d1cdc6] accent-[#1a1a1e]"
          />
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1e]/40">
            {SPEED_STEPS.map((s) => (
              <span key={s.label}>{s.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 04 Actions */}
      <div className="mt-5 flex flex-col gap-2.5 border-t border-[#d1cdc6] pt-5">
        <span className={eyebrow}>04 Actions</span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onVisualize}
            disabled={isRunning}
            className="group inline-flex items-center gap-2 rounded-full bg-[#1a1a1e] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#f5f0ea] transition-all hover:bg-[#d97736] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#1a1a1e]"
          >
            <Play size={14} className="fill-current" />
            Visualize Path
          </button>

          <button
            type="button"
            onClick={onClearPath}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-full border border-[#d1cdc6] bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1a1a1e]/80 transition-colors hover:bg-[#d1cdc6]/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Route size={14} />
            Clear Path
          </button>

          <button
            type="button"
            onClick={onClearBoard}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-full border border-[#d1cdc6] bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1a1a1e]/80 transition-colors hover:bg-[#d1cdc6]/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eraser size={14} />
            Clear Board
          </button>

          <MazeDropdown onSelect={onGenerateMaze} disabled={isRunning} />

          {isRunning && (
            <span className="ml-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5692b]">
              <RotateCcw size={12} className="animate-spin" />
              Running
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
