import { ChartDataPoint } from '../../types/analytics'

/**
 * Calculate Annual Percentage Yield (APY) from rate per second
 */
export function calculateAPY(ratePerSecond: bigint): number {
  const secondsPerYear = 31536000
  const rateAsNumber = Number(ratePerSecond) / 1e12 // Convert from scaled integer
  return ((1 + rateAsNumber) ** secondsPerYear - 1) * 100
}

/**
 * Calculate compound interest over time
 */
export function calculateCompoundGrowth(principal: bigint, apy: number, timeInDays: number): bigint {
  const dailyRate = apy / 365 / 100
  const compoundedAmount = Number(principal) * Math.pow(1 + dailyRate, timeInDays)
  return BigInt(Math.floor(compoundedAmount))
}

/**
 * Calculate projected earnings over different time periods
 */
export function calculateProjectedEarnings(
  stakedAmount: bigint,
  apy: number,
): {
  daily: bigint
  weekly: bigint
  monthly: bigint
  yearly: bigint
} {
  const principal = Number(stakedAmount)
  const yearlyReturn = principal * (apy / 100)

  return {
    daily: BigInt(Math.floor(yearlyReturn / 365)),
    weekly: BigInt(Math.floor(yearlyReturn / 52)),
    monthly: BigInt(Math.floor(yearlyReturn / 12)),
    yearly: BigInt(Math.floor(yearlyReturn)),
  }
}

/**
 * Calculate the optimal compound frequency based on gas costs
 */
export function calculateOptimalCompoundFrequency(
  pendingRewards: bigint,
  gasCost: bigint,
  apy: number,
): {
  frequency: number // times per year
  netGain: bigint
  breakEvenTime: number // days
} {
  const rewardsNumber = Number(pendingRewards)
  const gasCostNumber = Number(gasCost)

  // Calculate break-even time where compound gains exceed gas costs
  const dailyRate = apy / 365 / 100
  const breakEvenDays = Math.log(1 + gasCostNumber / rewardsNumber) / Math.log(1 + dailyRate)

  // Optimal frequency is slightly less than daily to account for gas costs
  let optimalFrequency = 365
  if (gasCostNumber > rewardsNumber * 0.01) {
    // If gas is > 1% of rewards
    optimalFrequency = Math.max(1, Math.floor(365 / Math.ceil(breakEvenDays)))
  }

  // Calculate net gain with optimal frequency
  const compoundReturn = rewardsNumber * Math.pow(1 + dailyRate, 365 / optimalFrequency)
  const totalGasCost = gasCostNumber * optimalFrequency
  const netGain = BigInt(Math.floor(compoundReturn - totalGasCost))

  return {
    frequency: optimalFrequency,
    netGain,
    breakEvenTime: breakEvenDays,
  }
}

/**
 * Calculate impermanent loss for LP positions (if applicable)
 */
export function calculateImpermanentLoss(initialPriceRatio: number, currentPriceRatio: number): number {
  const ratio = currentPriceRatio / initialPriceRatio
  const impermanentLoss = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1
  return Math.abs(impermanentLoss) * 100 // Return as percentage
}

/**
 * Calculate Sharpe ratio for risk-adjusted returns
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.02, // Default 2% risk-free rate
): number {
  if (returns.length === 0) return 0

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
  const standardDeviation = Math.sqrt(variance)

  if (standardDeviation === 0) return 0

  return (meanReturn - riskFreeRate) / standardDeviation
}

/**
 * Calculate portfolio diversification metrics
 */
export function calculatePortfolioDiversification(positions: { amount: bigint; correlation: number }[]): {
  diversificationRatio: number
  concentrationRisk: number
  effectivePositions: number
} {
  const totalValue = positions.reduce((sum, pos) => sum + Number(pos.amount), 0)

  if (totalValue === 0) {
    return { diversificationRatio: 0, concentrationRisk: 100, effectivePositions: 0 }
  }

  // Calculate concentration (Herfindahl-Hirschman Index)
  const weights = positions.map((pos) => Number(pos.amount) / totalValue)
  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0)
  const concentrationRisk = hhi * 100

  // Effective number of positions
  const effectivePositions = 1 / hhi

  // Diversification ratio (simplified)
  const averageCorrelation = positions.reduce((sum, pos) => sum + pos.correlation, 0) / positions.length
  const diversificationRatio = (1 - averageCorrelation) * 100

  return {
    diversificationRatio,
    concentrationRisk,
    effectivePositions,
  }
}

/**
 * Calculate Value at Risk (VaR) for a portfolio
 */
