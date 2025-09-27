import { describe, test, expect, beforeAll, beforeEach } from 'vitest'
import { AlgorandTestAutomationContext } from '@algorandfoundation/algokit-utils/types/testing'
import { StakingPoolFactory } from '../smart_contracts/artifacts/vault/StakingPoolClient'
import { RewardDistributorFactory } from '../smart_contracts/artifacts/vault/RewardDistributorClient'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

const fixture = algorandFixture()

let appClient: StakingPoolClient
let rewardClient: RewardDistributorClient
let systemAccount: Account
let userAccount: Account
let context: AlgorandTestAutomationContext

describe('AlgoVault Staking Pool', () => {
  beforeAll(async () => {
    await fixture.beforeEach()
    context = await fixture.context()
    
    systemAccount = context.testAccount
    userAccount = await context.generateAccount({ initialFunds: algokit.algos(10) })
    
    // Deploy staking pool contract
    const stakingFactory = new StakingPoolFactory({
      algorand: context.algorand,
      defaultSender: systemAccount.addr,
    })
    
    const { appClient: stakingClient } = await stakingFactory.deploy({
      onSchemaBreak: 'append',
      onUpdate: 'append',
    })
    appClient = stakingClient
    
    // Deploy reward distributor
    const rewardFactory = new RewardDistributorFactory({
      algorand: context.algorand,
      defaultSender: systemAccount.addr,
    })
    
    const { appClient: rewardDistributorClient } = await rewardFactory.deploy({
      onSchemaBreak: 'append',
      onUpdate: 'append',
    })
    rewardClient = rewardDistributorClient
  })

  beforeEach(async () => {
    await fixture.beforeEach()
  })

  test('should initialize staking pool correctly', async () => {
    const assetId = 0 // ALGO
    const rewardRate = 1000 // 0.1% per second
    const minimumStake = 1000000 // 1 ALGO
    
    await appClient.initialize({
      args: {
        assetId,
        rewardRate,
        minimumStake,
      },
      sender: systemAccount,
    })
    
    const poolInfo = await appClient.getPoolInfo()
    
    expect(poolInfo.totalStaked).toBe(0n)
    expect(poolInfo.rewardRate).toBe(BigInt(rewardRate))
    expect(poolInfo.poolActive).toBe(true)
    expect(poolInfo.emergencyPaused).toBe(false)
  })

  test('should allow user to stake ALGO', async () => {
    const stakeAmount = 5000000 // 5 ALGO
    
    await appClient.stake({
      args: {
        payment: {
          sender: userAccount.addr,
          receiver: appClient.appAddress,
          amount: stakeAmount,
        },
      },
      sender: userAccount,
    })
    
    const userStake = await appClient.getUserStake({
      args: { user: userAccount.addr },
    })
    
    expect(userStake.amount).toBe(BigInt(stakeAmount))
    
    const poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.totalStaked).toBe(BigInt(stakeAmount))
  })

  test('should calculate pending rewards correctly', async () => {
    // Wait some time for rewards to accumulate
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pendingRewards = await appClient.getPendingRewards({
      args: { user: userAccount.addr },
    })
    
    expect(pendingRewards).toBeGreaterThan(0n)
  })

  test('should allow user to claim rewards', async () => {
    const initialBalance = await context.algorand.account.getInformation(userAccount.addr).then(info => info.amount)
    
    const claimedRewards = await appClient.claimRewards({
      sender: userAccount,
    })
    
    expect(claimedRewards.return).toBeGreaterThan(0n)
    
    const finalBalance = await context.algorand.account.getInformation(userAccount.addr).then(info => info.amount)
    expect(finalBalance).toBeGreaterThan(initialBalance)
  })

  test('should allow user to withdraw stake', async () => {
    const withdrawAmount = 2000000 // 2 ALGO
    
    await appClient.withdraw({
      args: { amount: withdrawAmount },
      sender: userAccount,
    })
    
    const userStake = await appClient.getUserStake({
      args: { user: userAccount.addr },
    })
    
    expect(userStake.amount).toBe(3000000n) // 5 - 2 = 3 ALGO
    
    const poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.totalStaked).toBe(3000000n)
  })

  test('should handle emergency withdrawal', async () => {
    const userStakeBefore = await appClient.getUserStake({
      args: { user: userAccount.addr },
    })
    
    await appClient.emergencyWithdraw({
      sender: userAccount,
    })
    
    const userStakeAfter = await appClient.getUserStake({
      args: { user: userAccount.addr },
    })
    
    expect(userStakeAfter.amount).toBe(0n)
    
    const poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.totalStaked).toBe(0n)
  })

  test('should reject stake below minimum', async () => {
    const stakeAmount = 500000 // 0.5 ALGO (below minimum)
    
    await expect(
      appClient.stake({
        args: {
          payment: {
            sender: userAccount.addr,
            receiver: appClient.appAddress,
            amount: stakeAmount,
          },
        },
        sender: userAccount,
      })
    ).rejects.toThrow()
  })

  test('should allow admin to update reward rate', async () => {
    const newRewardRate = 2000 // 0.2% per second
    
    await appClient.updateRewardRate({
      args: { newRate: newRewardRate },
      sender: systemAccount,
    })
    
    const poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.rewardRate).toBe(BigInt(newRewardRate))
  })

  test('should allow admin to pause and unpause emergency', async () => {
    await appClient.pauseEmergency({
      sender: systemAccount,
    })
    
    let poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.emergencyPaused).toBe(true)
    
    await appClient.unpauseEmergency({
      sender: systemAccount,
    })
    
    poolInfo = await appClient.getPoolInfo()
    expect(poolInfo.emergencyPaused).toBe(false)
  })

  test('should reject unauthorized admin operations', async () => {
    await expect(
      appClient.updateRewardRate({
        args: { newRate: 3000 },
        sender: userAccount, // Non-admin user
      })
    ).rejects.toThrow()
  })
})

