import { assert, Contract, uint64, GlobalState, Box, bytes, abimethod, Txn, Global, itxn, Bytes } from '@algorandfoundation/algorand-typescript'

// Helper to concat bytes for box keys
function concat(a: bytes, b: bytes): bytes {
  return a.concat(b)
}

const SCALE: uint64 = 1000000000000 as uint64;

export class StakingPool extends Contract {
  // Global state variables
  totalStaked = GlobalState<uint64>()
  rewardRate = GlobalState<uint64>() // Rewards per second per unit staked
  lastUpdateTime = GlobalState<uint64>()
  accRewardPerShare = GlobalState<uint64>() // Accumulated rewards per share
  poolActive = GlobalState<uint64>() // 1 = true, 0 = false
  assetId = GlobalState<uint64>() // Asset ID for the staking token
  minimumStake = GlobalState<uint64>()
  emergencyPaused = GlobalState<uint64>() // 1 = true, 0 = false
  
  // Admin address (using bytes for address storage)
  admin = GlobalState<bytes>()
  
  @abimethod()
  initialize(
    assetId: uint64,
    rewardRate: uint64,
    minimumStake: uint64
  ): void {
    assert(this.poolActive.value === 0 as uint64)
    
    this.assetId.value = assetId
    this.rewardRate.value = rewardRate
    this.minimumStake.value = minimumStake
    this.totalStaked.value = 0
    this.lastUpdateTime.value = Global.latestTimestamp
    this.accRewardPerShare.value = 0
    this.poolActive.value = 1 as uint64
    this.emergencyPaused.value = 0 as uint64
    this.admin.value = Txn.sender.bytes
  }

  @abimethod()
  updatePool(): void {
    assert(this.poolActive.value === 1 as uint64)
    
    const currentTime = Global.latestTimestamp
    const timeDiff: uint64 = currentTime > this.lastUpdateTime.value ? currentTime - this.lastUpdateTime.value : 0 as uint64
    
    if (timeDiff > 0 && this.totalStaked.value > 0) {
      const reward: uint64 = timeDiff * this.rewardRate.value
      this.accRewardPerShare.value = this.accRewardPerShare.value + ((reward * SCALE) / this.totalStaked.value as uint64)
    }
    
    this.lastUpdateTime.value = currentTime
  }

  @abimethod()
  stake(payment: uint64): void {
    assert(this.poolActive.value === 1 as uint64)
    assert(this.emergencyPaused.value === 0 as uint64)
    assert(payment >= this.minimumStake.value)

    this.updatePool()

    const userKey = Txn.sender.bytes
    const amountBox = Box<uint64>({ key: concat(userKey, Bytes('_amount')) })
    const rewardDebtBox = Box<uint64>({ key: concat(userKey, Bytes('_rewardDebt')) })
    const lastStakeTimeBox = Box<uint64>({ key: concat(userKey, Bytes('_lastStakeTime')) })

    let amount: uint64 = amountBox.exists ? amountBox.value : 0 as uint64
    let rewardDebt: uint64 = rewardDebtBox.exists ? rewardDebtBox.value : 0 as uint64

    // Calculate pending rewards
    const pending: uint64 = (amount * this.accRewardPerShare.value) / SCALE > rewardDebt ? (amount * this.accRewardPerShare.value) / SCALE - rewardDebt : 0 as uint64
    if (pending > 0) {
      itxn.payment({
        receiver: Txn.sender,
        amount: pending,
      }).submit()
    }

    // Update user stake
    amount = amount + payment
    rewardDebt = (amount * this.accRewardPerShare.value) / SCALE
    const now = Global.latestTimestamp

    amountBox.value = amount
    rewardDebtBox.value = rewardDebt
    lastStakeTimeBox.value = now

    // Update total staked
    this.totalStaked.value = this.totalStaked.value + payment
  }

  @abimethod()
  withdraw(amount: uint64): void {
    assert(this.poolActive.value === 1 as uint64)
    assert(amount > 0)

    this.updatePool()

    const userKey = Txn.sender.bytes
    const amountBox = Box<uint64>({ key: concat(userKey, Bytes('_amount')) })
    const rewardDebtBox = Box<uint64>({ key: concat(userKey, Bytes('_rewardDebt')) })
    const lastStakeTimeBox = Box<uint64>({ key: concat(userKey, Bytes('_lastStakeTime')) })

    assert(amountBox.exists)
    let userAmount: uint64 = amountBox.value
    let userRewardDebt: uint64 = rewardDebtBox.exists ? rewardDebtBox.value : 0 as uint64
    assert(userAmount >= amount)

    // Calculate pending rewards
    const pending: uint64 = (userAmount * this.accRewardPerShare.value) / SCALE > userRewardDebt ? (userAmount * this.accRewardPerShare.value) / SCALE - userRewardDebt : 0 as uint64

    // Update user stake
    userAmount = userAmount - amount
    userRewardDebt = (userAmount * this.accRewardPerShare.value) / SCALE

    if (userAmount === 0 as uint64) {
      amountBox.delete()
      rewardDebtBox.delete()
      lastStakeTimeBox.delete()
    } else {
      amountBox.value = userAmount
      rewardDebtBox.value = userRewardDebt
    }

    this.totalStaked.value = this.totalStaked.value - amount

    itxn.payment({
      receiver: userKey,
      amount: amount,
    }).submit()

    if (pending > 0) {
      itxn.payment({
        receiver: userKey,
        amount: pending,
      }).submit()
    }
  }

