# Styling

## Overview

The app uses a **dark-only theme** defined via CSS custom properties in `src/index.css`, mapped to Tailwind utilities in `tailwind.config.ts`. There is no light mode.

## Color System

### Surface Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg` | `#0A0909` | Page background |
| `--color-surface-1` | `#141213` | Sidebar, cards, panels |
| `--color-surface-2` | `#1E1C20` | Hover states, secondary surfaces |
| `--color-surface-3` | `#28252C` | Tertiary surfaces, inactive elements |
| `--color-border` | `#302D35` | Primary borders |
| `--color-border-subtle` | `#201D24` | Subtle dividers |

### Text Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-text-primary` | `#F4F1EE` | Headings, primary content |
| `--color-text-secondary` | `#9C97A5` | Body text, descriptions |
| `--color-text-muted` | `#635E6C` | Labels, hints, metadata |

### Accent Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-violet` | `#A78BFA` | Primary accent (buttons, active states, links) |
| `--color-violet-dim` | `#7C3AED` | Darker violet for backgrounds |
| `--color-violet-muted` | `rgba(167,139,250,0.10)` | Subtle violet tints |
| `--color-amber` | `#FBB249` | Warning, secondary accent |
| `--color-cyan` | `#22D3EE` | Info accent |
| `--color-green` | `#4ADE80` | Success accent |
| `--color-rose` | `#FB7185` | Error/destructive accent |

Each accent has a `-muted` variant at 10% opacity for background tints.

### Signal Tag Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-trend` | `#FB923C` | Trend signal indicators |
| `--color-comment` | `#60A5FA` | Comment signal indicators |
| `--color-retention` | `#4ADE80` | Retention signal indicators |

### Semantic Node Type Colors
| Variable | Value | Node Type |
|----------|-------|-----------|
| `--node-claim` | `#A78BFA` | claim |
| `--node-explanation` | `#60A5FA` | explanation |
| `--node-example` | `#2DD4BF` | example |
| `--node-anecdote` | `#FBB249` | anecdote |
| `--node-reaction-beat` | `#FB7185` | reaction_beat |
| `--node-qa-exchange` | `#4ADE80` | qa_exchange |
| `--node-challenge-exchange` | `#FB923C` | challenge_exchange |
| `--node-setup-payoff` | `#E879F9` | setup_payoff |
| `--node-reveal` | `#FACC15` | reveal |
| `--node-transition` | `#71717A` | transition |

### shadcn Semantic Tokens (HSL triplets, no `hsl()` wrapper)
| Variable | Value | Maps To |
|----------|-------|---------|
| `--background` | `7 3% 4%` | `#0A0909` (same as `--color-bg`) |
| `--foreground` | `30 18% 95%` | Near-white |
| `--primary` | `262 83% 76%` | Violet (`#A78BFA`) |
| `--secondary` | `280 5% 12%` | Dark surface |
| `--muted` | `270 6% 15%` | Muted surface |
| `--destructive` | `353 92% 73%` | Rose |
| `--border` | `275 5% 19%` | Border color |
| `--ring` | `262 83% 76%` | Focus ring (violet) |
| `--radius` | `0.5rem` | Default border radius |

Sidebar tokens (`--sidebar-*`) mirror the main tokens with surface-1 as the background.

## Typography

### Font Stack

| Role | Font | Tailwind Class | Usage |
|------|------|----------------|-------|
| Display | DM Serif Display | `font-display` | Landing page hero, large display text |
| Heading | Bricolage Grotesque | `font-heading` | Page headings, section titles, labels, nav items |
| Body | Plus Jakarta Sans | `font-body` / `font-sans` | Body text, descriptions, paragraphs |
| Mono | Geist Mono | `font-mono` | Timecodes, data values, code, IDs |

Fonts are loaded via Google Fonts import in `index.css`:
```
DM Serif Display: ital@0;1
Bricolage Grotesque: wght@400;500;600;700;800
Plus Jakarta Sans: wght@300;400;500;600
Geist Mono: wght@400;500
```

### Utility Classes

| Class | Font | Size | Weight | Other |
|-------|------|------|--------|-------|
| `.text-data` | Geist Mono | 13px | — | `tabular-nums` |
| `.label-caps` | Bricolage Grotesque | 11px | 500 | `uppercase`, `letter-spacing: 0.06em`, color: muted |
| `.heading-page` | Bricolage Grotesque | 24px | 700 | color: primary |
| `.heading-section` | Bricolage Grotesque | 17px | 600 | color: primary |

### Base Body Style
- Font: Plus Jakarta Sans
- Size: 15px
- Line height: 1.6
- `-webkit-font-smoothing: antialiased`

## Animations

### Landing Cursor

`CustomCursor` hides the native cursor on the landing route and renders a brand-violet dot/ring pair using Framer Motion. The cursor color is fixed to the same violet family as the `Break` / `gems` hero words. Elements can still opt into interaction states with `data-cursor="pointer"`, `data-cursor="play"`, or `data-cursor="text"`.

### Landing Shader Backgrounds

