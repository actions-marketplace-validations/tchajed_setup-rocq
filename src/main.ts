import * as core from '@actions/core'
import { restoreCache } from './cache.js'
import {
  setupOpam,
  createSwitch,
  setupOpamEnv,
  disableDuneCache
} from './opam.js'

export async function run(): Promise<void> {
  try {
    core.info('Setting up Rocq development environment')

    // Step 1: Restore cache (before setting up opam)
    core.startGroup('Restoring opam cache')
    const cacheRestored = await restoreCache()
    core.endGroup()

    // Step 2: Always set up opam (acquire and initialize)
    await setupOpam()

    // Step 3: Create OCaml switch (only if cache was not restored)
    if (!cacheRestored) {
      await createSwitch()

      // Step 4: Set up opam environment
      await setupOpamEnv()
    } else {
      core.info('Skipping OCaml installation (restored from cache)')
      // Still need to set up the environment variables
      await setupOpamEnv()
    }

    // Step 5: Disable dune cache
    await disableDuneCache()

    core.info('Rocq development environment set up successfully')

    // Get the rocq-version input for future use
    const rocqVersion = core.getInput('rocq-version')
    core.info(`Rocq version requested: ${rocqVersion}`)
    // TODO: Install Rocq in a future update
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unknown error occurred')
    }
  }
}