  @abimethod()
  claimRewards(): uint64 {
    assert(this.poolActive.value === 1 as uint64)
    this.updatePool()

    const userKey = Txn.sender.bytes
    const amountBox = Box<uint64>({ key: concat(userKey, Bytes('_amount')) })
    const rewardDebtBox = Box<uint64>({ key: concat(userKey, Bytes('_rewardDebt')) })

    assert(amountBox.exists)
    let amount: uint64 = amountBox.value
    let rewardDebt: uint64 = rewardDebtBox.exists ? rewardDebtBox.value : 0 as uint64
    const pending: uint64 = (amount * this.accRewardPerShare.value) / SCALE > rewardDebt ? (amount * this.accRewardPerShare.value) / SCALE - rewardDebt : 0 as uint64

    if (pending > 0) {
      rewardDebt = (amount * this.accRewardPerShare.value) / SCALE
      rewardDebtBox.value = rewardDebt
      itxn.payment({
        receiver: userKey,
        amount: pending,
      }).submit()
    }
    return pending
  }

  @abimethod()
  emergencyWithdraw(): void {
    const userKey = Txn.sender.bytes
    const amountBox = Box<uint64>({ key: concat(userKey, Bytes('_amount')) })
    assert(amountBox.exists)
    const amount: uint64 = amountBox.value
    amountBox.delete()
    Box<uint64>({ key: concat(userKey, Bytes('_rewardDebt')) }).delete()
    Box<uint64>({ key: concat(userKey, Bytes('_lastStakeTime')) }).delete()
    this.totalStaked.value = this.totalStaked.value - amount
    itxn.payment({
      receiver: userKey,
      amount: amount,
    }).submit()
  }

  // View functions
  getUserStake(user: bytes): [uint64, uint64, uint64] {
    const amountBox = Box<uint64>({ key: concat(user, Bytes('_amount')) })
    const rewardDebtBox = Box<uint64>({ key: concat(user, Bytes('_rewardDebt')) })
    const lastStakeTimeBox = Box<uint64>({ key: concat(user, Bytes('_lastStakeTime')) })
    return [
      amountBox.exists ? amountBox.value : 0 as uint64,
      rewardDebtBox.exists ? rewardDebtBox.value : 0 as uint64,
      lastStakeTimeBox.exists ? lastStakeTimeBox.value : 0 as uint64
    ]
  }

  getPendingRewards(user: bytes): uint64 {
    const amountBox = Box<uint64>({ key: concat(user, Bytes('_amount')) })
    const rewardDebtBox = Box<uint64>({ key: concat(user, Bytes('_rewardDebt')) })
    if (!amountBox.exists) {
      return 0 as uint64
    }
    let amount: uint64 = amountBox.value
    let rewardDebt: uint64 = rewardDebtBox.exists ? rewardDebtBox.value : 0 as uint64
    let accRewardPerShare: uint64 = this.accRewardPerShare.value
    if (this.totalStaked.value > 0) {
      const currentTime = Global.latestTimestamp
      const timeDiff: uint64 = currentTime > this.lastUpdateTime.value ? currentTime - this.lastUpdateTime.value : 0 as uint64
      if (timeDiff > 0) {
        const reward: uint64 = timeDiff * this.rewardRate.value
        accRewardPerShare = accRewardPerShare + ((reward * SCALE) / this.totalStaked.value as uint64)
      }
    }
    return (amount * accRewardPerShare) / SCALE > rewardDebt ? (amount * accRewardPerShare) / SCALE - rewardDebt : 0 as uint64
  }

  getPoolInfo(): [uint64, uint64, uint64, uint64, uint64, uint64] {
    return [
      this.totalStaked.value,
      this.rewardRate.value,
      this.accRewardPerShare.value,
      this.lastUpdateTime.value,
      this.poolActive.value,
      this.emergencyPaused.value
    ]
  }
}