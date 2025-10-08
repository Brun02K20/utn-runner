Place the Press Start 2P font files here so the project can use a local copy.

Recommended files (preferred):
- PressStart2P.woff2
- PressStart2P.woff

If you downloaded a .ttf (common from some sources):
- You can use the .ttf directly by renaming/copying it into this folder and updating `styles/globals.css` to reference it (example below).
- Or convert the .ttf to .woff/.woff2 for better web performance (recommended).

Where to download:
- Google Fonts (Press Start 2P) — https://fonts.google.com/specimen/Press+Start+2P
  Use the "Download family" button and extract the .woff/.woff2 files.

Quick options:
1) Use the TTF directly (fast):
   - Copy your `PressStart2P-Regular.ttf` into this folder and rename to `PressStart2P.ttf` (or keep the original name).
   - Edit `styles/globals.css` and add a src entry like:

     src: url('/fonts/PressStart2P/PressStart2P.woff2') format('woff2'),
          url('/fonts/PressStart2P/PressStart2P.woff') format('woff'),
          url('/fonts/PressStart2P/PressStart2P.ttf') format('truetype');

   - Start the dev server: `pnpm dev` or `npm run dev`.

2) Convert TTF to WOFF/WOFF2 (recommended):
   - Use a local tool like `woff2` (npm) or online converters.
   - NPM-based quick converter (requires Node installed):
     - Install: `npm i -g woff2` (or use a local npm project install)
     - Convert to woff2: `woff2_compress PressStart2P-Regular.ttf` (creates `.woff2`)
   - Alternatively, use online converters and then copy the generated `.woff`/`.woff2` files here.

3) If you keep the .ttf and want me to update `styles/globals.css`, tell me the filename and I will add the `truetype` fallback automatically.

Notes:
- The CSS `@font-face` in `styles/globals.css` currently expects the files at `/public/fonts/PressStart2P/PressStart2P.woff2` and `/public/fonts/PressStart2P/PressStart2P.woff`.
- If you place `PressStart2P.ttf` instead, either update `styles/globals.css` or tell me and I update it for you.
