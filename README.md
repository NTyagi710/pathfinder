# Pathfinder — AI Heuristic Search Visualizer


Replace `YOUR-PROJECT` with the production URL printed by `vercel --prod` before you submit. The app needs no environment variables.

A client-side visualizer for a comparative study of heuristic search on a 2D grid. Draw walls, drag the start and goal, and watch **A\***, **Breadth-First Search (BFS)**, and **Greedy Best-First Search (GBFS)** expand the same board. Switch the heuristic among Manhattan, Euclidean, and Chebyshev, or race all three algorithms and compare nodes explored, path length, and runtime.

Search runs entirely in the browser. There is no backend and no model API.

Course use: algorithmic implementation of AI search, with an in-app oral-defense sheet (**Theory & Viva Defense**).

## What you can do in the demo

- **Draw or erase walls** by clicking and dragging. Drag the green start badge or the terracotta goal badge to move them.
- **Visualize** the selected algorithm. Visited cells play back, then the path is traced. **Stop** cancels playback.
- **Speed:** Slow (50 ms/cell), Normal (20 ms), Fast (5 ms), Instant (draw the finished result immediately).
- **Generate a maze:** Recursive Division, or random obstacles at 25% density. The current start and goal cells stay open.
- **Race all three** on the current board. The table is filled before animation. Runtime is the fastest of five runs, so painting does not inflate the timing.
- **Metrics:** nodes explored, path length in steps, runtime in milliseconds, and an optimality flag.
- **Viva sheet:** the `[ ? Theory & Viva Defense ]` button opens the admissibility, consistency, and GBFS notes used in the oral.

The board is **25 rows × 45 columns** (odd sizes suit recursive division). Default markers sit on the middle row, about one quarter and three quarters of the way across: start `(12, 11)`, goal `(12, 33)`. You can drag both.

## Algorithms

Movement is **4-directional** (up, down, left, right) with **unit step cost** `c = 1`. A cell is blocked when its status is `WALL`. If the start or goal is walled, or no route exists, the search stops with an empty path and `pathCost = -1`.

Every algorithm shares this signature:

```ts
runAlgorithm(
  grid: NodeStatus[][],
  start: [number, number],
  goal: [number, number],
  heuristic: HeuristicType,
): SearchResult
```

`SearchResult` carries the reconstructed path, the chronological expansion order (`visitedOrder`, used by the animator), `nodesExplored`, `pathCost` (edges along the path, equal to `g` at the goal), and `executionTimeMs` from `performance.now()`.

Path reconstruction walks parent pointers from the goal back to the start, then reverses. BFS stores parents as grid indices; A* and GBFS store them on the node objects.

| Algorithm | Evaluation `f(n)` | Complete on this grid | Optimal here | Practical cost on `N` open cells |
| :--- | :--- | :--- | :--- | :--- |
| **BFS** | depth / `g(n)` | Yes | Yes (unit cost) | `O(N)` time and space |
| **A\*** | `g(n) + h(n)` | Yes | Yes, for all three heuristics below | `O(N log N)` with the binary heap |
| **GBFS** | `h(n)` only | Yes, because each cell is discovered once | No | `O(N log N)` with the binary heap |

In the textbook tree model the branching factor is `b ≤ 4`, BFS and A* are `O(b^d)` in the worst case (`d` = depth of the shallowest goal), and GBFS is `O(b^m)` (`m` = maximum depth). On a finite grid each implementation expands a cell at most once, so the bounds above are the ones this code actually hits.

### Heuristics

`h(n)` estimates the remaining cost from cell `(r, c)` to the goal `(r_g, c_g)`. All three are **admissible** and **consistent** for 4-way unit-cost moves, so A* is optimal for every option in the UI. Manhattan is the tightest, so A* expands the fewest nodes with it.

**Manhattan** (`L1`), the exact empty-grid distance for orthogonal moves:

$$
h(n) = |r - r_g| + |c - c_g|
$$

Each legal step changes Manhattan by exactly `1`, so `h(n) ≤ 1 + h(n')`. Walls can only make the true cost larger, so `h(n) ≤ h*(n)`.

**Euclidean** (`L2`):

$$
h(n) = \sqrt{(r - r_g)^2 + (c - c_g)^2}
$$

