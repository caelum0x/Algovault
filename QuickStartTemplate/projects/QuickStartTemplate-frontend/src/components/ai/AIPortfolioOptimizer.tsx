import React, { useState, useEffect } from 'react'
import {
  AiOutlineRobot,
  AiOutlinePieChart,
  AiOutlineReload,
  //AiOutlineWarning,
  AiOutlineWarning,
  AiOutlineIe,
  AiOutlineInfoCircle,
  AiOutlineDollar,
  AiOutlineCalculator,
} from 'react-icons/ai'
import { BsCoin, BsGraphUp, BsPieChart } from 'react-icons/bs'
import { useAIAnalytics } from '../../hooks/useAIAnalytics'
import { StakingPoolData, UserStakeData } from '../../types/vault'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface AIPortfolioOptimizerProps {
  pools: StakingPoolData[]
  userStakes: UserStakeData[]
  onOptimizationComplete?: (optimization: any) => void
}

interface OptimizationSettings {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  additionalInvestment: number
  timeHorizon: number
  rebalanceFrequency: 'weekly' | 'monthly' | 'quarterly'
}

export default function AIPortfolioOptimizer({ pools, userStakes, onOptimizationComplete }: AIPortfolioOptimizerProps) {
  const { portfolioOptimization, loadingOptimization, optimizePortfolio, error } = useAIAnalytics()

  const [settings, setSettings] = useState<OptimizationSettings>({
    riskTolerance: 'moderate',
    additionalInvestment: 1000,
    timeHorizon: 6,
    rebalanceFrequency: 'monthly',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const generateOptimization = async () => {
    if (!pools.length) return

    const currentAllocations = userStakes.map((stake) => {
      const pool = pools.find((p) => p.id === stake.poolId)
      return {
        poolId: stake.poolId,
        amount: stake.stakedAmount,
        apy: pool?.apy || 0,
        risk: calculatePoolRisk(pool),
      }
    })

    // Add available pools that user isn't in
    const unstakedPools = pools
      .filter((pool) => !userStakes.find((stake) => stake.poolId === pool.id))
      .map((pool) => ({
        poolId: pool.id,
        amount: 0n,
        apy: pool.apy,
        risk: calculatePoolRisk(pool),
      }))

    await optimizePortfolio({
      currentAllocations: [...currentAllocations, ...unstakedPools],
      riskTolerance: settings.riskTolerance,
      investmentAmount: settings.additionalInvestment,
      timeHorizon: settings.timeHorizon,
    })
  }

  const calculatePoolRisk = (pool?: StakingPoolData): number => {
    if (!pool) return 5

    let risk = 5 // Base risk

    // Adjust based on pool size (larger = safer)
    const poolSizeUSD = Number(pool.totalStaked) * 0.25 // Assume 1 ALGO = $0.25
    if (poolSizeUSD > 1000000) risk -= 1
    if (poolSizeUSD > 10000000) risk -= 1

    // Adjust based on APY (higher APY = higher risk)
    if (pool.apy > 15) risk += 2
    else if (pool.apy > 10) risk += 1
    else if (pool.apy < 5) risk -= 1

    return Math.max(1, Math.min(10, risk))
  }

  const getRiskToleranceColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return 'text-blue-400'
      case 'moderate':
        return 'text-green-400'
      case 'aggressive':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRiskToleranceIcon = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative':
        return <AiOutlineIe />
      case 'moderate':
        return <BsCoin />
      case 'aggressive':
        return <AiOutlineWarning />
      default:
        return <AiOutlineInfoCircle />
    }
  }

  const currentPortfolioValue = userStakes.reduce((total, stake) => total + Number(stake.stakedAmount), 0) / 1e6

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <AiOutlinePieChart className="text-xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">AI Portfolio Optimizer</h3>
            <p className="text-sm text-gray-400">ML-powered allocation recommendations</p>
          </div>
        </div>

        <button
          onClick={generateOptimization}
          disabled={loadingOptimization}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loadingOptimization ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <AiOutlineRobot />
              Optimize Portfolio
            </>
          )}
        </button>
      </div>

      {/* Current Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AiOutlineDollar className="text-green-400" />
            <span className="text-sm text-gray-400">Current Value</span>
          </div>
          <div className="text-xl font-bold text-gray-200">{formatLargeNumber(currentPortfolioValue)} ALGO</div>
        </div>

        <div className="bg-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BsPieChart className="text-blue-400" />
            <span className="text-sm text-gray-400">Active Pools</span>
          </div>
          <div className="text-xl font-bold text-gray-200">{userStakes.length}</div>
        </div>

        <div className="bg-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BsGraphUp className="text-purple-400" />
            <span className="text-sm text-gray-400">Avg APY</span>
          </div>
          <div className="text-xl font-bold text-gray-200">
            {userStakes.length > 0
              ? (
                  userStakes.reduce((sum, stake) => {
                    const pool = pools.find((p) => p.id === stake.poolId)
                    return sum + (pool?.apy || 0)
                  }, 0) / userStakes.length
                ).toFixed(2)
              : '0.00'}
            %
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="bg-neutral-700/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-300">Optimization Settings</h4>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            {showAdvanced ? 'Basic' : 'Advanced'} Settings
          </button>
        </div>

        <div className="space-y-4">
          {/* Risk Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-2">
              {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setSettings((prev) => ({ ...prev, riskTolerance: risk }))}
                  className={`p-3 rounded-lg text-center transition-all duration-300 ${
                    settings.riskTolerance === risk
                      ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                      : 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:border-neutral-500'
                  }`}
                >
                  <div className={`text-lg mb-1 ${getRiskToleranceColor(risk)}`}>{getRiskToleranceIcon(risk)}</div>
                  <div className="text-xs font-medium capitalize">{risk}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Investment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Additional Investment (ALGO)</label>
              <div className="relative">
                <AiOutlineCalculator className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={settings.additionalInvestment}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      additionalInvestment: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-green-500"
                  placeholder="1000"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Horizon (months)</label>
              <select
                value={settings.timeHorizon}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    timeHorizon: parseInt(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-green-500"
              >
                <option value={1}>1 Month</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year</option>
                <option value={24}>2 Years</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rebalancing Frequency</label>
              <select
                value={settings.rebalanceFrequency}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    rebalanceFrequency: e.target.value as 'weekly' | 'monthly' | 'quarterly',
                  }))
                }
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-green-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AiOutlineWarning />
            <span className="font-medium">Optimization Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loadingOptimization && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">AI is analyzing your portfolio and market conditions...</p>
        </div>
      )}

      {/* Optimization Results */}
      {portfolioOptimization && !loadingOptimization && (
        <div className="space-y-6">
          {/* Portfolio Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Expected APY</div>
              <div className="text-xl font-bold text-green-400">
                {portfolioOptimization.portfolioMetrics?.expectedApy?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="bg-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Risk Score</div>
              <div className="text-xl font-bold text-yellow-400">
                {portfolioOptimization.portfolioMetrics?.riskScore?.toFixed(1) || '0.0'}/10
              </div>
            </div>
            <div className="bg-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
              <div className="text-xl font-bold text-blue-400">
                {portfolioOptimization.portfolioMetrics?.sharpeRatio?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="bg-neutral-700/50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Diversification</div>
              <div className="text-xl font-bold text-purple-400">
                {portfolioOptimization.portfolioMetrics?.diversificationScore?.toFixed(0) || '0'}%
              </div>
            </div>
          </div>

          {/* Allocation Recommendations */}
          {portfolioOptimization.recommendations && (
            <div className="bg-neutral-700/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <AiOutlinePieChart />
                Recommended Allocations
              </h4>
              <div className="space-y-3">
                {portfolioOptimization.recommendations.map((rec: any, index: number) => {
                  const pool = pools.find((p) => p.id === rec.poolId)
                  return (
                    <div key={index} className="bg-neutral-600/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-200">{/* {pool?.name || `Pool ${rec.poolId}`} */}</div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              rec.riskLevel <= 3
                                ? 'bg-green-500/20 text-green-400'
                                : rec.riskLevel <= 6
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            Risk: {rec.riskLevel}/10
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-200">{rec.recommendedAllocation}%</div>
                          <div className="text-xs text-gray-400">{rec.expectedReturn?.toFixed(2)}% APY</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{rec.reasoning}</p>

                      {/* Allocation Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${rec.recommendedAllocation}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Warnings */}
          {portfolioOptimization.warnings && portfolioOptimization.warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <AiOutlineWarning />
                Warnings
              </h4>
              <div className="space-y-2">
                {portfolioOptimization.warnings.map((warning: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-yellow-300">
                    <AiOutlineInfoCircle className="mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {portfolioOptimization.opportunities && portfolioOptimization.opportunities.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <AiOutlineWarning />
                Opportunities
              </h4>
              <div className="space-y-2">
                {portfolioOptimization.opportunities.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-blue-300">
                    <AiOutlineWarning className="mt-0.5 flex-shrink-0" />
                    <span>{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {!portfolioOptimization && !loadingOptimization && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AiOutlinePieChart className="text-2xl text-green-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">Optimize Your Portfolio</h4>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Get AI-powered recommendations to maximize your returns while managing risk based on your preferences.
          </p>
        </div>
      )}
    </div>
  )
}
