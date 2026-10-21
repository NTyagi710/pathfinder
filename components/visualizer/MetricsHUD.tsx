"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock, Footprints, Network, TriangleAlert } from "lucide-react";
import type { SearchResult } from "@/lib/types";

export interface MetricsHUDProps {
  /** Null before any search has run. */
  result: SearchResult | null;
  /**
   * Whether the algorithm guarantees/found an optimal path.
   * null = unknown (no result yet, or no path found).
   */
  isOptimal: boolean | null;
}

const MONO = 'font-["Consolas","Courier_New",monospace]';

function StatCard({
  index,
  label,
  icon,
  children,
  footnote,
}: {
  index: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
  footnote?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[#d1cdc6] bg-gradient-to-b from-white to-[#f5f0ea] p-5 shadow-[0_10px_30px_hsl(240_5%_50%/0.12)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d1cdc6] bg-white text-[#1a1a1e]/60">
          {icon}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1e]/50 md:text-[10px]">
          {index} {label}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {children}
        {footnote && (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1e]/40">
            {footnote}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MetricsHUD({ result, isOptimal }: MetricsHUDProps) {
  const noPath = result !== null && result.path.length === 0;
  const dash = "—";

  const nodes = result ? result.nodesExplored.toLocaleString() : dash;
  // Steps = edges in path (nodes - 1).
  const steps = result && !noPath ? String(result.path.length - 1) : dash;
  const runtime = result ? result.executionTimeMs.toFixed(2) : dash;

  const numberClass = `${MONO} text-4xl font-bold tabular-nums tracking-tight text-[#1a1a1e]`;

  return (
    <section
      aria-label="Search metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <StatCard
        index="/ 01"
        label="Metrics"
        icon={<Network size={18} />}
        footnote="Nodes Explored"
      >
        <span className={numberClass}>{nodes}</span>
      </StatCard>

      <StatCard
        index="02"
        label="Path"
        icon={<Footprints size={18} />}
        footnote={noPath ? "No path found" : "Path Length (steps)"}
      >
        <span className={numberClass}>{steps}</span>
      </StatCard>

      <StatCard
        index="03"
        label="Runtime"
        icon={<Clock size={18} />}
        footnote="Execution Time"
      >
        <span className={numberClass}>
          {runtime}
          {result && (
            <span className="ml-1.5 text-base font-bold text-[#1a1a1e]/40">ms</span>
          )}
        </span>
      </StatCard>

      <StatCard
        index="04"
        label="Optimality"
        icon={
          isOptimal === false ? <TriangleAlert size={18} /> : <CheckCircle2 size={18} />
        }
        footnote="Path Quality"
      >
        {isOptimal === null ? (
          <span className={numberClass}>{dash}</span>
        ) : (
          <span
            className={`${MONO} inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-widest ${
              isOptimal
                ? "bg-[#1a1a1e] text-[#f5f0ea]"
                : "border border-[#c5692b] bg-[#c5692b]/10 text-[#c5692b]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOptimal ? "bg-[#10b981]" : "bg-[#c5692b]"
              }`}
            />
            {isOptimal ? "Optimal" : "Suboptimal"}
          </span>
        )}
      </StatCard>
    </section>
  );
}
