# Design Plan: Web-Based AI Pathfinding & Comparative Heuristic Suite
**Course Component:** Algorithmic Implementation of AI Approaches with Viva (10 Marks)  
**Evaluation Target:** 5 Marks Implementation + 5 Marks Viva Defense  
**Deployment Target:** Vercel (Production Web Application via GitHub)  

---

## 1. Project Overview & Scope
A modern, responsive, web-based visualizer and comparative benchmark engine for **Heuristic Search**. Built for deployment on **Vercel**, allowing the examiner to interact with the project directly via a live URL or local development server.

### Core Web Capabilities
* **Interactive Grid & Canvas:** Draw walls, drag Start/Goal nodes, toggle weights, and generate mazes (Recursive Division / Randomized DFS).
* **Live Algorithm Race / Side-by-Side Mode:** Run **A\***, **BFS**, and **Greedy Best-First Search** simultaneously or sequentially on identical grid states.
* **Heuristics Switcher:** Dynamic dropdown for Manhattan ($L_1$), Euclidean ($L_2$), and Chebyshev ($L_\infty$) distance metrics.
* **Real-time Telemetry Dashboard:** Live counters for Nodes Explored, Path Length, Execution Time ($\mu s / ms$), and Frontier Memory Consumption.
* **Step-by-Step Stepper & Playback Controls:** Play, pause, step forward, adjust animation speed ($1\times$ to $100\times$, or instant computation).

---

## 2. Tech Stack & Architecture

### Recommended Modern Web Stack
* **Framework:** Next.js (App Router) or Vite + React with TypeScript (strictly typed, optimal for Vercel deployment).
* **Styling & Design System:** Tailwind CSS / CSS Modules adaptable to your custom style guide (custom color palettes, typography, glassmorphism, or clean academic minimalism).
* **UI Components:** Radix UI / Shadcn primitives for accessible sliders, toggles, dropdowns, and modals.
* **Core Engine:** Pure TypeScript implementations running directly in the browser (zero server lag, zero cloud compute costs).
* **Animation & Rendering:** HTML5 Canvas or high-performance CSS Grid/DOM with `requestAnimationFrame` for silky 60 FPS search visualizations.

### Repository Structure
```text
ai-pathfinding-visualizer/
├── .github/
│   └── workflows/           # CI lint and typecheck
├── app/                     # Next.js App Router (or src/ for Vite)
│   ├── layout.tsx           # Global shell & font/style guide provider
│   ├── page.tsx             # Main dashboard & interactive canvas
│   └── globals.css          # Style guide design tokens (CSS variables)
├── components/
│   ├── visualizer/
│   │   ├── GridCanvas.tsx   # Canvas / DOM node rendering
│   │   ├── ControlBar.tsx   # Play, Pause, Clear, Maze Generator
│   │   └── MetricsHUD.tsx   # Real-time comparison cards & charts
│   └── ui/                  # Buttons, sliders, switches, tabs
├── lib/
│   ├── algorithms/
│   │   ├── astar.ts         # A* implementation with MinHeap
│   │   ├── bfs.ts           # Breadth-First Search with Queue
│   │   ├── gbfs.ts          # Greedy Best-First Search
│   │   └── types.ts         # Node, Point, SearchResult interfaces
│   ├── heuristics/
│   │   ├── manhattan.ts
│   │   ├── euclidean.ts
│   │   └── chebyshev.ts
│   ├── maze/
│   │   ├── recursiveDivision.ts
│   │   └── randomObstacles.ts
│   └── data-structures/
│       └── MinHeap.ts       # O(log N) Priority Queue for open list
├── docs/
│   ├── VIVA_CHEAT_SHEET.md  # Theory, formulas, and oral questions
│   └── STYLE_GUIDE.md       # Color tokens, fonts, spacing rules
├── vercel.json              # Vercel deployment configuration
└── package.json
```

---

## 3. Mathematical Foundations & Algorithms

### Search Formulations
| Algorithm | Evaluation Function $f(n)$ | Complete? | Optimal? | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BFS** | $d(n)$ (Uniform Step Depth) | Yes | Yes (unit cost) | $O(b^d)$ | $O(b^d)$ |
| **GBFS** | $h(n)$ | No (can loop/trap) | No | $O(b^m)$ worst | $O(b^m)$ |
| **A\*** | $g(n) + h(n)$ | Yes | Yes (if admissible) | $O(b^d)$ worst | $O(b^d)$ |

### Heuristic Distance Formulations for $(x, y) \to (x_g, y_g)$
1. **Manhattan Distance ($L_1$ Norm):**
   $$h(n) = |x - x_g| + |y - y_g|$$
   *Admissible for 4-directional movement (orthogonal).*
2. **Euclidean Distance ($L_2$ Norm):**
   $$h(n) = \sqrt{(x - x_g)^2 + (y - y_g)^2}$$
   *Admissible for orthogonal & diagonal movement; underestimates orthogonal cost.*
