import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import dotenv from 'dotenv'
import fs from 'fs'

// Since the TypeScript clients need compilation, let's deploy using the basic app deployment approach

// Load environment variables
dotenv.config()

console.log('=== Deploying AlgoVault Suite to LocalNet ===')

try {
  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  console.log('Deployer address:', deployer.addr)
  console.log('Starting deployment...')

  // Deploy Vault Factory first
  console.log('1. Deploying VaultFactory...')
  const vaultFactory = algorand.client.getTypedAppFactory(VaultFactoryFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient: vaultFactoryClient } = await vaultFactory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    deployTimeParams: {
      poolCreationFee: 0n,
      factoryFeeRate: 1000000n, // 1% in micros
      maxPoolsPerUser: 10n,
      minimumInitialStake: 1000000n, // 1 ALGO minimum
    },
  })

  console.log(`✅ VaultFactory deployed with ID: ${vaultFactoryClient.appClient.appId}`)

  // Deploy StakingPool
  console.log('2. Deploying StakingPool...')
  const stakingPool = algorand.client.getTypedAppFactory(StakingPoolFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient: stakingPoolClient } = await stakingPool.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    deployTimeParams: {},
  })

  console.log(`✅ StakingPool deployed with ID: ${stakingPoolClient.appClient.appId}`)

  // Deploy Reward Distributor
  console.log('3. Deploying RewardDistributor...')
  const rewardDistributor = algorand.client.getTypedAppFactory(RewardDistributorFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient: rewardDistributorClient } = await rewardDistributor.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    deployTimeParams: {
      initialRewardPool: 1000000000n, // 1000 ALGO initial pool
      baseDistributionRate: 100000n,
      maxRate: 1000000n,
      minRate: 10000n,
    },
  })

  console.log(`✅ RewardDistributor deployed with ID: ${rewardDistributorClient.appClient.appId}`)

  // Fund the deployed contracts
  console.log('4. Funding contract accounts...')
  const apps = [vaultFactoryClient, stakingPoolClient, rewardDistributorClient]

  for (const app of apps) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: app.appAddress,
    })
  }

  console.log('🎉 AlgoVault Suite Deployment Complete!')
  console.log('Contract IDs:')
  console.log(`- VaultFactory: ${vaultFactoryClient.appClient.appId}`)
  console.log(`- StakingPool: ${stakingPoolClient.appClient.appId}`)
  console.log(`- RewardDistributor: ${rewardDistributorClient.appClient.appId}`)

  // Save deployment info for frontend
  const deploymentInfo = {
    network: 'localnet',
    contracts: {
      VaultFactory: vaultFactoryClient.appClient.appId,
      StakingPool: stakingPoolClient.appClient.appId,
      RewardDistributor: rewardDistributorClient.appClient.appId,
    },
    deployer: deployer.addr,
    timestamp: new Date().toISOString()
  }

  // Write deployment info to a file the frontend can use
  import('fs').then(fs => {
    fs.writeFileSync('../QuickStartTemplate-frontend/src/deployment-info.json', JSON.stringify(deploymentInfo, null, 2))
    console.log('📝 Deployment info saved to frontend/src/deployment-info.json')
  })

} catch (error) {
  console.error('Deployment failed:', error)
}