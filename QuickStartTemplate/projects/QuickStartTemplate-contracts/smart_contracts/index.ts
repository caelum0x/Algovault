import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { consoleLogger } from '@algorandfoundation/algokit-utils/types/logging'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Uncomment the traceAll option to enable auto generation of AVM Debugger compliant sourceMap and simulation trace file for all AVM calls.
// Learn more about using AlgoKit AVM Debugger to debug your TEAL source codes and inspect various kinds of Algorand transactions in atomic groups -> https://github.com/algorandfoundation/algokit-avm-vscode-Debugger

Config.configure({
  logger: consoleLogger,
  debug: true,
  //  traceAll: true,
})

// Remove __dirname and baseDir logic
// Use current working directory for deployer discovery

// function to validate and dynamically import a module
async function importDeployerIfExists(dir: string) {
  const deployerPath = path.resolve(dir, 'deploy-config.ts')
  if (fs.existsSync(deployerPath)) {
    try {
      const deployer = await import(deployerPath)
      return { ...deployer, name: path.basename(dir) }
    } catch (error) {
      console.error(`Error importing deployer from ${deployerPath}:`, error)
      return null
    }
  }
  return null
}

// get a list of all deployers from the subdirectories
async function getDeployers() {
  const cwd = process.cwd()
  console.log('Current working directory:', cwd)

  // Look in the smart_contracts directory
  const smartContractsDir = path.resolve(cwd, 'smart_contracts')
  console.log('Looking for deployers in:', smartContractsDir)

  const directories = fs
    .readdirSync(smartContractsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.resolve(smartContractsDir, dirent.name))

  console.log('Found directories:', directories)

  const deployers = await Promise.all(directories.map(importDeployerIfExists))
  console.log('Deployers after import:', deployers.filter(d => d !== null))
  return deployers.filter((deployer) => deployer !== null) // Filter out null values
}

// execute all the deployers
(async () => {
  console.log('=== Starting Deployment Process ===')
  const contractName = process.argv.length > 2 ? process.argv[2] : undefined
  console.log('Contract name filter:', contractName || 'none')

  const contractDeployers = await getDeployers()
  console.log('Found deployers:', contractDeployers.map(d => d.name))

  const filteredDeployers = contractName
    ? contractDeployers.filter(deployer => deployer.name === contractName)
    : contractDeployers

  console.log('Filtered deployers:', filteredDeployers.map(d => d.name))

  if (contractName && filteredDeployers.length === 0) {
    console.warn(`No deployer found for contract name: ${contractName}`)
    return
  }

  if (filteredDeployers.length === 0) {
    console.warn('No deployers found to execute')
    return
  }

  for (const deployer of filteredDeployers) {
    try {
      console.log(`Deploying ${deployer.name}...`)
      await deployer.deploy()
      console.log(`✅ ${deployer.name} deployed successfully`)
    } catch (e) {
      console.error(`❌ Error deploying ${deployer.name}:`, e)
    }
  }
  console.log('=== Deployment Process Complete ===')
})()
