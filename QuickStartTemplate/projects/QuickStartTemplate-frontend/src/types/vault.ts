export interface StakingPoolData {
  id: string
  assetId: number
  assetName: string
  totalStaked: bigint
  rewardRate: bigint
  apy: number
  participants: number
  minimumStake: bigint
  maxStakePerUser: bigint
  lockupPeriod: number
  earlyWithdrawPenalty: number
  poolActive: boolean
  emergencyPaused: boolean
  lastUpdateTime: number
  maxCapacity?: bigint
}

export interface UserStakeInfo {
  amount: bigint
  rewardDebt: bigint
  lastStakeTime: number
  pendingRewards: bigint
  claimableRewards: bigint
  lockupEndTime?: number
  hasAutoCompound: boolean
  stakedAmount: bigint
}

export interface RewardHistory {
  timestamp: number
  type: 'stake' | 'unstake' | 'claim' | 'compound'
  amount: bigint
  txId: string
  blockHeight: number
}

export interface PoolMetrics {
  tvl: bigint
  volume24h: bigint
  fees24h: bigint
  utilization: number
  efficiency: number
  riskScore: number
  performance7d: number
  performance30d: number
}

export interface VaultPosition {
  poolId: string
  stakedAmount: bigint
  currentValue: bigint
  totalRewards: bigint
  unrealizedGains: bigint
  apy: number
  allocation: number // Percentage of total portfolio
}

export interface CompoundSettings {
  enabled: boolean
  frequency: number // Minimum time between compounds in seconds
  threshold: bigint // Minimum reward amount to trigger compound
  maxGasFee: bigint // Maximum gas fee willing to pay
  slippageTolerance: number // Slippage tolerance in basis points
}

export interface TransactionStatus {
  id: string
  type: 'stake' | 'unstake' | 'claim' | 'compound' | 'governance'
  status: 'pending' | 'confirmed' | 'failed'
  txId?: string
  amount?: bigint
  timestamp: number
  error?: string
}

export enum PoolStatus {
  Active = 'active',
  Paused = 'paused',
  Deprecated = 'deprecated',
  Emergency = 'emergency',
}

export interface PoolTemplate {
  id: string
  name: string
  description: string
  features: string[]
  baseAPY: number
  riskLevel: 'low' | 'medium' | 'high'
  lockupRequired: boolean
  autoCompoundAvailable: boolean
  governanceEnabled: boolean
}

export interface YieldProjection {
  timeframe: '1d' | '7d' | '30d' | '1y'
  projectedReturn: bigint
  compoundedReturn: bigint
  fees: bigint
  netReturn: bigint
  confidence: number // 0-100
}

export interface PortfolioSummary {
  totalValue: bigint
  totalStaked: bigint
  totalRewards: bigint
  totalUnrealizedGains: bigint
  averageAPY: number
  positions: VaultPosition[]
  riskScore: number
}

export interface StakingFormData {
  amount: string
  selectedPool: string
  enableAutoCompound: boolean
  compoundSettings?: CompoundSettings
  acceptTerms: boolean
}

export interface WithdrawFormData {
  amount: string
  withdrawAll: boolean
  emergencyWithdraw: boolean
  acceptPenalty: boolean
}

// Event types for real-time updates
export interface VaultEvent {
  type: 'stake' | 'unstake' | 'reward' | 'compound' | 'emergency'
  poolId: string
  user?: string
  amount?: bigint
  timestamp: number
  txId?: string
}

// Chart data types
export interface ChartDataPoint {
  timestamp: number
  value: number
  volume?: number
  apy?: number
}

export interface TVLData {
  current: bigint
  change24h: bigint
  changePercent24h: number
  history: ChartDataPoint[]
  breakdown: {
    poolId: string
    poolName: string
    tvl: bigint
    percentage: number
  }[]
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface PoolAnalytics {
  totalValueLocked: bigint
  volume24h: bigint
  volume7d: bigint
  fees24h: bigint
  fees7d: bigint
  uniqueUsers24h: number
  uniqueUsers7d: number
  averageStakeSize: bigint
  medianStakeSize: bigint
  stakingDistribution: {
    range: string
    count: number
    percentage: number
  }[]
}

// Filter and sorting types
export interface PoolFilter {
  minAPY?: number
  maxAPY?: number
  minTVL?: bigint
  maxTVL?: bigint
  assetTypes?: string[]
  riskLevels?: string[]
  features?: string[]
  status?: PoolStatus[]
}

export interface PoolSortOption {
  field: 'apy' | 'tvl' | 'volume' | 'participants' | 'created'
  direction: 'asc' | 'desc'
}

// Notification types
export interface NotificationData {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  actionRequired?: boolean
  relatedPool?: string
  relatedTx?: string
}

// Additional types referenced by components
export interface UserStakeData {
  poolId: string
  stakedAmount: bigint
  rewardDebt: bigint
  lastStakeTime: number
  pendingRewards: bigint
  claimableRewards: bigint
  lockupEndTime?: number
  hasAutoCompound: boolean
}

// Extended pool data with additional fields
export interface ExtendedStakingPoolData extends StakingPoolData {
  name?: string
  maxCapacity?: bigint
  description?: string
  contractAddress?: string
  auditStatus?: string
  createdAt?: number
}