Implemented with `Math.hypot`. It is admissible because the straight line never exceeds a path that is forced to stay on the grid. It is a weaker guide than Manhattan: `h_euclidean ≤ h_manhattan`.

**Chebyshev** (`L∞`):

$$
h(n) = \max(|r - r_g|, |c - c_g|)
$$

Admissible here because a 4-way route needs at least `max(|Δr|, |Δc|)` steps and in fact needs `|Δr| + |Δc|`. It is the right tight heuristic for **8-way** moves of cost 1. On this 4-way board it underestimates the most.

Norm chain on this movement model (and `h*` is the true remaining cost):

$$
h_{\text{Chebyshev}} \le h_{\text{Euclidean}} \le h_{\text{Manhattan}} \le h^*(n)
$$

If `h1` and `h2` are both admissible and `h1(n) ≥ h2(n)` for every `n`, A* with `h1` never expands more nodes than A* with `h2`. That is why Manhattan wins the node count.

BFS accepts `heuristic` only to keep the shared signature and does not call it.

### A*

A* expands the open node with the smallest

$$
f(n) = g(n) + h(n)
$$

where `g(n)` is the exact cost from the start (the step count) and `h(n)` is the chosen heuristic.

The open set is a binary **min-heap** (`lib/data-structures/MinHeap.ts`). `insert` and `extractMin` are `O(log n)`. The heap orders by `f`, and breaks ties toward the smaller `h`, so equally promising nodes that look closer to the goal come out first.

There is no decrease-key. When a cheaper `g` is found, a new copy is inserted. A `bestG` table rejects any candidate that is not strictly better. After a node is expanded it is marked closed; later stale copies are skipped. That closed set is valid because every shipped heuristic is **consistent**: the first time A* expands a node, `g` is already optimal, so the node is never reopened.

`g(goal)` is the optimal path length in steps. `h(goal) = 0`, so `f(goal) = g(goal)`.

**Why the path is optimal.** Suppose A* first dequeues the goal along a path of cost `C > C*`. Some node `n` on an optimal path is still open, and admissibility gives

$$
f(n) = g^*(n) + h(n) \le C^* < C = f(\text{goal})
$$

so `n` would have been expanded before that goal. Contradiction. Hence the first time the goal is expanded, its `g` is `C*`.

If `h(n) = 0` everywhere, `f(n) = g(n)` and A* becomes uniform-cost search. With unit costs that is the same set of optimal paths BFS returns. The UI does not offer a zero heuristic; say this if an examiner asks what A* collapses to.

### BFS

BFS ignores the heuristic and expands in order of increasing depth. The queue is a flat `Int32Array` of cell indices with a head pointer, so dequeue is `O(1)` (`Array.shift` is not used). A `seen` byte marks a cell when it is enqueued, so each cell enters the queue at most once. Parents are stored in an `Int32Array` (`-1` means none). The search ends when the goal index is dequeued or the queue drains.

On a unit-cost graph the first time BFS reaches the goal, the path is a shortest path. `pathCost = path.length - 1`. The UI treats a found BFS (and A*) path as optimal, and judges GBFS by whether its `pathCost` matches BFS on the same snapshot.

### Greedy Best-First Search

GBFS orders the same min-heap by heuristic alone:

$$
f(n) = h(n)
$$

`g` is still recorded so the HUD can show the length of whatever path was found. A cell is inserted at most once, on first discovery, and that parent is never revised. The discovered-set is why the search cannot loop and why it is complete on this finite grid: if a path exists, it will be found. The path is not a shortest path, because a node that looks close to the goal can sit behind a long corridor, and the algorithm never compares that sunk cost with a longer-looking but cheaper route.

An admissible `h` does not repair this. Optimality needs `g + h` as an upper bound on total cost. GBFS throws `g` away.

On a recursive-division maze, **Race** is the demonstration: A* and BFS report the same path length; GBFS usually expands fewer nodes and often returns a longer path. The table badges the minimum length as optimal and shows the extra steps on the others.

### Priority queue

`MinHeap<T extends { f: number; h: number }>` is a binary heap with no external dependency. Comparison:

```ts
a.f < b.f || (a.f === b.f && a.h < b.h)
```

