# Multi-Model Execution Blueprint & Chat Prompts

This guide divides the implementation of the **Comparative AI Pathfinding Suite** across isolated, token-efficient chat sessions. It pairs tasks strategically between your **High-Capability Model (Claude Sonnet)** for architecture and complex algorithms, and your **Workhorse Model (Grok)** for modular components, data structures, and styling.

---

## Model Allocation Strategy

| Chat # | Phase | Model | Token Strategy | Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Chat 1** | Foundation & Theme Shell | **Claude Sonnet** | Fresh Chat | Next.js setup, Tailwind tokens, Warm Paper layout |
| **Chat 2** | Priority Queue & Heuristics | **Grok** | Fresh Chat | `MinHeap`, Types, Manhattan/Euclid/Chebyshev |
| **Chat 3** | Search Algorithms Engine | **Claude Sonnet** | Fresh Chat | A\*, BFS, GBFS with step generator for 60fps |
| **Chat 4** | Maze Generators | **Grok** | Fresh Chat | Recursive Division & Random Obstacle patterns |
| **Chat 5** | Interactive Grid Canvas | **Claude Sonnet** | Fresh Chat | Mouse-drawing, node state rendering, animations |
| **Chat 6** | Control Bar & Telemetry HUD | **Grok** | Fresh Chat | Sliders, pill toggles, metric cards |
| **Chat 7** | Page Assembly & Viva Modal | **Claude Sonnet** | Fresh Chat | State orchestration, Viva cheat sheet drawer |
| **Chat 8** | Build & Vercel Deployment | **Grok** | Fresh Chat | Typecheck, README, Git & Vercel push prep |

---

## Session 1: Project Foundation & Editorial Light Theme Setup
* **Assigned Model:** **Claude Sonnet**
* **Context Files to Attach:**
  * `STYLE_GUIDE.md`
  * `design_plan.md` (Sections 1, 2, 4 only)

### Prompt:
```markdown
You are an expert Next.js and frontend architect. We are building a client-side AI Pathfinding & Comparative Heuristic Search visualizer for deployment on Vercel.

Read the attached STYLE_GUIDE.md carefully. We strictly require the 100% Light Editorial Paper Grid aesthetic (warm sand/cream background `#f2ede9`, dark charcoal ink `#1a1a1e`, terracotta copper accents `#c5692b`, and `Instrument Sans` font). Under NO circumstances use dark mode, neon, or cybernetic glows.

Your Task:
1. Provide the exact commands to scaffold a Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons) project inside the current directory.
2. Provide `app/globals.css` configured with our complete design tokens, font imports, and clean background architectural grid line pattern.
3. Provide `app/layout.tsx` with proper metadata and typography setup.
4. Provide a placeholder `app/page.tsx` verifying that the warm sand background and typographic hierarchy render correctly.

Output only production-ready code files and precise setup commands.
```

---

## Session 2: Core Data Structures & Heuristic Functions
* **Assigned Model:** **Grok**
* **Context Files to Attach:**
  * `design_plan.md` (Section 3 only)

### Prompt:
```markdown
You are an algorithm engineer working in TypeScript. We are building an AI pathfinding suite comparing A*, BFS, and Greedy Best-First Search.

Your Task:
1. Create `lib/types.ts`:
   - Node status: 'EMPTY' | 'WALL' | 'START' | 'GOAL' | 'VISITED' | 'FRONTIER' | 'PATH'
   - `GridNode`: { row: number, col: number, status: NodeStatus, g: number, h: number, f: number, parent: GridNode | null }
   - `SearchResult`: { path: [number, number][], visitedOrder: [number, number][], nodesExplored: number, pathCost: number, executionTimeMs: number }
   - `HeuristicType`: 'manhattan' | 'euclidean' | 'chebyshev'
2. Create `lib/data-structures/MinHeap.ts`:
   - High-performance binary Min-Heap priority queue supporting `insert`, `extractMin`, `isEmpty`, and `size`. Compare nodes based on property `f` (with tie-breaker on `h`).
