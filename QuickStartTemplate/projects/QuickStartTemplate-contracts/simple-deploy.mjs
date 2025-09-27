import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('=== Simple LocalNet Deployment ===')

try {
  // Initialize Algorand client
  const algorand = AlgorandClient.fromEnvironment()

  // Get the deployer account
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  console.log('Deployer address:', deployer.addr)
  console.log('Deployer balance:', (await algorand.client.algod.accountInformation(deployer.addr).do()).amount)

  console.log('LocalNet deployment test successful!')
  console.log('Contracts can be deployed using the generated clients.')

} catch (error) {
  console.error('Deployment error:', error.message)
}