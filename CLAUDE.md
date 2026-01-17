# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Training Tools React V2 is a collection of interactive cognitive training tools built with React 19, TypeScript, and Vite. The application is a German-language SPA featuring exercises for reaction time, mental math, memory, and audio-triggered activities.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build
```

Environment setup: Create `.env.local` with `GEMINI_API_KEY` for AI Studio integration.

## Architecture

### Directory Structure
```
├── App.tsx              # Main routing configuration
├── index.tsx            # Application entry point
├── components/
│   └── Shared.tsx       # Layout, Button, Card, and other reusable UI components
├── features/            # One component per training tool
├── hooks/               # Custom React hooks (microphone, audio, localStorage)
├── constants.ts         # Tool metadata, static data (colors, capitals)
└── types.ts             # Shared TypeScript interfaces
```

### Technology Stack
- **React 19.2.3** with TypeScript
- **React Router DOM v7** (HashRouter for deployment flexibility)
- **Vite 6.2** for building
- **Tailwind CSS** (no component library - custom components only)
- **Lucide React** for icons
- **Web Audio API** for microphone input and sound synthesis

### Routing Pattern
- Hash-based routing defined in `App.tsx`
- All routes except `/` wrapped in `Layout` component with back navigation
- Tool routes: `/sound-counter`, `/farben`, `/kettenrechner`, `/timers`, `/intervall`, `/capitals`

### State Management
- No global state library - component-level React state only
- Settings persisted via `useLocalStorage<T>` hook with lazy initialization
- Type-safe settings interfaces in `types.ts`

### Audio Architecture
- `useMicrophone` hook: Real-time RMS audio level calculation with sensitivity and cooldown
- `useAudio` hook: Web Audio API oscillators for beep/feedback sounds
- Microphone permission handling and device selection support

### Component Patterns
- Feature components in `/features/` are self-contained with their own settings UI
- Shared UI components in `components/Shared.tsx`: Layout, Button, Card, Slider, Toggle
- All tools follow a similar structure: config state → game state → results
- `GameState` enum (CONFIG, PLAYING, PAUSED, PENDING, FINISHED) used across tools

### Training Tools

| Tool | Route | Purpose |
|------|-------|---------|
| Sound-Zähler | `/sound-counter` | Audio-triggered counter (clap detection) |
| Farben | `/farben` | Stroop effect color/word reaction trainer |
| Kettenrechner | `/kettenrechner` | Mental math chain calculations |
| Timer | `/timers` | Custom interval timers with sequences |
| Intervall | `/intervall` | Audio reminder intervals |
| Hauptstädte Quiz | `/capitals` | European capitals knowledge test |

### Key Constants
- `TOOLS` array in `constants.ts`: Tool metadata for home page navigation
- `COLORS_DATA`: German color names with Tailwind classes for Stroop test
- `EUROPEAN_CAPITALS`: Country-capital pairs for quiz

## Development Notes

- **No external CSS frameworks** beyond Tailwind - all UI is custom
- **German language** throughout the UI
- **Dark theme** with custom Tailwind color palette
- **Accessibility**: ARIA labels on buttons, semantic HTML
- Adding a new tool requires: (1) Feature component, (2) Route in App.tsx, (3) Entry in TOOLS constant