3. Create `lib/heuristics.ts`:
   - Manhattan Distance: |r1 - r2| + |c1 - c2|
   - Euclidean Distance: Math.hypot(r1 - r2, c1 - c2)
   - Chebyshev Distance: Math.max(|r1 - r2|, |c1 - c2|)
   - Dispatcher function `calculateHeuristic(type, r1, c1, r2, c2): number`

Output strictly pure, robust TypeScript with zero external dependencies.
```

---

## Session 3: Search Algorithms Engine (A*, BFS, GBFS)
* **Assigned Model:** **Claude Sonnet**
* **Context Files to Attach:**
  * `design_plan.md` (Section 3 & 4.2)
  * `lib/types.ts` (generated in Session 2)
  * `lib/data-structures/MinHeap.ts` (generated in Session 2)
  * `lib/heuristics.ts` (generated in Session 2)

### Prompt:
```markdown
You are a senior AI algorithm specialist. We need the search engine for our pathfinding suite comparing A*, BFS, and Greedy Best-First Search on a 2D grid.

Requirements:
1. Each algorithm must share a unified execution signature:
   `runAlgorithm(grid: NodeStatus[][], start: [number, number], goal: [number, number], heuristic: HeuristicType): SearchResult`
2. Implement:
   - `lib/algorithms/astar.ts`: A* minimizing f(n) = g(n) + h(n) using our MinHeap.
   - `lib/algorithms/bfs.ts`: Uninformed Breadth-First Search using a double-pointer or queue for O(1) dequeue operations.
   - `lib/algorithms/gbfs.ts`: Greedy Best-First Search prioritizing solely h(n).
3. Critical details:
   - 4-directional cardinal movement (Up, Down, Left, Right).
   - Track chronological `visitedOrder` array (for visualization step animation) and reconstruct the final optimal path via parent pointers.
   - Track precise execution time using `performance.now()`.
   - Prevent infinite loops if goal is unreachable.

Provide fully typed, self-contained files.
```

---

## Session 4: Procedural Maze Generators
* **Assigned Model:** **Grok**
* **Context Files to Attach:**
  * `lib/types.ts`

### Prompt:
```markdown
You are a game programmer and algorithm specialist. We need maze generation utilities for our 2D pathfinding grid.

Your Task:
Create `lib/maze/generators.ts` exporting:
1. `generateRecursiveDivision(rows: number, cols: number): [number, number][]`
   - Classic Recursive Division algorithm that adds horizontal and vertical wall chambers with random single-tile passages. Returns an array of wall coordinates `[row, col]`.
2. `generateRandomObstacles(rows: number, cols: number, density?: number): [number, number][]`
   - Generates scattered obstacles with default 25% density.
3. `generateStairPattern(rows: number, cols: number): [number, number][]`
   - Generates a diagonal obstacle course testing diagonal avoidance.

Ensure no walls are placed on the default start `[1, 1]` or goal `[rows - 2, cols - 2]`. Provide pure, fully typed TypeScript code.
```

---

## Session 5: Interactive Grid Canvas Component
* **Assigned Model:** **Claude Sonnet**
* **Context Files to Attach:**
  * `STYLE_GUIDE.md`
  * `lib/types.ts`
  * `design_plan.md` (Section 4.2: Grid Color Mapping)

### Prompt:
```markdown
You are a senior React UI engineer. We need the interactive grid canvas component `components/visualizer/GridCanvas.tsx`.

Aesthetic & Behavioral Requirements:
1. Must adhere strictly to the Light Editorial Paper Grid theme:
   - Substrate: `#f2ede9`
   - Grid lines: hairline `#e4dfd8`
   - Empty cell: transparent
   - Walls: Charcoal Ink `#1a1a1e`
   - Start Node: Forest Moss `#15803d`
   - Goal Node: Terracotta `#c5692b`
   - Visited Cells: soft warm amber/terracotta wash (`#faece1` to `#f4d8c5`) with gentle scale-in animation.
   - Final Path: rich Terracotta Copper ribbon (`#c5692b`).
2. Interaction:
   - Click + drag to draw walls or erase walls.
   - Click + drag Start or Goal node to reposition them dynamically.
3. Responsive sizing: Render a clean 25x45 (or configurable) grid that fits comfortably within a desktop browser window without horizontal overflow.
4. High performance: Avoid re-rendering all cells on every mousemove. Use clean state boundaries or canvas/DOM ref optimizations.

