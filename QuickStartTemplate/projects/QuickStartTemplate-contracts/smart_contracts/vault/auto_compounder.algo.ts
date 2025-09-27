import { assert, Box, Contract, GlobalState, uint64, bytes, abimethod, Txn, Global, Bytes, itxn } from '@algorandfoundation/algorand-typescript'

// Helper to concatenate bytes for box keys
function concat(a: bytes, b: bytes): bytes {
  return a.concat(b)
}
// Helper to convert uint64 to bytes for box keys
function uint64ToBytes(x: uint64): bytes {
  return Bytes(x)
}

export class AutoCompounder extends Contract {
  // Global state
  totalUsersEnabled = GlobalState<uint64>()
  totalCompounds = GlobalState<uint64>()
  totalRewardsCompounded = GlobalState<uint64>()
  lastGlobalCompound = GlobalState<uint64>()
  
  // Fee structure
  compoundFeeRate = GlobalState<uint64>() // Fee in basis points
  feeCollector = GlobalState<bytes>()
  
  // Connected contracts
  stakingPoolContract = GlobalState<bytes>()
  rewardDistributor = GlobalState<bytes>()
  
  // Admin controls
  admin = GlobalState<bytes>()
  compoundsActive = GlobalState<boolean>()
  
  // Performance tracking
  averageEfficiency = GlobalState<uint64>()
  bestEfficiency = GlobalState<uint64>()
  
  @abimethod()
  initialize(
    stakingPool: bytes,
    rewardDistributorAddr: bytes,
    compoundFee: uint64,
    feeCollector: bytes
  ): void {
    assert(!this.compoundsActive.value)
    
    this.stakingPoolContract.value = stakingPool
    this.rewardDistributor.value = rewardDistributorAddr
    this.compoundFeeRate.value = compoundFee
    this.feeCollector.value = feeCollector
    this.admin.value = Txn.sender.bytes
    
    this.totalUsersEnabled.value = 0
    this.totalCompounds.value = 0
    this.totalRewardsCompounded.value = 0
    this.lastGlobalCompound.value = Global.latestTimestamp
    this.compoundsActive.value = true
    this.averageEfficiency.value = 0
    this.bestEfficiency.value = 0
  }

  @abimethod()
  enableAutoCompound(
    frequency: uint64,
    threshold: uint64,
    maxGasFee: uint64,
    slippageTolerance: uint64
  ): void {
    assert(this.compoundsActive.value)
    assert(frequency >= 3600) // Minimum 1 hour between compounds
    assert(threshold > 0)
    assert(slippageTolerance <= 1000) // Max 10% slippage
    const user = Txn.sender.bytes
    const enabledKey = concat(user, Bytes('_enabled'))
    const frequencyKey = concat(user, Bytes('_frequency'))
    const thresholdKey = concat(user, Bytes('_threshold'))
    const maxGasFeeKey = concat(user, Bytes('_maxGasFee'))
    const slippageToleranceKey = concat(user, Bytes('_slippageTolerance'))
    const wasEnabled = Box<uint64>({ key: enabledKey }).exists ? Box<uint64>({ key: enabledKey }).value === 1 : false
    Box<uint64>({ key: enabledKey }).value = 1
    Box<uint64>({ key: frequencyKey }).value = frequency
    Box<uint64>({ key: thresholdKey }).value = threshold
    Box<uint64>({ key: maxGasFeeKey }).value = maxGasFee
    Box<uint64>({ key: slippageToleranceKey }).value = slippageTolerance
    if (!wasEnabled) {
      this.totalUsersEnabled.value = this.totalUsersEnabled.value + 1
    }
  }

  @abimethod()
  disableAutoCompound(): void {
    const user = Txn.sender.bytes
    const enabledKey = concat(user, Bytes('_enabled'))
    assert(Box<uint64>({ key: enabledKey }).exists)
    const wasEnabled = Box<uint64>({ key: enabledKey }).value === 1
    if (wasEnabled) {
      Box<uint64>({ key: enabledKey }).value = 0
      this.totalUsersEnabled.value = this.totalUsersEnabled.value - 1
    }
  }

