/* ==========================================================================
   build.mjs — produce a single portable HTML file (works from file://,
   WhatsApp, email, USB, GitHub Pages) by inlining the CSS and the IIFE bundle.
   Run:  node house/build.mjs
   ========================================================================== */
import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '.build');

await build({
  root: here,
  configFile: false,
  logLevel: 'error',
  build: {
    lib: { entry: path.join(here, 'assets/app.js'), formats: ['iife'], name: 'DhonashiHouse', fileName: () => 'app.js' },
    outDir: out,
    emptyOutDir: true,
    minify: true,
  },
});

const js = fs.readFileSync(path.join(out, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(here, 'assets/site.css'), 'utf8');
let html = fs.readFileSync(path.join(here, 'index.html'), 'utf8');

/* NB: use replacer functions — the bundle is full of `$` and String.replace
   would otherwise interpret `$&`, `$'`, `` $` `` inside the replacement text. */
html = html
  .replace('<link rel="stylesheet" href="./assets/site.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="./assets/app.js"></script>', () => `<script>\n${js}\n</script>`);

const target = path.join(here, 'dhonashi-house.html');
fs.writeFileSync(target, html);
fs.rmSync(out, { recursive: true, force: true });
console.log(`${target} — ${(html.length / 1024).toFixed(0)} kB (self-contained)`);