export function calculateVaR(
  portfolioValue: bigint,
  volatility: number, // Annual volatility as decimal
  confidenceLevel: number = 0.95,
  timeHorizon: number = 1, // Days
): bigint {
  const z_score = confidenceLevel === 0.95 ? 1.645 : confidenceLevel === 0.99 ? 2.326 : 1.645

  const dailyVolatility = volatility / Math.sqrt(365)
  const scaledVolatility = dailyVolatility * Math.sqrt(timeHorizon)

  const var_amount = Number(portfolioValue) * z_score * scaledVolatility
  return BigInt(Math.floor(var_amount))
}

/**
 * Calculate optimal position sizing using Kelly Criterion
 */
export function calculateKellyPosition(
  winProbability: number,
  averageWin: number,
  averageLoss: number,
  portfolioValue: bigint,
): {
  kellyPercentage: number
  recommendedPosition: bigint
  riskLevel: 'low' | 'medium' | 'high'
} {
  const b = averageWin / Math.abs(averageLoss) // Win/loss ratio
  const kelly = (winProbability * (b + 1) - 1) / b

  // Cap Kelly at 25% for safety
  const safeKelly = Math.max(0, Math.min(kelly, 0.25))

  const recommendedPosition = BigInt(Math.floor(Number(portfolioValue) * safeKelly))

  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (safeKelly > 0.15) riskLevel = 'high'
  else if (safeKelly > 0.05) riskLevel = 'medium'

  return {
    kellyPercentage: safeKelly * 100,
    recommendedPosition,
    riskLevel,
  }
}

/**
 * Calculate moving averages for trend analysis
 */
export function calculateMovingAverages(data: ChartDataPoint[], periods: number[] = [7, 30, 90]): { [key: number]: ChartDataPoint[] } {
  const result: { [key: number]: ChartDataPoint[] } = {}

  periods.forEach((period) => {
    result[period] = []

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const average = slice.reduce((sum, point) => sum + point.value, 0) / period

      result[period].push({
        timestamp: data[i].timestamp,
        value: average,
      })
    }
  })

  return result
}

/**
 * Calculate RSI (Relative Strength Index) for momentum analysis
 */
export function calculateRSI(data: ChartDataPoint[], period: number = 14): ChartDataPoint[] {
  if (data.length < period + 1) return []

  const rsi: ChartDataPoint[] = []

  for (let i = period; i < data.length; i++) {
    let gains = 0
    let losses = 0

    for (let j = i - period + 1; j <= i; j++) {
      const change = data[j].value - data[j - 1].value
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsiValue = 100 - 100 / (1 + rs)

    rsi.push({
      timestamp: data[i].timestamp,
      value: rsiValue,
    })
  }

  return rsi
}

/**
 * Calculate Bollinger Bands for volatility analysis
 */
export function calculateBollingerBands(
  data: ChartDataPoint[],
  period: number = 20,
  standardDeviations: number = 2,
): {
  middle: ChartDataPoint[]
  upper: ChartDataPoint[]
  lower: ChartDataPoint[]
} {
  const middle = calculateMovingAverages(data, [period])[period]
  const upper: ChartDataPoint[] = []
  const lower: ChartDataPoint[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const mean = slice.reduce((sum, point) => sum + point.value, 0) / period
    const variance = slice.reduce((sum, point) => sum + Math.pow(point.value - mean, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    const middleIndex = i - period + 1
    if (middleIndex < middle.length) {
      upper.push({
        timestamp: data[i].timestamp,
        value: middle[middleIndex].value + standardDeviations * stdDev,
      })

      lower.push({
        timestamp: data[i].timestamp,
        value: middle[middleIndex].value - standardDeviations * stdDev,
      })
    }
  }

  return { middle, upper, lower }
}

/**
 * Format large numbers for display
 */
export function formatLargeNumber(value: bigint | number, decimals: number = 2, suffix: boolean = true): string {
  const num = typeof value === 'bigint' ? Number(value) : value

  if (num >= 1e12) {
    return (num / 1e12).toFixed(decimals) + (suffix ? 'T' : '')
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + (suffix ? 'B' : '')
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + (suffix ? 'M' : '')
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + (suffix ? 'K' : '')
  } else {
    return num.toFixed(decimals)
  }
}

/**
 * Convert microAlgos to Algos
 */
export function microAlgosToAlgos(microAlgos: bigint): number {
  return Number(microAlgos) / 1e6
}

/**
 * Convert Algos to microAlgos
 */
export function algosToMicroAlgos(algos: number): bigint {
  return BigInt(Math.floor(algos * 1e6))
}
