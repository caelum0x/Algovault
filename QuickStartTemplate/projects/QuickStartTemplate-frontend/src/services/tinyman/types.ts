// Tinyman SDK Integration Types
// Note: Import types from tinyman-js-sdk when available

export interface TinymanConfig {
  network: 'mainnet' | 'testnet'
  clientName: string
}

export interface Pool {
  id: string
  assetA: { id: number; name: string; symbol: string; decimals: number }
  assetB: { id: number; name: string; symbol: string; decimals: number }
  totalLiquidity: bigint
  reserves: {
    assetA: bigint
    assetB: bigint
  }
}

export interface SwapQuote {
  amountIn: bigint
  amountOut: bigint
  priceImpact: number
  slippage: number
  minimumAmountOut: bigint
  route: Pool[]
  fees: bigint
}

export interface LiquidityQuote {
  pool: Pool
  assetAAmount: bigint
  assetBAmount: bigint
  poolTokenAmount: bigint
  share: number
  priceImpact: number
}

export interface PoolAnalytics {
  pool: Pool
  totalLiquidity: bigint
  volume24h: bigint
  volume7d: bigint
  fees24h: bigint
  apy: number
  utilization: number
  impermanentLoss: number
  riskScore: number
}

export interface AISwapStrategy {
  type: 'optimal-timing' | 'dca' | 'limit-order' | 'twap'
  parameters: {
    targetPrice?: number
    timeframe?: number
    frequency?: number
    maxSlippage?: number
    splitTrades?: boolean
  }
  aiRecommendation: string
  confidence: number
}

export interface AILiquidityStrategy {
  type: 'optimal-range' | 'rebalancing' | 'yield-farming' | 'il-protection'
  parameters: {
    priceRange?: [number, number]
    rebalanceThreshold?: number
    targetApy?: number
    maxImpermanentLoss?: number
  }
  aiRecommendation: string
  confidence: number
  expectedYield: number
}

export interface MarketIntelligence {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  priceDirection: 'up' | 'down' | 'sideways'
  volatility: 'low' | 'medium' | 'high'
  liquidityFlow: 'inflow' | 'outflow' | 'stable'
  recommendations: string[]
  confidence: number
  lastUpdated: Date
}

export interface TradingOpportunity {
  type: 'arbitrage' | 'yield-farming' | 'momentum' | 'mean-reversion'
  description: string
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  timeframe: string
  requiredActions: string[]
  confidence: number
}

export interface AIPortfolioSuggestion {
  allocations: {
    assetId: number
    symbol: string
    percentage: number
    reasoning: string
  }[]
  expectedApy: number
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  rebalanceFrequency: 'weekly' | 'monthly' | 'quarterly'
  totalValue: bigint
  aiReasoning: string
}