  @abimethod()
  triggerCompound(user: bytes, pendingRewards: uint64): uint64 {
    assert(this.compoundsActive.value)
    const enabledKey = concat(user, Bytes('_enabled'))
    const frequencyKey = concat(user, Bytes('_frequency'))
    const thresholdKey = concat(user, Bytes('_threshold'))
    const maxGasFeeKey = concat(user, Bytes('_maxGasFee'))
    assert(Box<uint64>({ key: enabledKey }).exists && Box<uint64>({ key: enabledKey }).value === 1)
    const frequency = Box<uint64>({ key: frequencyKey }).value
    const threshold = Box<uint64>({ key: thresholdKey }).value
    const maxGasFee = Box<uint64>({ key: maxGasFeeKey }).value
    // Check timing constraint
    const lastCompoundKey = concat(user, Bytes('_lastCompound'))
    const lastCompound = Box<uint64>({ key: lastCompoundKey }).exists ? Box<uint64>({ key: lastCompoundKey }).value : 0 as uint64
    assert(Global.latestTimestamp >= lastCompound + frequency)
    assert(pendingRewards >= threshold)
    // Calculate compound efficiency
    const gasCost = this.estimateGasCost()
    assert(gasCost <= maxGasFee)
    const efficiency = this.calculateCompoundEfficiency(pendingRewards, gasCost)
    // Execute compound operation
    const compoundedAmount = this.executeCompound(user, pendingRewards, gasCost)
    // Record compound history (store as separate boxes)
    this.recordCompoundHistory(user, pendingRewards, compoundedAmount, gasCost, efficiency)
    // Update global stats
    this.updateGlobalStats(compoundedAmount, efficiency)
    // Update user's last compound time
    Box<uint64>({ key: lastCompoundKey }).value = Global.latestTimestamp
    return compoundedAmount as uint64
  }

  executeCompound(user: bytes, rewardAmount: uint64, gasCost: uint64): uint64 {
    // Calculate the compound fee
    const compoundFee = (rewardAmount * this.compoundFeeRate.value) / 10000 as uint64
    
    // In a real implementation, this function would:
    // 1. Claim rewards from the staking pool (using inner transaction)
    // 2. Pay the compound fee to the fee collector (using inner transaction)
    // 3. Stake the remaining rewards back into the staking pool (using inner transaction)
    // 4. Return the amount that was successfully compounded
    
    // For this template, we'll return the net amount that would be compounded
    // after the fee is deducted. In a full implementation, the actual compounding
    // would be performed with inner transactions to claim, pay fees, and re-stake
    const netReward = rewardAmount - compoundFee - gasCost as uint64
    
    // In a complete implementation, these payments would be made using inner transactions:
    // itxn.payment({
    //   receiver: this.feeCollector.value,
    //   amount: compoundFee,
    // }).submit()
    // 
    // Then the remaining amount would be staked back in the staking pool
    
    // For now, return the net amount that would theoretically be compounded
    return netReward as uint64
  }

