#!/usr/bin/env node

const {run} = require('@oclif/core/run')

async function main() {
  try {
    await run()
    await require('@oclif/core/flush').flush()
  } catch (err) {
    if (err && err.oclif) {
      console.error(err.message)
      process.exit(err.oclif.exit ?? 1)
    }

    console.error(err)
    process.exit(1)
  }
}

main()