3. **Chebyshev Distance ($L_\infty$ Norm):**
   $$h(n) = \max(|x - x_g|, |y - y_g|)$$
   *Admissible for 8-directional movement with equal diagonal cost.*

---

## 4. Visual Identity & Editorial Grid Aesthetic (Strict 100% Light Theme)

> **Core Direction:** Strictly light theme. NO dark mode, NO neon/cyberpunk glowing colors, NO blue/purple dark backgrounds. The entire UI embodies the landing page's **warm cream/off-white architectural paper grid** aesthetic.

### 4.1 Palette & Surface Tokens
* **Canvas / Page Background:** Warm editorial sand substrate (`#f2ede9` / `#f4f3f0`).
* **Elevated Panels & Cards:** Crisp off-white / light cream paper cards (`#f5f0ea` / `#ffffff`) with delicate hairline borders (`#d1cdc6`).
* **Typography:** Deep carbon ink (`#1a1a1e`) with muted slate secondary text (`#5b6b7f`) using `Instrument Sans`.
* **Accent & Actions:** Warm Terracotta Copper (`#c5692b` / hover `#e08950`).

### 4.2 Pathfinding Grid Color Mapping (Editorial Print Style)
* **Grid Canvas:** Light cream substrate with delicate architectural hairline grid lines (`#e4dfd8`).
* **Unvisited Cells:** Clean parchment background (`transparent` / `#f2ede9`).
* **Walls:** Deep charcoal ink blocks (`#1a1a1e` / `#232326`) with crisp hairline borders.
* **Visited / Frontier Nodes:** Soft warm amber/terracotta wash (`#faece1` fading to `#f4d8c5` with soft border `#e8be9e`) — completely avoids harsh neon or cybernetic blues/purples.
* **Shortest Path:** Rich Terracotta Copper ribbon (`#c5692b`) with crisp contrast against the light paper.
* **Start Node:** Deep Forest Moss badge (`#15803d` / `#166534`).
* **Goal Node:** Bold Terracotta Target (`#c5692b` / `#9a430e`).

### 4.3 UI Controls & Metrics HUD
* Light floating control bar with subtle shadow (`0 10px 30px rgba(0, 0, 0, 0.05)`).
* Segmented pill toggles for algorithms and heuristics with ink active states.
* Micro-labels (`/ 01 METRICS`, `02 HEURISTICS`) in tracked uppercase with monospace telemetry counters (`Consolas` / `JetBrains Mono`).

---

## 5. Deployment & GitHub Workflow

### Setup Workflow
```bash
# 1. Initialize local repository
git init
git add .
git commit -m "feat: initial pathfinding suite implementation"

# 2. Push to GitHub
gh repo create ai-pathfinding-visualizer --public --source=. --push
# (or link via standard remote: git remote add origin <repo-url> && git push -u origin main)

# 3. Deploy to Vercel
# Option A: Connect repository in vercel.com dashboard (automatic CI/CD on every git push)
# Option B: Run via Vercel CLI:
vercel --prod
```

### Viva Advantage of Web Deployment
- **Instant Demonstration:** Hand the examiner a tablet, phone, or live URL.
- **Reproducibility:** Zero setup friction (no "it works on my machine" Python environment issues).
- **Embedded Viva Cheat Sheet:** A built-in modal or toggleable info drawer explaining the math and showing real-time formulas.

---

## 6. Viva Defense Cheat Sheet (Mastery Guide)

### Core Questions Examiners Ask
1. **Why does A\* guarantee shortest path while GBFS does not?**  
   *Answer:* GBFS evaluates only $h(n)$ (estimated cost to goal) and completely ignores $g(n)$ (cost already incurred). It acts greedily and can be lured into long detours. A\* minimizes $f(n) = g(n) + h(n)$, balancing current path investment with estimated remaining distance.
2. **What makes a heuristic "admissible"?**  
   *Answer:* A heuristic is admissible if it never overestimates the true cost to reach the goal ($h(n) \le h^*(n)$). If $h(n)$ overestimates, A\* may prune or postpone exploring the true shortest path.
3. **Why is Manhattan admissible for 4-way grids but inadmissible for 8-way grids?**  
   *Answer:* In 8-way movement, diagonal steps cost $1$ (or $\sqrt{2}$). Manhattan distance calculates $|dx| + |dy|$, which equals $2$ for a single diagonal step—overestimating the actual cost of $1$.
4. **What is consistency / monotonicity?**  
   *Answer:* For every node $n$ and neighbor $n'$ generated by action $a$: $h(n) \le c(n, a, n') + h(n')$. Consistency satisfies the triangle inequality and guarantees that the first time A\* expands a node, the path to it is strictly optimal.
5. **What happens when $h(n) = 0$?**  
   *Answer:* $f(n) = g(n)$, which degenerates A\* into Dijkstra's Algorithm (Uniform-Cost Search).
