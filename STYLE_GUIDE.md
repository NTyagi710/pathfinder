# HireLoop Design System & UI Style Guide

This style guide is an exhaustive specification of the visual language, typography, color palette, atmospheric effects, layout structures, and component recipes used on the **HireLoop** landing page. It is structured so that any LLM or developer can replicate this aesthetic identically in a new project.

---

## 1. Aesthetic Identity & Design Philosophy

HireLoop combines **Warm Tactile Editorial SaaS** with **High-Contrast Typographic Modernism**:
1. **Warm Paper Substrate**: Instead of sterile cold white (`#ffffff`) or generic gray, the foundation is a tactile, warm beige/sand background (`#f2ede9` / `#f4f3f0`) layered with film grain and fine architectural grid lines.
2. **Extreme Typographic Hierarchy**: Ultra-heavy, tight-tracked sans-serif display typography juxtaposed with delicate, colored, italic serif/sans emphasis spans in the same sentence.
3. **High-Contrast Dark Monoliths**: On top of the warm paper background, primary feature cards and hero tiers use dense obsidian dark cards (`#18181b`) with faint border glows and colored ambient hover blooms.
4. **Curated Dual-Accent Palette**:
   - **Copper / Terracotta** (`#c5692b` / `#e08950`): For action triggers, conversion CTAs, and energetic highlights.
   - **Imperial Plum / Royal Violet** (`#3a2b6b` / `#3b2d59` / `#7f63b8`): For conceptual weight, gigantic decorative numbering, and editorial accents.
5. **Micro-Architecture**: Micro-labels, numbering (`/ 01`, `01 — The Workflow`), and metadata are styled in tiny, uppercase text with wide tracking (`0.2em` to `0.25em`).

---

## 2. Color System & Design Tokens

### 2.1 CSS Variables & Palette Tokens

```css
:root {
  /* Canvas & Surfaces */
  --background: #f2ede9;       /* Warm editorial paper / sand background */
  --card-bg: #f5f0ea;          /* Elevated light card surface */
  --foreground: #1a1a1e;       /* Primary deep ink text */
  --border-color: #d1cdc6;     /* Subtle warm hairline border */
  --muted-text: #5b6b7f;       /* Secondary neutral text */

  /* Dark Monolith Cards */
  --dark-card: #18181b;        /* Charcoal obsidian card fill */
  --dark-text: #fafafa;        /* Off-white text for dark cards */
  --dark-border: rgba(255, 255, 255, 0.08);

  /* Primary Accent: Terracotta Copper */
  --primary: #c5692b;          /* Base copper */
  --primary-light: #e08950;    /* Gradient highlight copper */
  --primary-deep: #b35d24;     /* Shadow / bevel border copper */
  --primary-glow: rgba(197, 105, 43, 0.2);

  /* Secondary Accent: Imperial Plum / Violet */
  --secondary: #3a2b6b;        /* Deep plum (light mode) */
  --secondary-muted: #3b2d59;  /* Rich purple headline accent */
  --secondary-light: #7f63b8;  /* Vibrant violet for glow / dark mode */
  --secondary-glow: rgba(58, 43, 107, 0.15);

  /* Functional Accents */
  --success: #10b981;          /* Verification / verified match */
  --selection: rgba(235, 91, 42, 0.2);
}
```

### 2.2 Tailwind CSS v4 Theme Block

Place this in your `globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #f2ede9;
  --foreground: #1a1a1e;
  --border-color: #d1cdc6;
  --card-bg: #f5f0ea;
  --card-shadow: 0 10px 30px hsl(240 5% 50% / 0.12);
}

@theme inline {
  --color-primary: #c5692b;
  --color-primary-light: #e08950;
  --color-secondary: #3a2b6b;
  --color-secondary-accent: #3b2d59;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card-bg);
  --color-border: var(--border-color);
  --font-sans: "Instrument Sans", sans-serif;
  --font-mono: "Consolas", "Courier New", monospace;
}
```

