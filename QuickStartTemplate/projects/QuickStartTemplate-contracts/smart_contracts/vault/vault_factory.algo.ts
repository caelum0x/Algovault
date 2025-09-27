import { assert, Box, bytes, Contract, GlobalState, uint64, abimethod, Txn, Global, Bytes, itxn, compile } from '@algorandfoundation/algorand-typescript'

// Helper to concatenate two bytes values for box keys
function concat(a: bytes, b: bytes): bytes {
  return a.concat(b)
}

// Helper to convert uint64 to bytes for box keys
function uint64ToBytes(x: uint64): bytes {
  return Bytes(x)
}

// PoolStatus enum replacement
const POOL_STATUS_ACTIVE: uint64 = 0;
const POOL_STATUS_PAUSED: uint64 = 1;
const POOL_STATUS_DEPRECATED: uint64 = 2;
const POOL_STATUS_EMERGENCY: uint64 = 3;

interface PoolInfo {
  id: uint64
  assetId: uint64
  stakingContract: bytes
  rewardDistributor: bytes
  autoCompounder: bytes
  governanceVault: bytes
  creator: bytes
  createdAt: uint64
  status: uint64
  totalStaked: uint64
  totalRewards: uint64
  participantCount: uint64
  apy: uint64
  minimumStake: uint64
  maxStakePerUser: uint64
  lockupPeriod: uint64
  earlyWithdrawPenalty: uint64
}

interface PoolTemplate {
  name: bytes // changed from string to bytes
  stakingContractTemplate: bytes
  rewardDistributorTemplate: bytes
  autoCompounderTemplate: bytes
  defaultParameters: bytes
}

export class VaultFactory extends Contract {
  // Global factory state
  poolCount = GlobalState<uint64>()
  totalTVL = GlobalState<uint64>()
  factoryOwner = GlobalState<bytes>()
  
  // Factory configuration
  poolCreationFee = GlobalState<uint64>()
  factoryFeeRate = GlobalState<uint64>() // Fee percentage from all pools
  feeCollector = GlobalState<bytes>()
  
  // Pool management
  maxPoolsPerUser = GlobalState<uint64>()
  minimumInitialStake = GlobalState<uint64>()
  factoryActive = GlobalState<boolean>()
  
  // Template management
  templateCount = GlobalState<uint64>()
  defaultTemplate = GlobalState<uint64>()
  
  // Security and governance
  emergencyPause = GlobalState<boolean>()
  governanceContract = GlobalState<bytes>()

  @abimethod()
  initialize(
    poolCreationFee: uint64,
    factoryFeeRate: uint64,
    feeCollector: bytes,
    maxPoolsPerUser: uint64,
    minimumInitialStake: uint64
  ): void {
    assert(!this.factoryActive.value)
    this.poolCount.value = 0
    this.totalTVL.value = 0
    this.factoryOwner.value = Txn.sender.bytes
    this.poolCreationFee.value = poolCreationFee
    this.factoryFeeRate.value = factoryFeeRate
    this.feeCollector.value = feeCollector
    this.maxPoolsPerUser.value = maxPoolsPerUser
    this.minimumInitialStake.value = minimumInitialStake
    this.factoryActive.value = true
    this.emergencyPause.value = false
    this.templateCount.value = 0
    this.defaultTemplate.value = 0
  }

  @abimethod()
  createPool(
    assetId: uint64,
    initialRewardPool: uint64,
    rewardRate: uint64,
    minimumStake: uint64,
    maxStakePerUser: uint64,
    lockupPeriod: uint64,
    earlyWithdrawPenalty: uint64,
    templateId: uint64
  ): uint64 {
    assert(this.factoryActive.value)
    assert(!this.emergencyPause.value)
    // Payment transaction must be in the group (see previous comment)
    assert(initialRewardPool >= this.minimumInitialStake.value)
    const userPoolsKey = Box<uint64>({ key: Txn.sender.bytes })
    const userPools: uint64 = userPoolsKey.exists ? userPoolsKey.value : 0
    assert(userPools < this.maxPoolsPerUser.value)
    const poolId: uint64 = this.poolCount.value + 1
    this.poolCount.value = poolId
    
    // In a real implementation, we would deploy the associated contracts here using inner transactions.
    // However, for this to work, we would need to have access to the compiled approval/clear programs
    // of the staking pool, reward distributor, etc.
    // 
    // A real implementation would:
    // 1. Use itxn.applicationCall to create new applications
    // 2. Pass the appropriate initialization parameters
    // 3. Store the created app IDs for later reference
    
    // For now, we'll store placeholder addresses - a complete implementation would:
    // const stakingApp = itxn.applicationCall({
    //   approvalProgram: compiledStakingProgram,
    //   clearStateProgram: compiledClearProgram,
    //   appArgs: [Bytes('initialize'), ...],
    //   onCreate: OnApplicationCallType.create,
    // }).submit()
    
    const stakingContract = Txn.sender.bytes // Placeholder - would be actual app ID
    const rewardDistributor = Txn.sender.bytes // Placeholder - would be actual app ID
    const autoCompounder = Txn.sender.bytes // Placeholder - would be actual app ID
    const governanceVault = Txn.sender.bytes // Store each PoolInfo field in a separate box
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_assetId')) }).value = assetId
    Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_stakingContract')) }).value = stakingContract
    Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_rewardDistributor')) }).value = rewardDistributor
    Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_autoCompounder')) }).value = autoCompounder
    Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_governanceVault')) }).value = governanceVault
    Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_creator')) }).value = Txn.sender.bytes
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_createdAt')) }).value = Global.latestTimestamp
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_status')) }).value = POOL_STATUS_ACTIVE
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value = 0
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalRewards')) }).value = initialRewardPool
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_participantCount')) }).value = 0
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_apy')) }).value = 0
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_minimumStake')) }).value = minimumStake
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_maxStakePerUser')) }).value = maxStakePerUser
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_lockupPeriod')) }).value = lockupPeriod
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_earlyWithdrawPenalty')) }).value = earlyWithdrawPenalty
    userPoolsKey.value = userPools + 1 as uint64
    this.totalTVL.value = this.totalTVL.value + initialRewardPool
    return poolId
  }

