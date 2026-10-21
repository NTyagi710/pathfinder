"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export interface VivaModalProps {
  open: boolean;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Typographic helpers                                                       */
/* -------------------------------------------------------------------------- */

/** Inline math in the editorial mono voice. */
function M({ children }: { children: ReactNode }) {
  return (
    <span className="telemetry whitespace-nowrap rounded-md border border-border bg-white px-1.5 py-0.5 text-[0.92em] text-foreground">
      {children}
    </span>
  );
}

/** Display equation: a ruled block, centred, like a printed theorem. */
function Equation({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="my-5 border-y border-foreground/80 py-4 text-center">
      <div className="telemetry text-lg text-foreground md:text-xl">{children}</div>
      <figcaption className="eyebrow mt-2">{label}</figcaption>
    </figure>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8">
      <p className="eyebrow">{index}</p>
      <h3 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight text-foreground md:text-4xl">
        {title}
      </h3>
      <div className="mt-5 space-y-4 text-[15px] font-medium leading-relaxed text-foreground/80">
        {children}
      </div>
    </section>
  );
}

const Em = ({ children }: { children: ReactNode }) => (
  <span className="pr-1 font-medium italic text-secondary-accent">{children}</span>
);

function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside className="rounded-2xl border border-border bg-card-solid p-5">
      <p className="eyebrow text-primary" style={{ color: "var(--primary)" }}>
        {label}
      </p>
      <div className="mt-2 text-[14px] font-medium leading-relaxed text-foreground/80">
        {children}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal / drawer                                                            */
/* -------------------------------------------------------------------------- */

