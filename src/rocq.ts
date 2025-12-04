import * as core from '@actions/core'
import { opamPin, opamInstall } from './opam.js'

async function installRocqDev(): Promise<void> {
  core.info('Installing Rocq dev version')

  // Pin dev packages from git repositories
  await opamPin(
    'rocq-runtime.dev',
    'git+https://github.com/rocq-prover/rocq.git',
  )
  await opamPin('rocq-core.dev', 'git+https://github.com/rocq-prover/rocq.git')
  await opamPin('coq-core.dev', 'git+https://github.com/rocq-prover/rocq.git')
  await opamPin(
    'coq-stdlib.dev',
    'git+https://github.com/rocq-prover/stdlib.git',
  )
  await opamPin('coq.dev', '--dev-repo')

  // Install the pinned packages
  await opamInstall('coq.dev', ['--unset-root'])
}

async function installRocqLatest(): Promise<void> {
  core.info('Installing latest Rocq version')
  await opamInstall('coq', ['--unset-root'])
}

async function installRocqVersion(version: string): Promise<void> {
  core.info(`Installing Rocq version ${version}`)
  await opamInstall(`coq.${version}`, ['--unset-root'])
}

export async function installRocq(version: string): Promise<void> {
  await core.group('Installing Rocq', async () => {
    if (version === 'dev') {
      await installRocqDev()
    } else if (version === 'latest') {
      await installRocqLatest()
    } else {
      await installRocqVersion(version)
    }
  })
}