---

## 3. Typography Rules

### 3.1 Primary Font Family
- **Font**: `Instrument Sans` via Google Fonts.
- **Head tag import**:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
  ```

### 3.2 Typography Hierarchy & Utility Classes

| Level | Tailwind Classes | Usage / Notes |
| :--- | :--- | :--- |
| **Hero Headline** | `text-[clamp(3.5rem,7vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.04em] text-foreground` | Monumental display text with tight line-height |
| **Section Title** | `text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]` | Primary section headers |
| **Italic Highlight** | `text-[#3b2d59] italic font-medium pr-2` or `text-[#c5692b] italic` | Injected into sentences for high editorial contrast |
| **Gradient Accent** | `font-bold bg-gradient-to-b from-[#c5692b] to-[#e0915c] bg-clip-text text-transparent` | For climactic action words (e.g. "automatically.") |
| **Giant Number** | `text-8xl md:text-[130px] font-black tracking-tighter leading-none bg-gradient-to-b from-[#3b2d59]/60 to-[#3b2d59]/10 bg-clip-text text-transparent` | Anchors workflow / numbered sections |
| **Eyebrows / Meta** | `text-[9px] md:text-[10px] font-bold text-foreground/50 tracking-[0.2em] md:tracking-[0.25em] uppercase` | Section identifiers, headers, and badge categories |
| **Quote Body** | `text-xl md:text-3xl font-medium italic text-foreground/80 leading-relaxed` | Testimonials or thesis statements |
| **Body Paragraph** | `text-[15px] md:text-[17px] leading-relaxed text-foreground/80 font-medium` | Informational descriptions |

---

## 4. Atmospheric Effects & Background Overlays

HireLoop uses three layered atmospheric effects over `#f2ede9`:

### 4.1 Film Grain Texture (SVG Overlay)
Adds subtle analog tactile grain to the entire page.
```css
.film-grain {
  position: relative;
}
.film-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
  opacity: 0.15;
  mix-blend-mode: overlay;
}
@media (prefers-reduced-motion: reduce) {
  .film-grain::after {
    display: none;
  }
}
```

### 4.2 Architectural Grid Background
Fine 16px or 24px subtle grid lines with a radial gradient fade:
```css
.grid-background {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
  background-position: center top;
}

/* Masked Section Grid */
.section-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(128, 128, 128, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(128, 128, 128, 0.07) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%);
}
```

### 4.3 Ambient Glowing Orbs
Positioned in corners to inject warm amber and royal violet glows:
```css
.orb-amber {
  position: absolute;
  width: 80vw;
  height: 80vw;
  max-width: 800px;
  max-height: 800px;
  background: radial-gradient(circle, rgba(197, 105, 43, 0.15) 0%, rgba(242, 237, 233, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

.orb-violet {
  position: absolute;
  width: 80vw;
  height: 80vw;
  max-width: 800px;
  max-height: 800px;
  background: radial-gradient(circle, rgba(58, 43, 107, 0.12) 0%, rgba(242, 237, 233, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}
```

---

## 5. Signature Component Blueprints

### 5.1 Floating Dynamic Navbar (Island Header)
Shrinks and widens dynamically on scroll.
```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 pointer-events-none">
      <header
        className={`pointer-events-auto flex items-center justify-between rounded-2xl border border-foreground/5 bg-background/50 backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled ? "w-full max-w-6xl px-8 py-4 shadow-sm" : "w-full max-w-3xl px-5 py-2.5"
        }`}
      >
        {/* Brand Monogram */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-black text-background tracking-wider group-hover:bg-[#c5692b] transition-colors">
            HL
          </span>
          <span className="text-sm font-black tracking-widest text-foreground uppercase">HireLoop</span>
        </Link>

        {/* Links */}
        <nav className="hidden items-center gap-2 text-[13px] font-medium text-foreground/80 md:flex">
          <Link href="#workflow" className="px-4 py-2 rounded-full hover:bg-foreground/5 transition-all tracking-wide">Workflow</Link>
          <Link href="#pricing" className="px-4 py-2 rounded-full hover:bg-foreground/5 transition-all tracking-wide">Pricing</Link>
          <Link href="#faq" className="px-4 py-2 rounded-full hover:bg-foreground/5 transition-all tracking-wide">FAQ</Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/auth"
            className="rounded-full text-[12px] font-bold text-foreground/80 hover:bg-foreground/5 uppercase tracking-widest px-4 py-2 transition-all"
          >
            Log In
          </Link>
          <Link
            href="/auth?signup=true"
            className="rounded-[8px] bg-gradient-to-b from-[#e08950] to-[#c5692b] px-6 py-2.5 text-[12px] font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] tracking-widest uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.05)] border border-[#b35d24]"
          >
            Sign Up
          </Link>
        </div>
      </header>
    </div>
  );
}
```

