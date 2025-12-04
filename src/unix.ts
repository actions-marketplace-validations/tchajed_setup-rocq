import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { IS_LINUX, IS_MACOS } from './constants.js'

const MANDATORY_LINUX_PACKAGES = [
  'bubblewrap',
  'musl-tools',
  'rsync',
  'libgmp-dev',
  'pkg-config'
]

const OPTIONAL_LINUX_PACKAGES = [
  'darcs',
  'g++-multilib',
  'gcc-multilib',
  'mercurial'
]

const MACOS_PACKAGES = ['darcs', 'mercurial']

async function disableManDbAutoUpdate(): Promise<void> {
  try {
    await exec.exec('sudo', ['debconf-communicate'], {
      input: Buffer.from('set man-db/auto-update false')
    } as exec.ExecOptions)
  } catch (error) {
    if (error instanceof Error) {
      core.info(error.message)
    }
  }

  try {
    await exec.exec('sudo', ['dpkg-reconfigure', 'man-db'])
  } catch (error) {
    if (error instanceof Error) {
      core.info(error.message)
    }
  }
}

async function isPackageInstallable(pkg: string): Promise<boolean> {
  try {
    await exec.exec('apt-cache', ['show', pkg], {
      silent: true
    } as exec.ExecOptions)
    return true
  } catch {
    return false
  }
}

async function installLinuxPackages(): Promise<void> {
  await disableManDbAutoUpdate()

  // Check which optional packages are available
  const installableOptional: string[] = []
  for (const pkg of OPTIONAL_LINUX_PACKAGES) {
    if (await isPackageInstallable(pkg)) {
      installableOptional.push(pkg)
    }
  }

  const packagesToInstall = [
    ...MANDATORY_LINUX_PACKAGES,
    ...installableOptional
  ]

  if (packagesToInstall.length > 0) {
    core.info(`Installing packages: ${packagesToInstall.join(', ')}`)
    await exec.exec('sudo', ['apt-get', 'install', '-y', ...packagesToInstall])
  }
}

async function installMacOSPackages(): Promise<void> {
  if (MACOS_PACKAGES.length > 0) {
    core.info(`Installing packages: ${MACOS_PACKAGES.join(', ')}`)
    await exec.exec('brew', ['install', ...MACOS_PACKAGES])
  }
}

export async function installSystemPackages(): Promise<void> {
  await core.group('Installing system packages', async () => {
    if (IS_LINUX) {
      await installLinuxPackages()
    } else if (IS_MACOS) {
      await installMacOSPackages()
    }
    core.info('System packages installed')
  })
}
