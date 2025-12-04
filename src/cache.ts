import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as path from 'path'
import * as os from 'os'
import { PLATFORM, ARCHITECTURE, ROCQ_VERSION, IS_LINUX } from './constants.js'
import { opamClean } from './opam.js'
import { getRocqWeeklyDir } from './rocq.js'

export const CACHE_VERSION = 'v1'

function getCacheKey(): string {
  return `setup-rocq-${CACHE_VERSION}-${PLATFORM}-${ARCHITECTURE}-rocq-${ROCQ_VERSION}`
}

function getOpamRoot(): string {
  return path.join(os.homedir(), '.opam')
}

function getCachePaths(): string[] {
  const paths = [getOpamRoot()]

  // For weekly version, also cache the directory with cloned repositories
  if (ROCQ_VERSION === 'weekly') {
    paths.push(getRocqWeeklyDir())
  }

  // On Linux, cache apt package archives and lists
  if (IS_LINUX) {
    paths.push('/var/cache/apt/archives')
    paths.push('/var/lib/apt/lists')
  }

  return paths
}

export async function restoreCache(): Promise<boolean> {
  const cachePaths = getCachePaths()
  const cacheKey = getCacheKey()

  core.info(`Attempting to restore cache with key: ${cacheKey}`)
  core.info(`Cache paths: ${cachePaths.join(', ')}`)

  try {
    const restoredKey = await cache.restoreCache(cachePaths, cacheKey, [
      `setup-rocq-${CACHE_VERSION}-${PLATFORM}-${ARCHITECTURE}-`,
    ])

    if (restoredKey) {
      core.info(`Cache restored from key: ${restoredKey}`)
      // Set a state variable to indicate cache was restored
      core.saveState('CACHE_RESTORED', 'true')
      core.saveState('CACHE_KEY', cacheKey)
      return true
    } else {
      core.info('Cache not found')
      core.saveState('CACHE_RESTORED', 'false')
      core.saveState('CACHE_KEY', cacheKey)
      return false
    }
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Failed to restore cache: ${error.message}`)
    }
    core.saveState('CACHE_RESTORED', 'false')
    core.saveState('CACHE_KEY', cacheKey)
    return false
  }
}

export async function saveCache(): Promise<void> {
  const cacheKey = core.getState('CACHE_KEY')

  if (!cacheKey) {
    core.warning('No cache key found, skipping save')
    return
  }

  await opamClean()
  const cachePaths = getCachePaths()

  core.info(`Saving cache with key: ${cacheKey}`)
  core.info(`Cache paths: ${cachePaths.join(', ')}`)

  try {
    await cache.saveCache(cachePaths, cacheKey)
    core.info('Cache saved successfully')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        core.info('Cache already exists, skipping save')
      } else {
        core.warning(`Failed to save cache: ${error.message}`)
      }
    }
  }
}