`ShaderBackground` wraps Paper Design shader primitives for public surfaces. The landing hero uses the `GemSmoke` variant with purple, violet, and lavender tones only, plus a reduced-motion static fallback. The previous separate purple ambient glow behind the hero animation has been removed so the one-shot animation remains the foreground layer over the shader. The grain-gradient pass has also been removed from landing shaders.

Only the hero shader should animate continuously on first paint. Lower landing shader sections (`HowItWorks`, `PipelineDemos`, and `ClipShowcase`) use `pauseWhenOffscreen`, constrained `viewportMargin`, `prewarmMargin`, delayed offscreen unmounting, `animated={false}`, `minPixelRatio={2}`, and a 4K pixel-count cap so they mount before they are needed, wake near the viewport, and render a single high-resolution frozen frame. Avoid adding animated full-section WebGL layers below the fold unless the motion itself is product-critical.

Do not hard-swap a paused shader canvas with its CSS fallback exactly at a section boundary. Keep the fallback as the root background, pre-mount the shader while the section is near the viewport, and delay unmounting after it leaves. That preserves the GPU savings while avoiding blank-frame flicker when users scroll between adjacent shader-backed sections.

Decorative Framer Motion loops in landing preview cards must respect both `useReducedMotion` and `useInView`. For compact hoverable landing cards, avoid broad CSS `transition-all`; use explicit short Framer transitions so hover exit does not visually trail behind rapid pointer movement.

`PipelineDemos` uses shader-backed sections with app-frame previews. The phase 02/03 cortex graph preview uses bounded right bleed and an internally padded React Flow viewport so the graph can show its rightmost node without overflowing the page or relying on parent transforms that would desync edge positions.

`ClyptAnimatedMark` uses a shortened intro sequence: the center flash, bracket reveal, and waveform bars complete in sync with the hero analysis scan. Keep future mark timing changes coordinated with `analysisScanDuration` in `ClyptHeroAnimation` so the first-viewport choreography resolves together.

### CSS Keyframes (defined in `index.css`)

| Animation | Usage |
|-----------|-------|
| `pulse-dot` | Pulsing opacity 1→0.3→1, used by `.animate-pulse-dot` |
| `waveBar` | Vertical scale 1→var(--wh)→1, used by waveform bars |
| `waveRipple` | Opacity ripple 0.5→0.85→0.5 |
| `clypt-dot-appear` | Opacity 0→1, used for SVG animated dots on edges |

### Tailwind Animations (defined in `tailwind.config.ts`)

| Animation | Duration | Usage |
|-----------|----------|-------|
| `accordion-down` | 200ms | Accordion open |
| `accordion-up` | 200ms | Accordion close |
| `fade-in` | 300ms | Fade in |
| `fade-out` | 300ms | Fade out |
| `scale-in` | 200ms | Scale 0.95→1 |
| `waveform-drift-1`, `waveform-drift-2` | 6s | Landing waveform band animation (alternate, infinite) |

## Spacing & Layout Conventions

- Sidebar width: 220px
- `RunContextBar` height: ~48px
- Graph `TimelineStrip` height: 88px
- `EmbedInspectPanel` / `InspectPanel` width: 340px
- `SearchResultsPanel` height: 196px
- Standard padding for overlay components: 12–16px from edges
- Graph overlay z-index: 50 (wrapper), 20 (individual components)

## Tailwind Configuration

The `tailwind.config.ts` maps CSS variables to Tailwind utility classes:

```
colors: {
  background / foreground / card / popover / primary / secondary /
  muted / accent / destructive / border / input / ring
    → hsl(var(--{name}))

  sidebar: sidebar-* variants → hsl(var(--sidebar-*))

  clypt: bg / surface-1 / surface-2 / surface-3 / border / border-subtle /
         text-primary / text-secondary / text-muted / violet / violet-dim /
         violet-muted / amber / cyan / green / rose (+ muted variants)
    → var(--color-*)

  node: claim / explanation / example / anecdote / reaction-beat /
        qa-exchange / challenge-exchange / setup-payoff / reveal / transition
    → var(--node-*)
}
```

Container max-width: `1400px` (at `2xl` breakpoint).

Dark mode: `darkMode: ["class"]` — but no `.dark` class is ever applied since the app is always dark.

## Graph Node Styling

Nodes use a distinctive "frosted glass" effect:
- `backdrop-filter: blur(4px)` on the node background
- `background: linear-gradient(135deg, {typeColor}15, {typeColor}08)` — very faint type-colored tint
- `border: 1px solid {typeColor}` at ~40% opacity (80% on hover)
- `box-shadow: 0 0 {size}px {typeColor}` — glow effect, stronger on hover/select
- Visible `Handle` components colored by node type (not the default React Flow gray dots)

## Icon Set

All icons from `lucide-react` (v0.462). Common icons used:
- Navigation: `LayoutGrid`, `Film`, `Plus`, `Settings`, `ChevronDown`
- Actions: `Play`, `Pause`, `SkipBack`, `SkipForward`, `Check`, `X`
- Data: `Search`, `Loader2`, `Sparkles`, `AlertTriangle`
- Graph: signal filter icons use custom colored dots, not icons
