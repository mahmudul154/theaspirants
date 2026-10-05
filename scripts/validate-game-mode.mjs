/* ১v১ গেম মোড যাচাই — two simulated browser tabs play a full match.
 *
 *   npm run validate:game-mode
 *
 * jsdom renders the real GameMode component twice (one root per "tab"), a
 * BroadcastChannel shim carries the room messages between them, and the script
 * walks a complete step-mode match plus a whole-paper match and prints the
 * result. Supabase is pointed at an unreachable host on purpose, so the run
 * also proves the bundled offline question pool keeps the room playable.
 */
import { build } from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(root, 'scripts/game-sim/build/game-sim.mjs')

await build({
  entryPoints: [path.join(root, 'scripts/game-sim/run.mjs')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  external: ['jsdom'],
  jsx: 'automatic',
  loader: { '.json': 'json', '.css': 'empty' },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '"https://sim.invalid"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '"sim-key"'
  },
  logLevel: 'warning'
})

await import(outfile)
