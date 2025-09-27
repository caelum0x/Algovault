import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import dotenv from 'dotenv'
import fs from 'fs'

// Load TestNet environment variables
dotenv.config({ path: '.env.testnet' })

console.log('=== Deploying Contracts to TestNet ===')

try {
  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  console.log('Deployer address:', deployer.addr.toString())

  // Read the ARC56 specs for deployment
  const contractFiles = [
    'smart_contracts/artifacts/vault/VaultFactory.arc56.json',
    'smart_contracts/artifacts/vault/StakingPool.arc56.json',
    'smart_contracts/artifacts/vault/RewardDistributor.arc56.json',
    'smart_contracts/artifacts/vault/GovernanceVault.arc56.json',
    'smart_contracts/artifacts/vault/AutoCompounder.arc56.json',
    'smart_contracts/artifacts/security/AccessControl.arc56.json',
    'smart_contracts/artifacts/security/EmergencyPause.arc56.json',
    'smart_contracts/artifacts/math/YieldCalculations.arc56.json',
    'smart_contracts/artifacts/math/CompoundMath.arc56.json'
  ]

  const deployedContracts = {}

  for (const contractFile of contractFiles) {
    if (fs.existsSync(contractFile)) {
      const spec = JSON.parse(fs.readFileSync(contractFile, 'utf8'))
      const contractName = spec.name

      console.log(`\n📋 Found contract: ${contractName}`)
      console.log(`   File: ${contractFile}`)
      console.log(`   Ready for deployment to TestNet`)

      deployedContracts[contractName] = {
        specFile: contractFile,
        ready: true
      }
    }
  }

  console.log('\n🚀 Contracts ready for TestNet deployment:')
  console.log('Use Lora TestNet Explorer: https://explore.algokit.io/testnet')
  console.log('Or deploy programmatically using the spec files above')

  console.log('\n📝 To get App IDs:')
  console.log('1. Deploy each contract via Lora TestNet')
  console.log('2. Note the App ID for each deployed contract')
  console.log('3. Update frontend .env with the TestNet App IDs')

} catch (error) {
  console.error('Error:', error)
}