`f` and `h` must be finite. A* inserts with `f = g + h`. GBFS inserts with `f = h`.

### Mazes

Implemented in `lib/maze/generators.ts`. All of them leave `(1, 1)` and `(rows - 2, cols - 2)` unwalled. The canvas additionally refuses to paint a wall on the **current** start or goal, which may have been dragged.

- **Recursive division** (`generateRecursiveDivision`). Walls the outer ring, then repeatedly bisects a chamber with one horizontal or vertical wall and a single passage. The long axis is split; square chambers pick an axis at random. Passages stay open because the next chamber starts one cell beyond the wall.
- **Random obstacles** (`generateRandomObstacles`, default density `0.25`). Each non-terminal cell is a wall with probability `density`, clamped to `[0, 1]`.
- **Stair** (`generateStairPattern`). A diagonal obstacle course with the middle row left open. Exported for direct use; the control bar exposes Recursive Division and Random only.

## Project layout

```text
app/
  layout.tsx                      # Instrument Sans, metadata
  page.tsx                        # Board state, playback, race
  globals.css                     # Warm paper tokens
components/
  visualizer/GridCanvas.tsx       # Canvas grid, drawing, playback
  visualizer/ControlBar.tsx       # Algorithm, heuristic, speed, mazes
  visualizer/MetricsHUD.tsx       # Nodes, length, runtime, optimality
  viva/VivaModal.tsx              # Oral-defense sheet
lib/
  types.ts                        # NodeStatus, GridNode, SearchResult
  heuristics.ts                   # Manhattan, Euclidean, Chebyshev
  data-structures/MinHeap.ts
  algorithms/astar.ts
  algorithms/bfs.ts
  algorithms/gbfs.ts
  maze/generators.ts
```

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Lucide. No pathfinding dependencies.

## Local setup

Requires **Node.js 20.9 or newer** (Next.js 16) and npm.

```bash
node -v
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build, then serve it locally:

```bash
npm run build
npm run start
```

`npm run build` runs `next build`. `npm run start` serves that build. No `.env` file is required.

## Verify types, lint, and the production build

Run these from the project root, in order. Each command must exit `0`.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

| Command | What it checks | Success |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | Strict TypeScript against `tsconfig.json`. Emits no JavaScript (`noEmit` is already set). | No diagnostics, exit code 0. |
| `npm run lint` | `eslint` with `eslint.config.mjs` (Next.js core-web-vitals + TypeScript). | No errors, exit code 0. |
| `npm run build` | Production compile and prerender of `/`. Fails the process on type errors during the build. | Route table prints `/` and the process exits 0. |

`npm run lint` is a separate step. Do not treat a green `tsc` as a green lint, or a green lint as a green build.

Optional smoke test after a green build:

```bash
npm run start
```

Load [http://localhost:3000](http://localhost:3000), generate a maze, run **Visualize Path**, then **Race all three**. Stop the server with Ctrl+C.

## Publish to GitHub and Vercel

Run this from the project root in PowerShell. `.gitignore` already excludes `node_modules/`, `.next/`, `.vercel/`, and `.env*`. Do not commit secrets.

Git must already have `user.name` and `user.email` set. `gh` must be authenticated (`gh auth login`). The Vercel CLI must be authenticated (`vercel login`).

### 1. Initialize and make the first commit

Skip `git init` if a `.git` directory is already present.

```powershell
git init -b main
git add .
git status
git commit -m "feat: initial pathfinding suite implementation"
```

`git status` before the commit should list source, `package.json`, `package-lock.json`, and `README.md`. It should not list `node_modules` or `.next`.

### 2. Create the GitHub repository and push

```powershell
gh repo create ai-pathfinding-visualizer --public --source=. --remote=origin --push
```

If that name is taken, pick another and use it in the command. Equivalent manual remote:

```powershell
git remote add origin https://github.com/<your-user>/ai-pathfinding-visualizer.git
git push -u origin main
```

### 3. Deploy with the Vercel CLI

```powershell
npm install -g vercel
vercel login
vercel --prod
```

If you prefer not to install the CLI globally:

```powershell
npx vercel login
npx vercel --prod
```

On the first run, accept the defaults that match this repo:

- Set up and deploy the current directory.
- Link to an existing project: **no** (unless you already created one).
- Project name: `ai-pathfinding-visualizer` (or the GitHub repo name).
- Directory: `./`
- Framework preset: **Next.js** (auto-detected). Override settings: **no**.

Vercel uses `npm install` and `npm run build`. Leave the output directory on the Next.js default. Do not set a static `out` export. Set the Node.js version to 20.x or 22.x if the dashboard asks.

The CLI prints a production URL such as `https://ai-pathfinding-visualizer.vercel.app`. Paste that URL over the placeholder at the top of this file, then:

