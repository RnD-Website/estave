# ESTAVÉ — Reference Analysis (MiniMaze Light 3D)

Reference: https://minimaze-light.framer.website/ — inspected 8 Nov 2026 in a live browser at 1440×900, 800×865 and 375×812, at multiple tour positions (hero, doors opening, gallery overview, 6 tour stops, end wall, menu, /work, /work/noctelle, /about).

## 1. Initial viewport & hero composition
- The homepage is **one 100vh stage** (document height = viewport). Nothing scrolls natively; the wheel drives a 3D camera.
- Hero = two full-bleed **white wall panels (double doors)** meeting at a 1px vertical seam in the exact centre of the screen. Below ~78% height a warm beige floor band (`rgb(238,237,233)` → `#e4e0d8`) is visible.
- Headline `THINGS GET INTERESTING INSIDE.` is printed *on the panels* (it physically splits along the seam when they open). Inter Display 600, 70px / 64.4px line-height, letter-spacing −3.15px (−0.045em), colour `#080808`, centred, 2 lines at 1440px (3 lines at 800px).
- Small black rectangular button `Enter the gallery` (Inter Display 600 14px, white text, `#080808` bg, ~132×28) sits on the floor line; under it a 2-line 14px/18.2px paragraph, centred, max ~430px.

## 2. Section structure
Home: Hero doors → (click) doors swing open inward on outer hinges + camera dolly (~1.6s, ease in-out) → white gallery hall → wheel-driven camera tour of 8 works → end wall with two small doors labelled `All work` / `About us` (red underline accent).
Sub-pages: `/work` (3-column masonry grid + filter chips with superscript counts), `/work/<slug>` (off-white sheet panel over the page: big title, pill meta row "Identity, film · for · Karaten · in · 2025", text column, red-dot link, pull-quote, media), `/about` (words hanging on strings, expertise list 01–05, "approach" pairs with struck-through words, testimonial, "Worked with" list, timeline), `/journal`, `/contact`.

## 3. Navigation & menu
- Fixed **centred pill bar**: ~800px wide at 1440 (≈55vw), 52px tall, 1px `rgba(0,0,0,.08)` border, white/translucent bg, 4px radius. Wordmark left, two-line burger right. On mobile it's full-width minus 12px gutters.
- Menu: full-screen warm off-white overlay (`#f1efeb`), bar stays on top and the burger becomes `×` in a small grey square. Corners: studio address (top-left), email + hours (top-right), socials (bottom-left), all 14px/600.
- Centre: 4 links at 70px/600, tight leading. **Hover**: hovered link stays black with a red dot to its left, the others fade to light grey; the text does a vertical roll (each link is rendered twice, stacked, translateY on hover).

## 4. 3D objects & behaviour
- Entire gallery is a **CSS-3D room** (perspective 1296px) — white walls with vertical panel seams, ceiling of glowing parallel light strips, light warm tiled floor (~1.2m tiles), freestanding white partitions (one with a glowing lightbox niche), black thin-framed works hung on walls and on **ceiling wires**, soft radial "spotlight" glows on walls and blurred contact shadows on the floor.
- Framed works are cinematic stills/looping videos: dark, moody, muted, slightly desaturated grading inside a bright white space — the contrast is the signature look.

## 5. Mouse interaction
- Pointer position **rotates the camera** (yaw ≈ ±10°, small pitch) with heavy smoothing — moving right turns the view toward the right side of the hall; it never snaps.

## 6. Scroll-triggered transitions
- Wheel/trackpad advances a camera along a predefined path; each "stop" frames one work almost full-viewport with a 2-line caption (name 13px/600, category 11px grey) aligned to the work's bottom-left corner. Between stops the camera glides past walls; easing is smooth and damped (~1s settle).
- Last stop faces the end wall with two doors; door leaves are slightly ajar and open a little more on hover.

## 7. Gallery navigation
- Linear tour (scroll down = forward, up = back). Clicking a work opens its project sheet. "All work" leads to the grid with filter chips (red dot marks the active filter, counts as superscripts).

## 8. Image positioning & cropping
- Works use 4:3 / 3:4 / 16:10 crops with a ~6px black frame. At a stop the image fills ~45–55% of viewport width, centred. Grid cards: full-bleed images, title 14px/600 under, one-line description 11px, tags in 40% grey.

## 9. Typography
| Role | Font | Size / LH | Weight | Tracking |
|---|---|---|---|---|
| Display (hero, menu) | Inter Display | 70 / 64.4 | 600 | −0.045em |
| Page title (project) | Inter Display | ~56 | 600 | −0.04em |
| Body / UI | Inter Display | 14 / 18.2 | 600 | −0.01em |
| Caption / meta | Inter | 11–13 | 500–600 | −0.03em |
Colours: ink `#080808`, page `#fcfcfc`, floor `#eeede9`, menu `#f1efeb`, accent red (dot/underline) `≈#e5243b`.

## 10. Mobile (375×812)
- Bar becomes full width (12px inset). Tour still works with touch scroll; a stop frames one work at almost full width with portrait framing; the headline wraps to 3–4 lines; 3D room keeps running.

## Translation to ESTAVÉ
| Reference | ESTAVÉ |
|---|---|
| CSS-3D white room | Real WebGL (Three.js / R3F) white architecture gallery, same proportions, light strips, tiles, partitions, wires |
| Door panels with headline | Same doors, headline "ARCHITECTURE BEYOND EXPECTATIONS." |
| 8 cinematic works | 8 villa projects (name + location captions) with uniform muted grading |
| End wall: All work / About us | End wall: **Featured** / **About** doors flanking a panoramic window onto the live 3D villa |
| Wheel-driven camera tour | GSAP ScrollTrigger-pinned tour, Lenis-smoothed scroll |
| /work/slug sheet | Property sheet overlay (Framer Motion) |
| /work grid + filters | Interior Experience grid (Living, Kitchen & Dining, Bedrooms, Bathrooms, Materials) |
| /about hanging words, lists | About ESTAVÉ |
| "Worked with" list | Locations list with hover image reveal |
| Menu overlay | Same menu, ESTAVÉ content |
