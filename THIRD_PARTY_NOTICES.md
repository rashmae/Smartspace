# Third-Party Software & Font Notices

SmartSpace incorporates the following open-source libraries and self-hosted typefaces. Versions and licenses below reflect `package.json` and installed `node_modules` manifests.

## Self-Hosted Fonts (Zero External Font CDN Calls)

| Package | Version | License | Notes |
|---|---|---|---|
| `@fontsource/onest` | 5.3.1 | SIL Open Font License 1.1 (`OFL-1.1`) | Bundled locally in `src/main.tsx` |
| `@fontsource/plus-jakarta-sans` | 5.3.0 | SIL Open Font License 1.1 (`OFL-1.1`) | Bundled locally in `src/main.tsx` |
| `@fontsource/lora` | 5.3.0 | SIL Open Font License 1.1 (`OFL-1.1`) | Bundled locally in `src/main.tsx` |

## Runtime Libraries

| Package | Version | License | Role |
|---|---|---|---|
| `react` | 19.3.1 | MIT | UI component runtime |
| `react-dom` | 19.3.1 | MIT | Browser DOM renderer |
| `firebase` | 13.3.0 | Apache-2.0 | Firebase Authentication & Cloud Firestore SDK |
| `@google/genai` | 3.3.0 | Apache-2.0 | Server-side Gemini API SDK (`server.ts`) |
| `express` | 4.22.3 | MIT | Node.js HTTP server (`server.ts`) |
| `dotenv` | 17.4.2 | BSD-2-Clause | Server environment variable loading |
| `lucide-react` | 0.546.0 | ISC | Interface icons |
| `motion` | 12.43.0 | MIT | UI animations & `MotionConfig` reduced-motion support |
| `three` | 0.187.0 | MIT | Interactive 3D campus showcase (`CinematicScrollStory`) |

## Build & Development Tooling

| Package | Version | License |
|---|---|---|
| `vite` | 8.3.8 | MIT |
| `@vitejs/plugin-react` | 6.3.0 | MIT |
| `tailwindcss` | 4.3.5 | MIT |
| `@tailwindcss/vite` | 4.3.5 | MIT |
| `autoprefixer` | 10.6.2 | MIT |
| `esbuild` | 0.28.2 | MIT |
| `tsx` | 4.23.15 | MIT |
| `typescript` | 7.0.2 | Apache-2.0 |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/express`, `@types/three` | Various | MIT |
