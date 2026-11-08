# ESTAVÉ — Immersive 3D Real Estate Website

*Architecture Beyond Expectations.* A recreation of the MiniMaze Light 3D experience
(https://minimaze-light.framer.website/) for ESTAVÉ.

## Quick start

**Just look at it:** open `site/index.html` in Chrome, Edge, Safari or Firefox by double-clicking it.
It's a single self-contained file with all code, styles, fonts and 3D included. Photos load from Unsplash, so you need an internet connection.

**Develop it:**
```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build in dist/ (for hosting: Netlify, Vercel, any static host)
npm run build:single   # rebuild the single-file site/index.html
```
Requires Node 18+.

## Stack and what each library does
| Library | Used for |
|---|---|
| React 19 + Vite 6 | App, components, build |
| Three.js + React Three Fiber + drei | Real-time 3D gallery hall, procedural villa, camera, 3D text, 3D captions/hotspots |
| GSAP + ScrollTrigger | Door-opening timeline, pinned gallery tour, pinned featured-villa chapters, parallax |
| Lenis | Smooth scrolling (synced to GSAP's ticker), plus snapping to each artwork |
| Framer Motion | Loader, menu, text/image reveals, property sheet, lightbox, filters, hover states, hanging words |
| @react-three/postprocessing | Ambient occlusion + vignette on the featured villa (desktop only) |

## Structure
```
src/
  components/   Navigation, Hero, PropertyGallery, PropertySheet, FeaturedProperty,
                InteriorSection, LocationSection, AboutSection, ContactSection, Loader, common
  scenes/       GalleryScene (hall, doors, works), Villa (procedural Casa Albedo), VillaScene
                (featured canvas), CameraController, Artwork, Atmosphere (sky, sun, env)
  animations/   scrollAnimations.js (gallery layout, camera stops, GSAP/ScrollTrigger builders)
  data/         content.js — all copy, properties, interiors, locations, image IDs
  lib/          textures.js (procedural PBR-style textures), grade.js (one colour grade), env, scroll
  state/        store.js (UI state + per-frame shared values)
  styles/       global.css
docs/REFERENCE_ANALYSIS.md   Phase-1 analysis of the reference
```

## Experience
1. **Hero:** two white doors carry the headline (3D text split on the seam). Click *Enter the gallery*, scroll, swipe or press ↓, and the doors swing open while the camera dollies in.
2. **Property gallery:** a pinned, scroll-driven camera tour of 8 villas hung on walls, wires and lit partitions. Captions show name and location, the cursor makes the camera look around, ← → step between works, and clicking a work opens its property sheet. The end wall frames the live 3D villa through a panoramic window, with *Featured* and *About* doors.
3. **Featured architecture:** Casa Albedo in real-time 3D. The scroll moves the camera through 4 chapters, with material hotspots and specs.
4. **Interiors:** a masonry grid with animated filters and a keyboard-navigable lightbox.
5. **Locations:** a list with an image that follows the cursor, and expandable details.
6. **About:** hanging words, stats, expertise tabs, approach and a testimonial.
7. **Contact:** a validated viewing-request form (see below) and contact details.

## Using your own images
Your villa images are in `public/images/`. To use one in place of an Unsplash photo, open `src/data/content.js` and replace the `image:` id with a local path. Then change the `img()` helper at the top of that file to return local paths unchanged:
```js
export const img = (id, w = 1600, h, extra = '') =>
  id.includes('/') ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}${extra}`
// then e.g.  image: 'images/white-villa-glass-pool.jpg'   (no leading slash, so it also works in site/index.html)
```
Run `npm run build:single` afterwards: it copies `public/images` into `site/images` next to `site/index.html`. Local images work offline.

## Honest notes / replacement paths
- **The villa is procedural.** Casa Albedo is modelled in code at real dimensions (travertine plinth, glass pavilion, board-formed concrete cantilever, oak louvres, infinity pool, stone walls, pines). It uses canvas-generated textures, soft sun shadows, environment reflections and AO. It isn't a photogrammetry asset. For a photoreal model:
  1. Get an archviz GLB (Sketchfab "modern villa", downloadable CC-BY; or your architect's model exported from SketchUp/Blender as glTF). Compress it with `npx gltf-transform optimize in.glb villa.glb --compress draco --texture-compress webp`.
  2. Put it at `public/models/villa.glb`.
  3. Create `.env` with `VITE_VILLA_MODEL=/models/villa.glb`, then rebuild. The featured section loads it instead (front façade facing +Z, units in metres, origin at ground centre).
- **Textures:** swap the procedural maps in `src/lib/textures.js` for scanned CC0 sets (ambientCG, Poly Haven) via `useTexture`.
- **Photography** comes from Unsplash (free licence) and is hot-linked. Replace the IDs in `src/data/content.js`, or point them at files in `public/images/`. Every photo passes through the same grade (`src/lib/grade.js`) in CSS and WebGL so the set stays consistent.
- **Contact form:** with no backend it opens the visitor's email app with the request pre-written to `viewings@estave.com`. To post to a form service or CRM, set `VITE_FORM_ENDPOINT=https://formspree.io/f/xxxx` in `.env`.
- **Fallbacks:** without WebGL the gallery becomes a flat list, so nothing is faked. With `prefers-reduced-motion`, smooth scroll, door/camera tweens and sway are disabled. On mobile you get lower DPR, smaller shadow maps, no post-processing and fewer trees.
- **Accessibility:** skip link, focus-trapped menu and dialogs, Esc to close, an off-screen button list of the 3D works, ARIA labels and live regions.

Photography: Unsplash contributors. Fonts: Inter (SIL OFL).
