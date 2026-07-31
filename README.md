# Small Dot

Small Dot is an interactive travel memo app where users explore a 3D globe, select a country, write notes about places they have visited, and turn each note into a keyword that appears directly on the map.

The project started as a globe-based note interface and grew into a full web application with authentication, country-aware memo storage, AI keyword extraction, animated UI panels, and a retro mission-control visual style.

<img width="2048" height="1536" alt="smalldot_main" src="https://github.com/user-attachments/assets/2be446c9-001b-432e-ac88-e093d75ca6aa" />

## Sample Login

```text
username: seongeun9901@gmail.com
pw: testuser01
```

## Tech Stack

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS 4
- React Three Fiber, Drei, and Three.js for the 3D globe scene
- D3 Geo for country preview projection
- Turf.js for geospatial point-in-polygon detection
- Zustand for local UI state
- TanStack Query for server-state caching and mutations
- React Hook Form for authentication forms
- React Day Picker for note date editing
- GSAP for camera, modal, note, sidebar, and list animations
- HackerNoon Pixel Icon Library for the pixel-style icon system

### Backend and Services

- Supabase Authentication
- Supabase database tables for notes and user profiles
- Google Gemini API through `@google/generative-ai`
- Vercel deployment configuration

## Architecture

```text
React + Vite client
  |
  |-- React Three Fiber scene
  |     |-- Globe mesh
  |     |-- Country boundary lines from world.geo.json
  |     |-- Star field
  |     |-- Selected-country pin marker
  |     |-- Keyword labels projected onto country polygons
  |
  |-- Browser UI
  |     |-- Country information panel
  |     |-- Note input
  |     |-- Note list
  |     |-- Editable note modal
  |     |-- Login/signup and user sidebar
  |
  |-- Supabase
  |     |-- Auth session
  |     |-- notes
  |     |-- profiles
  |
  |-- Gemini
        |
        |-- Single-keyword extraction from note content
```

## Major Features

### 3D Globe Exploration

Stack: Three.js, React Three Fiber, Drei, Turf.js, GeoJSON

The main screen is built around an interactive 3D earth. Users can rotate and zoom the globe, click a country, and open a contextual panel for that selected location.

Technical implementation:

- Loads `world.geo.json` from the public folder and stores it in a Zustand geo store.
- Renders the earth as a transparent `sphereGeometry` with separate country boundary lines generated from GeoJSON polygons and multipolygons.
- Converts clicked Three.js coordinates into latitude and longitude, then uses Turf.js `booleanPointInPolygon` to determine the selected country.
- Stores selected latitude, longitude, GeoJSON feature, and ISO country code in a click store so the rest of the UI can react to the same selected location.
- Prefetches country notes through TanStack Query after a successful country hit, reducing the delay before the note list appears.

### Country Panel and Map Preview

Stack: D3 Geo, React, TypeScript, TanStack Query

When a country is selected, Small Dot opens a compact country panel with a projected outline, coordinates, note count, and most recent visit date.

Technical implementation:

- Uses `geoMercator().fitSize()` and `geoPath()` to render the selected country feature as a small SVG preview.
- Reads note data through a `["notes", countryCode]` query key so each country has an isolated cache entry.
- Displays note totals and latest visited date from the country-specific query result.
- Keeps the selected country interface separate from the Three.js scene while sharing state through Zustand.

### Travel Notes

Stack: Supabase, TanStack Query, Zustand, React, TypeScript

Users can save short travel impressions for the selected country, browse saved notes as dated folders, open a note, edit its content and date, or delete it.

Technical implementation:

- Creates notes with `title`, `content`, `country_code`, `date`, and the authenticated user's id.
- Fetches notes by ISO country code and orders them by visit date, then creation date.
- Uses mutations for create, update, and delete behavior, with targeted query invalidation for affected country note lists.
- Stores the currently open note in a Zustand note store so draft edits can happen outside the TanStack Query cache.
- Uses React Day Picker for date changes and preserves today's time when the selected note date is today.

### Gemini Keyword Extraction

Stack: Google Gemini API, TypeScript, Supabase, TanStack Query

Small Dot turns each note into one representative keyword. That keyword becomes the note title and can later be rendered as text on the selected country.

Technical implementation:

- Calls `gemini-2.5-flash-lite` through `@google/generative-ai`.
- Prompts Gemini to treat the user note strictly as natural-language content and return only one keyword.
- Preserves the original note language by asking the model to detect the input language and answer in that same language.
- Adds a 20-second timeout around the model call so note creation and saving do not hang indefinitely.
- Falls back to the first word of the note or the existing title if keyword generation fails.

### Keyword Labels on the Globe

Stack: Three.js, Turf.js, React Three Fiber, Drei Text

Saved note titles are projected back onto the selected country as floating text labels on the globe surface.

Technical implementation:

- Builds a latitude/longitude grid over the selected polygon's bounding box.
- Uses Turf.js to keep only grid cells whose centers are inside the selected country polygon.
- Sorts note titles by length before placement so longer titles get the first available spans.
- Converts each placed letter from latitude/longitude into a Three.js position on the globe.
- Calculates per-letter rotation so labels face outward from the globe surface.

### Animated Mission-Control Interface

Stack: GSAP, Tailwind CSS, Zustand, HackerNoon Pixel Icon Library

The interface uses a pixel-styled mission-control aesthetic with animated panels, icon controls, scramble text, and compact overlays instead of traditional pages.

Technical implementation:

- Runs an unauthenticated camera intro that rotates around the globe, zooms in, then opens the login modal.
- Uses GSAP for menu entrance animation, sidebar reveal, note modal expansion, folder list stagger animation, and number counting.
- Implements reusable toast state for save, delete, and error feedback.
- Uses the HackerNoon pixel icon font for the sidebar, note controls, auth fields, country stats, and folder list.
- Loads a custom Galmuri font and Tailwind theme tokens for a consistent pixel UI.

### Authentication and Profile Data

Stack: Supabase Auth, Supabase database, React Hook Form, TanStack Query

Small Dot gates the main app behind Supabase authentication and shows profile information in a right-side user panel.

Technical implementation:

- Supports email/password login and signup through Supabase Auth.
- Uses React Hook Form validation for email, password, confirm-password, and username fields.
- Caches the auth session with a `["session"]` query and profile data with a `["profile"]` query.
- Listens for auth state changes, then clears cached note and profile data on sign out.
- Shows masked email, total note count, and recent country in the sidebar profile panel.

## Technical Highlights

- Country selection connects 3D picking, latitude/longitude conversion, GeoJSON polygon matching, and Supabase country-code queries.
- Server state is isolated with TanStack Query keys such as `["session"]`, `["profile"]`, `["notes", countryCode]`, and `["note", id]`.
- UI-only state is kept in small Zustand stores for selected country, open note, modal state, toasts, and loaded GeoJSON.
- Gemini output is constrained to a single keyword and wrapped with timeout/fallback handling.
- Text labels are placed by calculating available grid spans inside country polygons instead of relying on fixed positions.
- GSAP handles animation cases that need timeline control, staggered entrances, or imperative camera movement.
