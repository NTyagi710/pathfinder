import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

// Variable font (wght 400–700), self-hosted by next/font — no render-blocking request.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pathfinder — AI Heuristic Search Visualizer",
    template: "%s · Pathfinder",
  },
  description:
    "An interactive, client-side visualizer comparing A*, Breadth-First Search and Greedy Best-First Search across Manhattan, Euclidean and Chebyshev heuristics.",
  keywords: [
    "A* search",
    "BFS",
    "Greedy Best-First Search",
    "pathfinding",
    "heuristics",
    "artificial intelligence",
    "algorithm visualizer",
  ],
  applicationName: "Pathfinder",
};

export const viewport: Viewport = {
  themeColor: "#f2ede9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="film-grain grid-background min-h-full flex flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
