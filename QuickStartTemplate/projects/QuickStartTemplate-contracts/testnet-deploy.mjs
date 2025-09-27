import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import dotenv from 'dotenv'

// Load TestNet environment variables
dotenv.config({ path: '.env.testnet' })

console.log('=== TestNet Deployment Test ===')

try {
  // Initialize Algorand client for TestNet
  const algorand = AlgorandClient.fromEnvironment()

  // Get the deployer account
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  console.log('Deployer address:', deployer.addr)

  // Check account balance
  const accountInfo = await algorand.client.algod.accountInformation(deployer.addr).do()
  const balanceInAlgo = Number(accountInfo.amount) / 1000000
  console.log('Deployer balance:', balanceInAlgo, 'ALGO')

  if (Number(accountInfo.amount) < 1000000) { // Less than 1 ALGO
    console.warn('⚠️  Warning: Deployer account has insufficient funds for deployment.')
    console.log('Please fund the account using the TestNet dispenser:')
    console.log(`https://testnet.algoexplorer.io/dispenser#${deployer.addr}`)
  } else {
    console.log('✅ TestNet deployment environment ready!')
    console.log('Contracts can be deployed to TestNet using:')
    console.log('algokit project deploy testnet')
  }

} catch (error) {
  console.error('TestNet connection error:', error.message)
  if (error.message.includes('fetch')) {
    console.log('Please check your internet connection or TestNet service status.')
  }
}