  @abimethod()
  updatePoolStatus(poolId: uint64, newStatus: uint64): void {
    // Update only the status field in the box
    const statusKey = concat(uint64ToBytes(poolId), Bytes('_status'))
    const oldStatus = Box<uint64>({ key: statusKey }).value
    Box<uint64>({ key: statusKey }).value = newStatus
    // If pool is being paused or deprecated, subtract its staked value from TVL
    if ((oldStatus === POOL_STATUS_ACTIVE) && (newStatus === POOL_STATUS_PAUSED || newStatus === POOL_STATUS_DEPRECATED)) {
      const staked = Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value
      this.totalTVL.value = this.totalTVL.value - staked
    }
    // If pool is being re-activated, add its staked value back
    if ((oldStatus !== POOL_STATUS_ACTIVE) && (newStatus === POOL_STATUS_ACTIVE)) {
      const staked = Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value
      this.totalTVL.value = this.totalTVL.value + staked
    }
  }

  @abimethod()
  updatePoolMetrics(poolId: uint64, totalStaked: uint64, totalRewards: uint64, participantCount: uint64, apy: uint64): void {
    // Update only the relevant fields in the boxes
    const oldStaked = Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value = totalStaked
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalRewards')) }).value = totalRewards
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_participantCount')) }).value = participantCount
    Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_apy')) }).value = apy
    this.totalTVL.value = this.totalTVL.value - oldStaked + totalStaked
  }

  @abimethod()
  addPoolTemplate(
    name: bytes,
    stakingTemplate: bytes,
    distributorTemplate: bytes,
    compounderTemplate: bytes,
    defaultParams: bytes
  ): uint64 {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    const templateId: uint64 = this.templateCount.value + 1
    this.templateCount.value = templateId
    // Store each field as a separate box
    Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_name')) }).value = name
    Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_stakingContractTemplate')) }).value = stakingTemplate
    Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_rewardDistributorTemplate')) }).value = distributorTemplate
    Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_autoCompounderTemplate')) }).value = compounderTemplate
    Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_defaultParameters')) }).value = defaultParams
    if (templateId === 1 as uint64) {
      this.defaultTemplate.value = templateId
    }
    return templateId
  }

  @abimethod()
  setDefaultTemplate(templateId: uint64): void {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    // Check existence by checking one field
    assert(Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_name')) }).exists)
    this.defaultTemplate.value = templateId
  }

  @abimethod()
  updateFactorySettings(
    newCreationFee: uint64,
    newFactoryFee: uint64,
    newMaxPools: uint64,
    newMinStake: uint64
  ): void {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    
    this.poolCreationFee.value = newCreationFee
    this.factoryFeeRate.value = newFactoryFee
    this.maxPoolsPerUser.value = newMaxPools
    this.minimumInitialStake.value = newMinStake
  }

  @abimethod()
  emergencyPauseFactory(): void {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    
    this.emergencyPause.value = true
  }

  @abimethod()
  resumeFactory(): void {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    
    this.emergencyPause.value = false
  }

  @abimethod()
  setGovernanceContract(governanceAddr: bytes): void {
    assert(Txn.sender.bytes === this.factoryOwner.value)
    
    this.governanceContract.value = governanceAddr
  }

  // View functions
  @abimethod()
  getPoolInfo(poolId: uint64): [uint64, uint64, bytes, bytes, bytes, bytes, bytes, uint64, uint64, uint64, uint64, uint64, uint64, uint64, uint64, uint64, uint64] {
    // Return tuple of AVM primitives
    return [
      poolId,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_assetId')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_stakingContract')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_rewardDistributor')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_autoCompounder')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_governanceVault')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(poolId), Bytes('_creator')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_createdAt')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_status')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalStaked')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_totalRewards')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_participantCount')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_apy')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_minimumStake')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_maxStakePerUser')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_lockupPeriod')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(poolId), Bytes('_earlyWithdrawPenalty')) }).value
    ]
  }

  @abimethod()
  getTemplate(templateId: uint64): [bytes, bytes, bytes, bytes, bytes] {
    // Return tuple of AVM primitives
    return [
      Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_name')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_stakingContractTemplate')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_rewardDistributorTemplate')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_autoCompounderTemplate')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(templateId), Bytes('_defaultParameters')) }).value
    ]
  }
}