---

### 5.2 Primary & Secondary Buttons

#### Primary Big Pill Button (With Arrow Badge)
```tsx
<button className="rounded-full bg-foreground px-10 py-[18px] text-[14px] font-bold text-background transition-all hover:bg-[#d97736] hover:text-white tracking-[0.1em] uppercase flex items-center justify-center gap-2 group w-full sm:w-auto">
  Get started
  <div className="bg-background/20 rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
    <ArrowRight size={16} />
  </div>
</button>
```

#### Secondary Outline Pill Button
```tsx
<button className="rounded-full border border-border bg-transparent px-10 py-[18px] text-[14px] font-bold text-foreground/80 transition-colors hover:bg-border/30 tracking-[0.1em] uppercase flex items-center justify-center gap-2 group w-full sm:w-auto">
  How it works
  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
</button>
```

---

### 5.3 Dark Monolith Feature Cards (`#18181b`)
The signature card style with corner gradient hover flare:
```tsx
<div className="bg-[#18181b] rounded-3xl p-10 md:p-12 text-[#fafafa] flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#c5692b]/20 cursor-default border border-white/5 hover:border-white/10">
  {/* Corner hover glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#c5692b]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

  <div className="relative z-10 flex flex-col h-full">
    {/* Card Header */}
    <div className="flex justify-between items-start mb-24">
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <Icon className="text-white/60" size={20} />
      </div>
      <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">/ 01</span>
    </div>

    {/* Card Body */}
    <div className="mt-auto">
      <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">Feature Title</h3>
      <p className="text-white/50 group-hover:text-white/70 transition-colors duration-500 text-[15px] leading-relaxed mb-10">
        Feature description highlighting core workflows and automated benefits.
      </p>
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Classification</span>
        <span className="text-xs font-medium text-[#c5692b] uppercase tracking-widest">Active Automation</span>
      </div>
    </div>
  </div>
</div>
```

---

### 5.4 Category & Role Pills
Pill buttons for supported roles, integrations, or tags:
```tsx
<div className="flex items-center gap-3 px-6 py-4 rounded-full border border-border/60 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-border hover:shadow-md hover:-translate-y-1">
  <span className="text-xl grayscale opacity-60">💻</span>
  <span className="text-sm font-medium text-foreground">Software Engineering</span>
</div>
```

---

### 5.5 Browser Mockup Frame
Showcases dashboards or screenshots with mock window dots:
```tsx
<div className="relative mt-16 w-full overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
  {/* Browser Chrome Bar */}
  <div className="h-8 border-b border-border bg-background flex items-center px-4 gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
    <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
    <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
  </div>
  <img
    src="/preview.png"
    alt="Preview"
    className="w-full h-auto block"
  />
</div>
```

---