  @abimethod()
  batchCompound(users: bytes[], pendingRewardsArray: uint64[]): uint64 {
    assert(this.compoundsActive.value)
    // Remove users.length, AVM does not support array length, so limit by max 10 args
    
    let totalCompounded: uint64 = 0
    
    // AVM does not support dynamic loops, so unroll up to 10 users
    if (users.length > 0 && pendingRewardsArray.length > 0) {
      if (this.isEligibleForCompound(users[0])) {
        const compounded = this.triggerCompound(users[0], pendingRewardsArray[0])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 1 && pendingRewardsArray.length > 1) {
      if (this.isEligibleForCompound(users[1])) {
        const compounded = this.triggerCompound(users[1], pendingRewardsArray[1])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 2 && pendingRewardsArray.length > 2) {
      if (this.isEligibleForCompound(users[2])) {
        const compounded = this.triggerCompound(users[2], pendingRewardsArray[2])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 3 && pendingRewardsArray.length > 3) {
      if (this.isEligibleForCompound(users[3])) {
        const compounded = this.triggerCompound(users[3], pendingRewardsArray[3])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 4 && pendingRewardsArray.length > 4) {
      if (this.isEligibleForCompound(users[4])) {
        const compounded = this.triggerCompound(users[4], pendingRewardsArray[4])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 5 && pendingRewardsArray.length > 5) {
      if (this.isEligibleForCompound(users[5])) {
        const compounded = this.triggerCompound(users[5], pendingRewardsArray[5])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 6 && pendingRewardsArray.length > 6) {
      if (this.isEligibleForCompound(users[6])) {
        const compounded = this.triggerCompound(users[6], pendingRewardsArray[6])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 7 && pendingRewardsArray.length > 7) {
      if (this.isEligibleForCompound(users[7])) {
        const compounded = this.triggerCompound(users[7], pendingRewardsArray[7])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 8 && pendingRewardsArray.length > 8) {
      if (this.isEligibleForCompound(users[8])) {
        const compounded = this.triggerCompound(users[8], pendingRewardsArray[8])
        totalCompounded = totalCompounded + compounded
      }
    }
    if (users.length > 9 && pendingRewardsArray.length > 9) {
      if (this.isEligibleForCompound(users[9])) {
        const compounded = this.triggerCompound(users[9], pendingRewardsArray[9])
        totalCompounded = totalCompounded + compounded
      }
    }
    return totalCompounded as uint64
  }

  calculateCompoundEfficiency(rewardAmount: uint64, gasCost: uint64): uint64 {
    if (rewardAmount === 0 as uint64) return 0 as uint64
    const compoundFee = (rewardAmount * this.compoundFeeRate.value) / 10000 as uint64
    const totalCost = gasCost + compoundFee as uint64
    const netReward = rewardAmount > totalCost ? rewardAmount - totalCost as uint64 : 0 as uint64
    return (netReward * 10000 as uint64) / rewardAmount as uint64
  }

  recordCompoundHistory(
    user: bytes,
    rewardAmount: uint64,
    compoundedAmount: uint64,
    gasCost: uint64,
    efficiency: uint64
  ): void {
    // Store each field as a separate box with key concat(user, Bytes('_history_'), uint64ToBytes(ts), Bytes('_field'))
    const ts = Global.latestTimestamp
    Box<uint64>({ key: concat(concat(concat(user, Bytes('_history_')), uint64ToBytes(ts)), Bytes('_reward')) }).value = rewardAmount
    Box<uint64>({ key: concat(concat(concat(user, Bytes('_history_')), uint64ToBytes(ts)), Bytes('_compounded')) }).value = compoundedAmount
    Box<uint64>({ key: concat(concat(concat(user, Bytes('_history_')), uint64ToBytes(ts)), Bytes('_gas')) }).value = gasCost
    Box<uint64>({ key: concat(concat(concat(user, Bytes('_history_')), uint64ToBytes(ts)), Bytes('_eff')) }).value = efficiency
    Box<uint64>({ key: concat(concat(concat(user, Bytes('_history_')), uint64ToBytes(ts)), Bytes('_ts')) }).value = ts
  }

  updateGlobalStats(compoundedAmount: uint64, efficiency: uint64): void {
    this.totalCompounds.value = this.totalCompounds.value + 1
    this.totalRewardsCompounded.value = this.totalRewardsCompounded.value + compoundedAmount
    this.lastGlobalCompound.value = Global.latestTimestamp
    if (efficiency > this.bestEfficiency.value) {
      this.bestEfficiency.value = efficiency
    }
    // Simple moving average (not precise, but AVM-friendly)
    const currentAvg = this.averageEfficiency.value
    const totalCount = this.totalCompounds.value
    this.averageEfficiency.value = ((currentAvg * (totalCount - 1)) + efficiency) / totalCount
  }

  // Admin functions
  @abimethod()
  updateCompoundFee(newFeeRate: uint64): void {
    assert(Txn.sender.bytes === this.admin.value)
    assert(newFeeRate <= 1000) // Max 10% fee
    
    this.compoundFeeRate.value = newFeeRate
  }

  @abimethod()
  updateFeeCollector(newCollector: bytes): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.feeCollector.value = newCollector
  }

  @abimethod()
  pauseCompounds(): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.compoundsActive.value = false
  }

  @abimethod()
  resumeCompounds(): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.compoundsActive.value = true
  }

  // View functions
  isEligibleForCompound(user: bytes): boolean {
    const enabledKey = concat(user, Bytes('_enabled'))
    const frequencyKey = concat(user, Bytes('_frequency'))
    const thresholdKey = concat(user, Bytes('_threshold'))
    const maxGasFeeKey = concat(user, Bytes('_maxGasFee'))
    if (!Box<uint64>({ key: enabledKey }).exists || Box<uint64>({ key: enabledKey }).value !== 1) {
      return false
    }
    const frequency = Box<uint64>({ key: frequencyKey }).value
    const threshold = Box<uint64>({ key: thresholdKey }).value
    const maxGasFee = Box<uint64>({ key: maxGasFeeKey }).value
    const lastCompoundKey = concat(user, Bytes('_lastCompound'))
    const lastCompound = Box<uint64>({ key: lastCompoundKey }).exists ? Box<uint64>({ key: lastCompoundKey }).value : 0 as uint64
    if (Global.latestTimestamp < lastCompound + frequency) {
      return false
    }
    const pendingRewards = this.getPendingRewards(user)
    if (pendingRewards < threshold) {
      return false
    }
    const gasCost = this.estimateGasCost()
    if (gasCost > maxGasFee) {
      return false
    }
    return true
  }

  getUserSettings(user: bytes): [uint64, uint64, uint64, uint64, uint64] {
    // Returns [enabled, frequency, threshold, maxGasFee, slippageTolerance]
    const enabledKey = concat(user, Bytes('_enabled'))
    const frequencyKey = concat(user, Bytes('_frequency'))
    const thresholdKey = concat(user, Bytes('_threshold'))
    const maxGasFeeKey = concat(user, Bytes('_maxGasFee'))
    const slippageToleranceKey = concat(user, Bytes('_slippageTolerance'))
    const enabled = Box<uint64>({ key: enabledKey }).exists ? Box<uint64>({ key: enabledKey }).value : 0 as uint64
    const frequency = Box<uint64>({ key: frequencyKey }).exists ? Box<uint64>({ key: frequencyKey }).value : 0 as uint64
    const threshold = Box<uint64>({ key: thresholdKey }).exists ? Box<uint64>({ key: thresholdKey }).value : 0 as uint64
    const maxGasFee = Box<uint64>({ key: maxGasFeeKey }).exists ? Box<uint64>({ key: maxGasFeeKey }).value : 0 as uint64
    const slippageTolerance = Box<uint64>({ key: slippageToleranceKey }).exists ? Box<uint64>({ key: slippageToleranceKey }).value : 0 as uint64
    return [enabled, frequency, threshold, maxGasFee, slippageTolerance]
  }

  getCompoundStats(): [uint64, uint64, uint64, uint64, uint64, uint64] {
    // Returns [totalUsersEnabled, totalCompounds, totalRewardsCompounded, averageEfficiency, bestEfficiency, compoundFeeRate]
    return [
      this.totalUsersEnabled.value,
      this.totalCompounds.value,
      this.totalRewardsCompounded.value,
      this.averageEfficiency.value,
      this.bestEfficiency.value,
      this.compoundFeeRate.value
    ]
  }

  // Helper functions
  getPendingRewards(user: bytes): uint64 {
    // In practice, this would be handled by the client application
    // since direct cross-contract calls within a single app call aren't supported in AVM
    // The client would query the staking pool contract separately to get the pending rewards
    // For this contract's functionality, we'll document that the caller should provide
    // the correct amount as an argument or handle the query externally
    // This is a design limitation of the AVM that requires client-side coordination
    return 0 // The actual implementation would need client-side coordination
  }

  estimateGasCost(): uint64 {
    // In practice, this cost would be estimated based on the number of inner transactions
    // required to execute the compound operation. Since we'll implement it with inner transactions,
    // we need to account for the fees of those transactions.
    // Using a conservative estimate for now, but this could be dynamic
    return 3000 // For payment + potential contract call transactions
  }

  calculateOptimalCompoundTime(user: bytes): uint64 {
    const settings = this.getUserSettings(user)
    if (settings[0] !== 1 as uint64) {
      return 0 as uint64
    }
    const lastCompoundKey = concat(user, Bytes('_lastCompound'))
    const lastCompound = Box<uint64>({ key: lastCompoundKey }).exists ? Box<uint64>({ key: lastCompoundKey }).value : 0 as uint64
    return lastCompound + settings[1] as uint64
  }

  projectCompoundValue(user: bytes, timeHorizon: uint64): uint64 {
    // Not AVM-friendly: stub out
    return 0 as uint64
  }
}