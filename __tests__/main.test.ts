/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mock cache module
const mockRestoreCache = jest.fn<() => Promise<boolean>>()
const mockCache = {
  restoreCache: mockRestoreCache
}

// Mock opam module
const mockAcquireOpam = jest.fn<() => Promise<void>>()
const mockInitializeOpam = jest.fn<() => Promise<void>>()
const mockCreateSwitch = jest.fn<() => Promise<void>>()
const mockSetupOpamEnv = jest.fn<() => Promise<void>>()
const mockDisableDuneCache = jest.fn<() => Promise<void>>()
const mockOpam = {
  acquireOpam: mockAcquireOpam,
  initializeOpam: mockInitializeOpam,
  createSwitch: mockCreateSwitch,
  setupOpamEnv: mockSetupOpamEnv,
  disableDuneCache: mockDisableDuneCache
}

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/cache.js', () => mockCache)
jest.unstable_mockModule('../src/opam.js', () => mockOpam)

// The module being tested should be imported dynamically.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs
    core.getInput.mockImplementation((name: string) => {
      if (name === 'rocq-version') return 'latest'
      return ''
    })

    // Mock all opam functions to succeed by default
    mockRestoreCache.mockResolvedValue(false)
    mockAcquireOpam.mockResolvedValue(undefined)
    mockInitializeOpam.mockResolvedValue(undefined)
    mockCreateSwitch.mockResolvedValue(undefined)
    mockSetupOpamEnv.mockResolvedValue(undefined)
    mockDisableDuneCache.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Installs opam when cache is not restored', async () => {
    mockRestoreCache.mockResolvedValue(false)

    await run()

    // Verify all setup steps were called
    expect(mockRestoreCache).toHaveBeenCalled()
    expect(mockAcquireOpam).toHaveBeenCalled()
    expect(mockInitializeOpam).toHaveBeenCalled()
    expect(mockCreateSwitch).toHaveBeenCalled()
    expect(mockSetupOpamEnv).toHaveBeenCalled()
    expect(mockDisableDuneCache).toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('Skips installation when cache is restored', async () => {
    mockRestoreCache.mockResolvedValue(true)

    await run()

    // Verify cache restore was checked
    expect(mockRestoreCache).toHaveBeenCalled()

    // Verify installation steps were skipped
    expect(mockAcquireOpam).not.toHaveBeenCalled()
    expect(mockInitializeOpam).not.toHaveBeenCalled()
    expect(mockCreateSwitch).not.toHaveBeenCalled()

    // But environment setup should still run
    expect(mockSetupOpamEnv).toHaveBeenCalled()
    expect(mockDisableDuneCache).toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('Sets failed status on error', async () => {
    const errorMessage = 'Failed to acquire opam'
    mockAcquireOpam.mockRejectedValue(new Error(errorMessage))

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenCalledWith(errorMessage)
  })
})