export default function VivaModal({ open, onClose }: VivaModalProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Minimal focus trap.
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close Viva notes"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-[2px]"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="viva-title"
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-background shadow-[-10px_0_40px_rgba(0,0,0,0.12)]"
      >
        <div className="section-grid" aria-hidden="true" />

        {/* Masthead */}
        <header className="relative z-10 flex items-start justify-between gap-6 border-b border-foreground px-8 pb-5 pt-8">
          <div>
            <p className="eyebrow">Examiner Oral Defense — Cheat Sheet</p>
            <h2
              id="viva-title"
              className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-foreground md:text-5xl"
            >
              Theory &amp; <Em>viva</Em> defense.
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card-solid text-foreground/70 transition-colors hover:bg-foreground hover:text-background"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable article */}
        <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-16 pt-8">
          <article className="space-y-10">
            <p className="text-xl font-medium italic leading-relaxed text-foreground/80">
              “A heuristic that never overestimates is a promise the algorithm
              can keep.”
            </p>

            {/* 01 — Admissibility */}
            <Section index="01 — Admissibility" title={<>Never <Em>overestimate.</Em></>}>
              <p>
                A heuristic <M><i>h</i>(<i>n</i>)</M> is <b>admissible</b> if it
                never exceeds the true remaining cost <M><i>h</i>*(<i>n</i>)</M>{" "}
                from <M><i>n</i></M> to the goal.
              </p>
              <Equation label="Admissibility condition">
                0 ≤ <i>h</i>(<i>n</i>) ≤ <i>h</i>*(<i>n</i>) &nbsp; ∀ <i>n</i>
                &nbsp;&nbsp;·&nbsp;&nbsp; <i>h</i>(goal) = 0
              </Equation>
              <p>
                <b>Why it gives optimality.</b> A* pops the node with the lowest{" "}
                <M><i>f</i> = <i>g</i> + <i>h</i></M>. Suppose it pops the goal via
                a suboptimal path of cost <M><i>C</i> &gt; <i>C</i>*</M>. Some
                node <M><i>n</i></M> on the optimal path is still in the open
                list, and by admissibility{" "}
                <M><i>f</i>(<i>n</i>) = <i>g</i>*(<i>n</i>) + <i>h</i>(<i>n</i>) ≤ <i>C</i>*</M>{" "}
                <M>&lt; <i>C</i></M>. So <M><i>n</i></M> would have been expanded
                first — contradiction.
              </p>
              <Callout label="Examiner may ask">
                “What if <i>h</i> is inadmissible?” — A* stays complete but may
                return a suboptimal path, because an overestimate can bury a node
                on the optimal route behind worse ones.
              </Callout>
            </Section>

            {/* 02 — Consistency */}
            <Section index="02 — Consistency" title={<>The triangle <Em>inequality.</Em></>}>
              <p>
                A heuristic is <b>consistent</b> (monotone) if the estimate at a
                node is no more than the step cost to a neighbour plus that
                neighbour’s estimate.
              </p>
              <Equation label="Consistency · triangle inequality">
                <i>h</i>(<i>n</i>) ≤ <i>c</i>(<i>n</i>, <i>n′</i>) + <i>h</i>(<i>n′</i>)
              </Equation>
              <p>
                On our unit-cost grid, <M><i>c</i> = 1</M>, so this reads{" "}
                <M><i>h</i>(<i>n</i>) ≤ 1 + <i>h</i>(<i>n′</i>)</M>: moving one
                cell can lower the estimate by at most one.
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                <li>
                  <b>Consistent ⇒ admissible</b> (induct back from{" "}
                  <M><i>h</i>(goal) = 0</M>). The converse is not guaranteed.
                </li>
                <li>
                  Along any path, <M><i>f</i></M> is <b>non-decreasing</b>:{" "}
                  <M><i>f</i>(<i>n′</i>) = <i>g</i>(<i>n</i>) + <i>c</i> + <i>h</i>(<i>n′</i>) ≥ <i>f</i>(<i>n</i>)</M>.
                </li>
                <li>
                  So the first time a node is expanded, its <M><i>g</i></M> is
                  already optimal — it never needs re-opening. This is why our
                  A* can keep a simple closed set and skip stale heap entries.
                </li>
              </ul>
            </Section>

            {/* 03 — Manhattan */}
            <Section index="03 — Choosing h" title={<>Why <Em>Manhattan</Em> for 4-way moves.</>}>
              <p>
                With only up / down / left / right moves at unit cost, the
                shortest route on an empty grid is exactly the number of row
                steps plus column steps.
              </p>
              <Equation label="Manhattan distance">
                <i>h</i>(<i>n</i>) = |<i>r</i> − <i>r</i><sub>g</sub>| + |<i>c</i> − <i>c</i><sub>g</sub>|
              </Equation>
              <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                <li>
                  <b>Admissible and consistent.</b> Walls can only lengthen the
                  real route, so <M><i>h</i>*</M> ≥ Manhattan always holds. Each
                  step changes Manhattan by exactly ±1.
                </li>
                <li>
                  <b>Tightest of the three.</b>{" "}
                  <M>Chebyshev ≤ Euclidean ≤ Manhattan ≤ <i>h</i>*</M>. If{" "}
                  <M><i>h</i><sub>1</sub> ≥ <i>h</i><sub>2</sub></M> are both
                  admissible, A* with <M><i>h</i><sub>1</sub></M> expands no more
                  nodes. Euclidean and Chebyshev are safe but weaker, so they
                  explore more.
                </li>
                <li>
                  <b>Wrong tool for 8-way moves.</b> With diagonal steps at cost
                  1, Manhattan <i>overestimates</i> (a diagonal covers two units
                  in one move) and breaks admissibility. Chebyshev is the tight
                  heuristic there.
                </li>
              </ul>
            </Section>

            {/* 04 — GBFS */}
            <Section index="04 — Greedy search" title={<>Why GBFS is <Em>not optimal.</Em></>}>
              <Equation label="Evaluation functions">
                A*: <i>f</i> = <i>g</i> + <i>h</i> &nbsp;·&nbsp; GBFS: <i>f</i> = <i>h</i> &nbsp;·&nbsp; BFS: <i>f</i> = depth
              </Equation>
              <p>
                Greedy Best-First ranks nodes by <M><i>h</i>(<i>n</i>)</M> alone.
                It never looks at <M><i>g</i>(<i>n</i>)</M>, the cost already
                paid, so nothing ties its answer to the cheapest route.
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                <li>
                  It chases whatever looks <i>closest</i> to the goal, and a wall
                  can make “closest” a dead end. After backing out it commits to
                  the <b>first</b> parent that discovered each cell, not the
                  best one.
                </li>
                <li>
                  Even an admissible, consistent <M><i>h</i></M> does not help:
                  optimality comes from <M><i>g</i> + <i>h</i></M> bounding the
                  total cost, and GBFS discards <M><i>g</i></M>.
                </li>
                <li>
                  Trade-off: usually far fewer nodes expanded than A*, but a
                  longer path. Complete on a finite grid with a closed set;
                  worst-case time and space{" "}
                  <M><i>O</i>(<i>b</i><sup><i>m</i></sup>)</M>.
                </li>
              </ul>
              <Callout label="Prove it live">
                Generate a Recursive Division maze, then run <b>Race</b>. A* and
                BFS report the same minimum path length; GBFS visits fewer nodes
                but often returns a longer path. The comparison table flags it.
              </Callout>
            </Section>

            {/* Summary table */}
            <section className="border-t border-border pt-8">
              <p className="eyebrow">05 — At a glance</p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card-solid">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      {["Algorithm", "f(n)", "Complete", "Optimal"].map((h) => (
                        <th key={h} className="eyebrow px-4 py-3 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-medium text-foreground/80">
                    {[
                      ["A*", "g + h", "Yes", "If h admissible"],
                      ["BFS", "depth", "Yes", "Unit cost only"],
                      ["GBFS", "h", "Yes (finite, closed set)", "No"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-bold text-foreground">{row[0]}</td>
                        <td className="telemetry px-4 py-3">{row[1]}</td>
                        <td className="px-4 py-3">{row[2]}</td>
                        <td className="px-4 py-3">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>
        </div>
      </aside>
    </div>
  );
}