Provide the complete `GridCanvas.tsx` component.
```

---

## Session 6: Control Bar & Telemetry HUD Components
* **Assigned Model:** **Grok**
* **Context Files to Attach:**
  * `STYLE_GUIDE.md`
  * `lib/types.ts`

### Prompt:
```markdown
You are a frontend developer specializing in Tailwind and UI components. We need the controls and telemetry dashboard for our AI Pathfinding Visualizer.

Aesthetic Guidelines:
- Light cream elevated card containers (`#ffffff` / `#f5f0ea`) with hairline borders (`#d1cdc6`).
- Pill toggles with deep charcoal ink active states.
- Micro-labels (`/ 01 METRICS`, `02 HEURISTIC`) in uppercase tracking.

Tasks:
1. Create `components/visualizer/ControlBar.tsx`:
   - Algorithm Selector: A* / BFS / Greedy Best-First (segmented pill control).
   - Heuristic Selector: Manhattan / Euclidean / Chebyshev (visible when A* or GBFS is selected).
   - Action buttons: "Visualize Path", "Clear Board", "Clear Path", "Generate Maze" (dropdown: Recursive Division, Random).
   - Speed Slider: Slow (50ms) -> Normal (20ms) -> Fast (5ms) -> Instant.
2. Create `components/visualizer/MetricsHUD.tsx`:
   - 4 metric stat cards:
     1. Nodes Explored (count)
     2. Path Length (steps)
     3. Runtime (`X.XX ms`)
     4. Optimality status (Optimal vs Suboptimal)
   - Monospace telemetry numbers (`Consolas` / `Courier New`).

Provide both complete, self-contained TypeScript components with Lucide icons.
```

---

## Session 7: Page Orchestration, Side-by-Side Comparison & Viva Modal
* **Assigned Model:** **Claude Sonnet**
* **Context Files to Attach:**
  * `STYLE_GUIDE.md`
  * `design_plan.md` (Sections 1, 4, 6)
  * All generated components from Sessions 2–6

### Prompt:
```markdown
You are the lead architect. We need to tie the entire visualizer together in `app/page.tsx` and add the Examiner Oral Defense (Viva) Cheat Sheet modal.

Requirements:
1. `app/page.tsx`:
   - Manage global state: grid matrix, start/goal coordinates, visualizer running status, animation loop timer / cancellation.
   - Animation player: animate `visitedOrder` step-by-step at the selected speed, followed by the path trace.
   - Race / Comparative Mode: A button to run all 3 algorithms (A*, BFS, GBFS) sequentially or side-by-side on the current maze and display a side-by-side comparison table showing:
     | Algorithm | Heuristic | Nodes Visited | Path Length | Time |
2. Viva Cheat Sheet Modal / Drawer (`components/viva/VivaModal.tsx`):
   - Triggered by a discreet button: `[ ? Theory & Viva Defense ]`.
   - Explains: Admissibility condition ($h \le h^*$), Consistency triangle inequality, Why Manhattan for 4-way, and why GBFS is not optimal.
   - Clean editorial print layout matching our warm sand style guide.

Provide `app/page.tsx` and `components/viva/VivaModal.tsx`.
```

---

## Session 8: Build Verification, README & Vercel Push
* **Assigned Model:** **Grok**
* **Context Files to Attach:**
  * `package.json`
  * `design_plan.md` (Section 5)

### Prompt:
```markdown
You are a DevOps and release engineer. We need to prepare this pathfinding project for submission, GitHub publishing, and Vercel deployment.

Your Task:
1. Provide a comprehensive `README.md`:
   - Project overview and live Vercel demo link placeholder.
   - Algorithms implemented and mathematical breakdown.
   - Local setup instructions (`npm install`, `npm run dev`, `npm run build`).
   - Viva discussion points summary.
2. Provide exact verification commands to test TypeScript types, linting, and Next.js static build without runtime errors.
3. Provide the step-by-step Git commands to initialize the repo, push to GitHub, and deploy via Vercel CLI (`vercel --prod`).

Output the complete `README.md` and terminal command checklist.
```
