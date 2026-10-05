await import('./env.mjs')
const { run } = await import('./test.mjs')
const failures = await run()
process.exit(failures ? 1 : 0)