```powershell
git add README.md
git commit -m "docs: add Vercel production URL"
git push
```

Importing the GitHub repository in the Vercel dashboard is an alternative to the CLI. Once the project is connected to GitHub, later pushes to `main` deploy on their own. `vercel --prod` deploys the local tree immediately and is the command this submission uses.

## Viva discussion points

Short answers you should be able to give while the demo is on screen. The in-app sheet covers the same ground with the formulas written out.

1. **Why does A\* return a shortest path here, while GBFS does not?**  
   A* minimizes `f = g + h`. With an admissible `h`, the first time the goal is expanded its `g` is optimal (see the contradiction above). GBFS ranks only by `h` and keeps the first parent that discovered each cell, so a locally small `h` can commit the search to a long detour. Race a recursive-division maze: A* and BFS match on path length; GBFS often does not.

2. **What does admissible mean?**  
   `0 ≤ h(n) ≤ h*(n)` for every node, and `h(goal) = 0`. `h*` is the true cheapest cost from `n` to the goal. If `h` overestimates, A* can expand the goal along a worse path before a node on the real shortest path, because that node’s `f` was inflated. The search can still find *a* path; it just may not be a cheapest path.

3. **Why is Manhattan the right heuristic for this board?**  
   Four-way unit moves on an empty grid cost exactly `|Δr| + |Δc|`. Manhattan matches that, and walls only increase `h*`, so it never overestimates. It is also consistent: one step changes it by `1`, and the step costs `1`. Euclidean and Chebyshev stay admissible on this board but are smaller, so A* explores more. Manhattan would be **inadmissible** if diagonal steps cost `1`, because one diagonal would cover a Manhattan estimate of `2`. Chebyshev is the tight estimate for that 8-way model. This project does not offer diagonal moves.

4. **What is consistency, and why does the code rely on it?**  
   For every node `n` and neighbor `n'`, `h(n) ≤ c(n, n') + h(n')`. With `c = 1` that is `h(n) ≤ 1 + h(n')`. Consistent implies admissible. Along a path, `f` is non-decreasing, so the first expansion of a node has the optimal `g`. That is why `astar.ts` can close a node forever and ignore stale heap copies instead of reopening it. Manhattan, Euclidean, and Chebyshev all satisfy this for orthogonal unit-cost steps.

5. **What are the completeness and complexity claims you should defend?**  
   The grid is finite and every algorithm refuses to expand a wall or revisit a settled cell, so all three terminate even when the goal is sealed off. BFS is optimal only because every edge costs `1`; a weighted board would need uniform-cost search or A*. GBFS is complete here because of the discovered-set; in an infinite state space, pure greedy search need not be. Time: BFS is linear in the number of cells reached; A* and GBFS add a `log N` heap factor. Space is proportional to the cells retained in the queue or heap, which is `O(N)` on this board. The classical `O(b^d)` and `O(b^m)` bounds are the tree-search statements of the same algorithms with `b ≤ 4`.

6. **What does the optimality badge mean in the UI?**  
   A found A* or BFS path is marked optimal. A found GBFS path is marked optimal only when its step count equals a BFS run on the same walls, start, and goal. “No path” leaves the flag unset. Race mode marks the shortest length among the three rows and prints the surplus steps on the longer ones.

7. **What should you say about the implementation details if asked?**  
   Open set: binary heap, tie-break on `h`, no decrease-key. BFS queue: index array plus head pointer. Timing: `performance.now()` around the search only; race mode keeps the best of five runs and only then animates. Parent pointers rebuild the path. `pathCost` is the number of steps, or `-1` when the path list is empty.