### 5.6 Pricing Tier Grid
Includes monthly/quarterly/annual toggle and elevated dark featured tier:
```tsx
{/* Elevated Featured Card */}
<div className="relative rounded-3xl border border-transparent bg-[#18181b] p-10 flex flex-col md:-translate-y-4 shadow-2xl text-[#fafafa] transition-all duration-500 hover:-translate-y-6">
  {/* Badge */}
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c5692b] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap shadow-md">
    Most Popular
  </span>
  <h3 className="text-2xl font-bold tracking-tight">Pro</h3>
  <div className="mt-6 flex items-baseline gap-1">
    <span className="text-4xl md:text-5xl font-black tracking-tighter">₹1,999/mo</span>
  </div>
  <p className="mt-3 text-[15px] font-medium text-white/60">1,500 apps / 30 days</p>
  <button className="mt-10 w-full rounded-full py-4 text-sm font-bold bg-white text-black hover:bg-white/90 shadow-md tracking-wide">
    Start Pro
  </button>
</div>
```

---

### 5.7 Minimalist Accordion FAQ
Border-top dividers with a rotating `+` icon:
```tsx
<div className="border-b border-border/40 py-6">
  <button
    onClick={() => setOpen(!open)}
    className="flex w-full items-center justify-between text-left text-lg font-bold text-foreground"
  >
    <span>How does resume tailoring work?</span>
    <Plus
      size={20}
      className={`text-foreground/50 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
    />
  </button>
  {open && (
    <p className="mt-4 text-[15px] leading-relaxed text-foreground/70 font-medium">
      We parse the Job Description to identify core competencies and required frameworks...
    </p>
  )}
</div>
```

---

## 6. Framer Motion Interaction Conventions

Always implement scroll-triggered entrance choreography with `framer-motion`:

```tsx
import { motion, Variants } from "framer-motion";

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: "easeOut" } 
  }
};

export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export const numberVariant: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 1, ease: "easeOut" } 
  }
};
```

**Section Trigger Standard**:
```tsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
  variants={fadeUpVariant}
>
  ...
</motion.div>
```

---

## 7. LLM System Prompt Snippet

When asking another LLM to build pages with this design system, copy-paste this prompt block:

```markdown
You are building the UI for a project following the "HireLoop Warm Editorial SaaS" design system.
Adhere strictly to these principles:
1. Palette:
   - Canvas: Warm tactile beige #f2ede9 (body) / #f4f3f0 (sections)
   - Ink: Deep slate #1a1a1e
   - Accent 1 (CTA/Highlight): Copper Terracotta #c5692b and #e08950
   - Accent 2 (Plum/Violet): #3a2b6b, #3b2d59, and #7f63b8
   - Dark Cards: Rich obsidian #18181b with text #fafafa and border border-white/5
   - Borders: Warm hairline #d1cdc6
2. Typography:
   - Font: "Instrument Sans"
   - Headings: text-5xl to text-7xl font-black tracking-tight leading-[1.1]
   - Editorial Italic: In headlines or statements, wrap 2-3 key words in `<span className="text-[#3b2d59] italic font-medium">...</span>`
   - Eyebrows: text-[9px] or text-[10px] font-bold uppercase tracking-[0.2em] to tracking-[0.25em] text-foreground/50
   - Watermark Numbers: text-8xl md:text-[130px] font-black tracking-tighter bg-gradient-to-b from-[#3b2d59]/60 to-[#3b2d59]/10 bg-clip-text text-transparent
3. Atmospherics:
   - Page wrapper has `.film-grain` (SVG noise at 15% opacity overlay) and `.grid-background` (16px grid)
   - Ambient blurred orbs: `.orb-amber` and `.orb-violet` with 60px blur
4. Buttons:
   - Primary: rounded-full bg-foreground text-background font-bold uppercase tracking-wider hover:bg-[#d97736] hover:text-white
   - Secondary: rounded-full border border-border text-foreground font-bold uppercase tracking-wider
   - Beveled Gradient: rounded-[8px] bg-gradient-to-b from-[#e08950] to-[#c5692b] text-white border border-[#b35d24] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
```
