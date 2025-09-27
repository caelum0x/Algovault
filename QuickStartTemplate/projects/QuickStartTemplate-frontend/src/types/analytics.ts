export interface AnalyticsTimeframe {
  label: string
  value: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all'
  seconds: number
}

export interface ChartDataPoint {
  timestamp: number
  value: number
  volume?: number
  count?: number
  [key: string]: number | undefined
}

export interface TVLChart {
  current: bigint
  change24h: bigint
  changePercent24h: number
  data: ChartDataPoint[]
}

export interface VolumeChart {
  total24h: bigint
  change24h: bigint
  changePercent24h: number
  data: ChartDataPoint[]
}

export interface APYChart {
  current: number
  average: number
  high: number
  low: number
  data: ChartDataPoint[]
}

export interface UserGrowthChart {
  total: number
  new24h: number
  active24h: number
  data: ChartDataPoint[]
}

export interface PoolPerformanceMetrics {
  poolId: string
  poolName: string
  tvl: bigint
  apy: number
  volume24h: bigint
  users: number
  efficiency: number
  riskScore: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  returns: {
    '24h': number
    '7d': number
    '30d': number
    '90d': number
    '1y': number
  }
}

export interface PlatformMetrics {
  totalValueLocked: bigint
  totalVolume24h: bigint
  totalUsers: number
  totalPools: number
  averageAPY: number
  totalRewardsDistributed: bigint
  protocolRevenue24h: bigint
  marketShare: number
}

export interface UserAnalytics {
  address: string
  firstInteraction: number
  totalDeposited: bigint
  totalWithdrawn: bigint
  currentBalance: bigint
  totalRewards: bigint
  transactionCount: number
  activePools: number
  averageStakingPeriod: number
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  profitLoss: {
    realized: bigint
    unrealized: bigint
    total: bigint
    percentage: number
  }
}

export interface ProtocolHealth {
  score: number // 0-100
  factors: {
    tvlStability: number
    userGrowth: number
    poolDiversification: number
    rewardSustainability: number
    securityScore: number
  }
  alerts: {
    level: 'info' | 'warning' | 'critical'
    message: string
    timestamp: number
  }[]
}

export interface MarketComparison {
  protocol: string
  tvl: bigint
  apy: number
  pools: number
  users: number
  marketShare: number
  rank: number
}

export interface YieldFarmingMetrics {
  totalFarmers: number
  averageYield: number
  topPerformingPools: {
    poolId: string
    name: string
    apy: number
    tvl: bigint
  }[]
  yieldDistribution: {
    range: string
    count: number
    percentage: number
  }[]
}

export interface RiskMetrics {
  portfolioRisk: number
  concentrationRisk: number
  liquidityRisk: number
  smartContractRisk: number
  marketRisk: number
  riskAdjustedReturn: number
  valueAtRisk: {
    '95%': bigint
    '99%': bigint
  }
  expectedShortfall: bigint
}

export interface CorrelationMatrix {
  pools: string[]
  correlations: number[][]
  riskFactors: {
    pool: string
    beta: number
    alpha: number
    volatility: number
  }[]
}

export interface FlowAnalysis {
  inflows: {
    total24h: bigint
    byPool: { poolId: string; amount: bigint }[]
    byUser: { user: string; amount: bigint }[]
  }
  outflows: {
    total24h: bigint
    byPool: { poolId: string; amount: bigint }[]
    byUser: { user: string; amount: bigint }[]
  }
  netFlow: bigint
  flowTrend: ChartDataPoint[]
}

export interface GeographicAnalytics {
  regions: {
    name: string
    users: number
    tvl: bigint
    percentage: number
  }[]
  timezoneActivity: {
    hour: number
    activity: number
  }[]
}

export interface FeatureUsage {
  autoCompound: {
    enabled: number
    disabled: number
    adoptionRate: number
  }
  governance: {
    voters: number
    totalPower: bigint
    participationRate: number
  }
  emergencyWithdrawals: {
    count24h: number
    volume24h: bigint
  }
}

// Component Props Types
export interface TVLDashboardProps {
  timeframe: AnalyticsTimeframe
  onTimeframeChange: (timeframe: AnalyticsTimeframe) => void
}

export interface YieldChartProps {
  poolId?: string
  timeframe: AnalyticsTimeframe
  showComparison?: boolean
  onTimeframeChange: (timeframe: AnalyticsTimeframe) => void
}

export interface PoolMetricsProps {
  poolId: string
  compareWith?: string[]
}

export interface AnalyticsDashboardProps {
  userAddress?: string
  adminView?: boolean
}

// Chart Configuration Types
export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter'
  title: string
  description?: string
  yAxisLabel?: string
  xAxisLabel?: string
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  interactive?: boolean
  height?: number
}

export interface MetricCard {
  title: string
  value: string | number | bigint
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  trend?: ChartDataPoint[]
  format?: 'currency' | 'percentage' | 'number' | 'bigint'
  precision?: number
}

// Alert and Monitoring Types
export interface AnalyticsAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'trend'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  metric: string
  threshold?: number
  currentValue: number
  timestamp: number
  acknowledged: boolean
  resolvedAt?: number
}

export interface MonitoringConfig {
  alerts: {
    tvlDropThreshold: number
    apyDropThreshold: number
    volumeSpikeThreshold: number
    userDropThreshold: number
    poolConcentrationThreshold: number
  }
  refreshInterval: number
  dataRetention: number
}

// Export and Reporting Types
export interface ReportConfig {
  timeframe: AnalyticsTimeframe
  metrics: string[]
  pools?: string[]
  format: 'pdf' | 'csv' | 'json'
  email?: string
}

export interface ExportData {
  timestamp: number
  data: any
  format: string
  size: number
  downloadUrl: string
  expiresAt: number
}

// Real-time Analytics Types
export interface RealTimeMetrics {
  activeSessions: number
  transactionsPerSecond: number
  currentGasPrice: number
  networkLatency: number
  errorRate: number
  systemLoad: number
  lastUpdate: number
}

export interface StreamingData {
  type: 'tvl' | 'volume' | 'price' | 'users' | 'transactions'
  value: number
  timestamp: number
  poolId?: string
}

// Performance Analytics
export interface PerformanceBenchmark {
  metric: string
  current: number
  target: number
  benchmark: number
  percentile: number
  trend: 'improving' | 'declining' | 'stable'
}