describe('AlgoVault Reward Distributor', () => {
  beforeAll(async () => {
    await fixture.beforeEach()
    context = await fixture.context()
  })

  test('should initialize reward distributor correctly', async () => {
    const initialRewardPool = 1000000000 // 1000 ALGO
    const baseDistributionRate = 500 // 0.05% per second
    const maxRate = 1000
    const minRate = 100
    
    await rewardClient.initialize({
      args: {
        initialRewardPool,
        baseDistributionRate,
        maxRate,
        minRate,
      },
      sender: systemAccount,
    })
    
    const distributorInfo = await rewardClient.getDistributorInfo()
    
    expect(distributorInfo.totalRewardPool).toBe(BigInt(initialRewardPool))
    expect(distributorInfo.distributionRate).toBe(BigInt(baseDistributionRate))
    expect(distributorInfo.distributionActive).toBe(true)
  })

  test('should calculate utilization bonus correctly', async () => {
    const totalStaked = 10000000000 // 10B microALGO
    const bonus = await rewardClient.calculateUtilizationBonus({
      args: { totalStaked },
    })
    
    expect(bonus).toBeGreaterThanOrEqual(100n) // At least 100% (no bonus)
    expect(bonus).toBeLessThanOrEqual(150n) // At most 150% bonus
  })

  test('should calculate optimal rate for target APY', async () => {
    const totalStaked = 1000000000 // 1B microALGO
    const targetAPY = 1000 // 10% APY
    
    const optimalRate = await rewardClient.calculateOptimalRate({
      args: { totalStaked, targetAPY },
    })
    
    expect(optimalRate).toBeGreaterThan(0n)
  })

  test('should distribute rewards to pool', async () => {
    const poolAddress = appClient.appAddress
    const totalStaked = 5000000000 // 5B microALGO
    
    const distributedAmount = await rewardClient.distributeRewards({
      args: { poolAddress, totalStaked },
      sender: systemAccount,
    })
    
    expect(distributedAmount.return).toBeGreaterThan(0n)
    
    const distributorInfo = await rewardClient.getDistributorInfo()
    expect(distributorInfo.totalDistributed).toBeGreaterThan(0n)
  })

  test('should project rewards correctly', async () => {
    const totalStaked = 1000000000 // 1B microALGO
    const timespan = 86400 // 1 day in seconds
    
    const projectedRewards = await rewardClient.calculateProjectedRewards({
      args: { totalStaked, timespan },
    })
    
    expect(projectedRewards).toBeGreaterThan(0n)
  })

  test('should calculate current APY', async () => {
    const totalStaked = 1000000000 // 1B microALGO
    
    const currentAPY = await rewardClient.getCurrentAPY({
      args: { totalStaked },
    })
    
    expect(currentAPY).toBeGreaterThan(0n)
  })
})