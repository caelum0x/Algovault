import { assert, Contract, GlobalState, uint64, Global, Txn, abimethod, bytes, Bytes, itxn } from '@algorandfoundation/algorand-typescript'


export class RewardDistributor extends Contract {
  // Global state variables
  totalRewardPool = GlobalState<uint64>()
  distributionRate = GlobalState<uint64>() // Base distribution rate
  lastDistribution = GlobalState<uint64>()
  distributionActive = GlobalState<boolean>()

  // Admin controls
  admin = GlobalState<bytes>()

  // Pool configuration
  maxDistributionRate = GlobalState<uint64>()
  minDistributionRate = GlobalState<uint64>()

  // Performance metrics
  totalDistributed = GlobalState<uint64>()
  distributionCount = GlobalState<uint64>()

  @abimethod()
  initialize(
    initialRewardPool: uint64,
    baseDistributionRate: uint64,
    maxRate: uint64,
    minRate: uint64
  ): void {
    // Ensure not already active
    assert(!this.distributionActive.value)

    this.totalRewardPool.value = initialRewardPool
    this.distributionRate.value = baseDistributionRate
    this.maxDistributionRate.value = maxRate
    this.minDistributionRate.value = minRate
    this.lastDistribution.value = Global.latestTimestamp
    this.distributionActive.value = true
    this.admin.value = Txn.sender.bytes
    this.totalDistributed.value = 0
    this.distributionCount.value = 0
  }

  /**
   * Add rewards to the pool - expects a payment transaction in the same group
   * This method requires the sender to include a payment transaction to this contract
   * in the same transaction group as this application call.
   */
  @abimethod()
  addRewards(): void {
    assert(this.distributionActive.value)
    // In a complete implementation, this would process a payment transaction
    // sent to this contract as part of the same transaction group
    // For now, this method serves as a placeholder for the client to coordinate
    // the grouped transaction that includes both a payment and this app call
  }

  @abimethod()
  distributeRewards(poolAddress: bytes, totalStaked: uint64): uint64 {
    assert(this.distributionActive.value)
    assert(totalStaked > 0)
    assert(this.totalRewardPool.value > 0)

    const currentTime: uint64 = Global.latestTimestamp
    const timeSinceLastDistribution: uint64 = currentTime - this.lastDistribution.value

    const baseReward: uint64 = (timeSinceLastDistribution * this.distributionRate.value * totalStaked) / 1000000000000 as uint64
    const utilizationBonus: uint64 = this.calculateUtilizationBonus(totalStaked)
    const finalReward: uint64 = (baseReward * utilizationBonus) / 100 as uint64
    const actualReward: uint64 = finalReward > this.totalRewardPool.value ? this.totalRewardPool.value : finalReward

    if (actualReward > 0) {
      this.totalRewardPool.value = this.totalRewardPool.value - actualReward
      this.totalDistributed.value = this.totalDistributed.value + actualReward
      this.distributionCount.value = this.distributionCount.value + 1
      this.lastDistribution.value = currentTime
      
      // Execute the payment using inner transaction
      itxn.payment({
        receiver: poolAddress,
        amount: actualReward,
      }).submit()
    }

    return actualReward
  }

  private calculateUtilizationBonus(totalStaked: uint64): uint64 {
    // Use individual variables instead of array
    const threshold1: uint64 = 1000000 as uint64
    const bonus1: uint64 = 100 as uint64
    const threshold2: uint64 = 10000000 as uint64
    const bonus2: uint64 = 110 as uint64
    const threshold3: uint64 = 100000000 as uint64
    const bonus3: uint64 = 125 as uint64
    const threshold4: uint64 = 1000000000 as uint64
    const bonus4: uint64 = 150 as uint64

    if (totalStaked >= threshold4) {
      return bonus4
    } if (totalStaked >= threshold3) {
      return bonus3
    } if (totalStaked >= threshold2) {
      return bonus2
    }

    return bonus1
  }

  private calculateOptimalRate(totalStaked: uint64, targetAPY: uint64): uint64 {
    const secondsPerYear: uint64 = 31536000 as uint64
    const optimalRate: uint64 = (targetAPY * 1000000000000 as uint64) / (secondsPerYear * 100 as uint64)

    if (optimalRate > this.maxDistributionRate.value) {
      return this.maxDistributionRate.value
    }
    if (optimalRate < this.minDistributionRate.value) {
      return this.minDistributionRate.value
    }

    return optimalRate
  }

  updateDistributionRate(newRate: uint64): void {
    assert(Txn.sender.bytes === this.admin.value)
    assert(newRate >= this.minDistributionRate.value && newRate <= this.maxDistributionRate.value)
    this.distributionRate.value = newRate
  }

  setTargetAPY(totalStaked: uint64, targetAPY: uint64): void {
    assert(Txn.sender.bytes === this.admin.value)
    const optimalRate = this.calculateOptimalRate(totalStaked, targetAPY)
    this.distributionRate.value = optimalRate
  }

  pauseDistribution(): void {
    assert(Txn.sender.bytes === this.admin.value)
    this.distributionActive.value = false
  }

  resumeDistribution(): void {
    assert(Txn.sender.bytes === this.admin.value)
    this.distributionActive.value = true
    this.lastDistribution.value = Global.latestTimestamp
  }

  @abimethod()
  withdrawExcessRewards(amount: uint64): void {
    assert(Txn.sender.bytes === this.admin.value)
    assert(amount <= this.totalRewardPool.value)
    this.totalRewardPool.value = this.totalRewardPool.value - amount
    
    // Execute the withdrawal payment using inner transaction
    itxn.payment({
      receiver: Txn.sender,
      amount: amount,
    }).submit()
  }

  getDistributorInfo(): [uint64, uint64, uint64, boolean, uint64, uint64] {
    return [
      this.totalRewardPool.value,
      this.distributionRate.value,
      this.lastDistribution.value,
      this.distributionActive.value,
      this.totalDistributed.value,
      this.distributionCount.value,
    ]
  }

  calculateProjectedRewards(totalStaked: uint64, timespan: uint64): uint64 {
    if (!this.distributionActive.value || totalStaked === 0) {
      return 0 as uint64
    }
    const baseReward: uint64 = (timespan * this.distributionRate.value * totalStaked) / 1_000_000_000_000 as uint64
    const utilizationBonus: uint64 = this.calculateUtilizationBonus(totalStaked)
    const projectedReward: uint64 = (baseReward * utilizationBonus) / 100 as uint64
    return projectedReward > this.totalRewardPool.value ? this.totalRewardPool.value : projectedReward
  }

  getCurrentAPY(totalStaked: uint64): uint64 {
    if (totalStaked === 0) {
      return 0 as uint64
    }
    const secondsPerYear: uint64 = 31_536_000 as uint64
    const utilizationBonus: uint64 = this.calculateUtilizationBonus(totalStaked)
    const effectiveRate: uint64 = (this.distributionRate.value * utilizationBonus) / 100 as uint64
    const annualRewards: uint64 = (effectiveRate * secondsPerYear * totalStaked) / 1_000_000_000_000 as uint64
    return (annualRewards * 100 as uint64) / totalStaked as uint64
  }
}