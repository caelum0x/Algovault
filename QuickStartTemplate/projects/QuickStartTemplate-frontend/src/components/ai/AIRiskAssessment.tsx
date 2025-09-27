import React, { useState, useEffect } from 'react'
import {
  AiOutlineIe,
  AiOutlineWarning,
  AiOutlineInfoCircle,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
  AiOutlineReload,
  AiOutlineRobot,
  AiOutlineEye,
  AiOutlineBarChart,
} from 'react-icons/ai'
import { BsShield, BsGraphDown, BsGraphUp, BsExclamationTriangle } from 'react-icons/bs'
import { useAIAnalytics } from '../../hooks/useAIAnalytics'
import { StakingPoolData } from '../../types/vault'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface AIRiskAssessmentProps {
  poolData: StakingPoolData
  marketData?: {
    algoPrice: number
    marketVolatility: number
    defiTvl: number
  }
  onAssessmentComplete?: (assessment: any) => void
}

interface RiskLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  color: string
  bgColor: string
  icon: React.ReactNode
  description: string
}

const riskLevels: Record<string, RiskLevel> = {
  low: {
    level: 'low',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
    icon: <AiOutlineCheckCircle />,
    description: 'Low risk with stable returns',
  },
  medium: {
    level: 'medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    icon: <AiOutlineInfoCircle />,
    description: 'Moderate risk requiring attention',
  },
  high: {
    level: 'high',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    icon: <AiOutlineWarning />,
    description: 'High risk with potential issues',
  },
  critical: {
    level: 'critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    icon: <AiOutlineExclamationCircle />,
    description: 'Critical risk requiring immediate attention',
  },
}

export default function AIRiskAssessment({
  poolData,
  marketData = {
    algoPrice: 0.25,
    marketVolatility: 15.5,
    defiTvl: 2500,
  },
  onAssessmentComplete,
}: AIRiskAssessmentProps) {
  const { riskAssessment, loadingRisk, assessRisk, error } = useAIAnalytics()

  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Auto-generate assessment when pool data changes
  useEffect(() => {
    if (poolData && poolData.totalStaked > 0n) {
      generateAssessment()
    }
  }, [poolData.id])

  // Auto-refresh every 10 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(
        () => {
          generateAssessment()
        },
        10 * 60 * 1000,
      ) // 10 minutes

      return () => clearInterval(interval)
    }
    return undefined
  }, [autoRefresh])

  const generateAssessment = async () => {
    if (!poolData) return

    const contractAge = Math.floor((Date.now() - 1640995200000) / (1000 * 60 * 60 * 24)) // Days since Jan 1, 2022
    const volatility = calculateVolatility(poolData)
    const liquidityDepth = calculateLiquidityDepth(poolData)

    await assessRisk({
      poolData: {
        totalStaked: poolData.totalStaked,
        volatility,
        liquidityDepth,
        contractAge,
        auditStatus: 'Community Reviewed', // Mock audit status
      },
      marketData,
    })
  }

  const calculateVolatility = (pool: StakingPoolData): number => {
    // Mock volatility calculation based on pool characteristics
    let baseVolatility = 10

    // Higher APY usually means higher volatility
    if (pool.apy > 20) baseVolatility += 15
    else if (pool.apy > 15) baseVolatility += 10
    else if (pool.apy > 10) baseVolatility += 5

    // Smaller pools tend to be more volatile
    const poolSizeUSD = Number(pool.totalStaked) * marketData.algoPrice
    if (poolSizeUSD < 100000) baseVolatility += 10
    else if (poolSizeUSD < 500000) baseVolatility += 5

    return baseVolatility
  }

  const calculateLiquidityDepth = (pool: StakingPoolData): number => {
    // Mock liquidity depth calculation
    const poolSizeUSD = Number(pool.totalStaked) * marketData.algoPrice
    return poolSizeUSD / 1000 // Simplified calculation
  }

  const getRiskLevelInfo = (level?: string): RiskLevel => {
    return riskLevels[level || 'medium'] || riskLevels.medium
  }

  const getRiskCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'smart contract':
      case 'contract':
        return <BsShield />
      case 'liquidity':
        return <BsGraphDown />
      case 'market':
        return <BsGraphUp />
      case 'operational':
        return <AiOutlineBarChart />
      default:
        return <AiOutlineInfoCircle />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-400'
    if (score <= 5) return 'text-yellow-400'
    if (score <= 7) return 'text-orange-400'
    return 'text-red-400'
  }

  const overallRisk = riskAssessment?.overallRisk
  const riskLevelInfo = getRiskLevelInfo(overallRisk?.level)

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <AiOutlineIe className="text-xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">AI Risk Assessment</h3>
            <p className="text-sm text-gray-400">Smart contract & market risk analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-gray-400 hover:text-gray-300'
            }`}
            title="Auto-refresh assessment"
          >
            <AiOutlineReload className={autoRefresh ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={generateAssessment}
            disabled={loadingRisk}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingRisk ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AiOutlineRobot />
                Assess Risk
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AiOutlineWarning />
            <span className="font-medium">Assessment Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loadingRisk && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">AI is analyzing contract security, market conditions, and risk factors...</p>
        </div>
      )}

      {/* Overall Risk Display */}
      {overallRisk && !loadingRisk && (
        <div className="space-y-6">
          {/* Risk Score Card */}
          <div className={`rounded-xl border p-6 ${riskLevelInfo.bgColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl ${riskLevelInfo.color}`}>{riskLevelInfo.icon}</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-200 capitalize">{overallRisk.level} Risk</h4>
                  <p className="text-sm text-gray-400">{riskLevelInfo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getRiskScoreColor(overallRisk.score || 5)}`}>
                  {overallRisk.score?.toFixed(1) || '5.0'}
                </div>
                <div className="text-sm text-gray-400">Risk Score</div>
              </div>
            </div>

            {/* Confidence Meter */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">AI Confidence</span>
                <span
                  className={`font-medium ${
                    (overallRisk.confidence || 0) >= 80
                      ? 'text-green-400'
                      : (overallRisk.confidence || 0) >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  {overallRisk.confidence || 0}%
                </span>
              </div>
              <div className="w-full bg-neutral-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    (overallRisk.confidence || 0) >= 80
                      ? 'bg-green-500'
                      : (overallRisk.confidence || 0) >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${overallRisk.confidence || 0}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 px-4 bg-neutral-700/50 hover:bg-neutral-600/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <AiOutlineEye />
              {showDetails ? 'Hide' : 'Show'} Detailed Analysis
            </button>
          </div>

          {/* Detailed Risk Factors */}
          {showDetails && riskAssessment.riskFactors && (
            <div className="bg-neutral-700/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <AiOutlineBarChart />
                Risk Factor Breakdown
              </h4>
              <div className="space-y-4">
                {riskAssessment.riskFactors.map((factor: any, index: number) => (
                  <div key={index} className="bg-neutral-600/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={getRiskScoreColor(factor.score)}>{getRiskCategoryIcon(factor.category)}</div>
                        <div>
                          <h5 className="font-medium text-gray-200">{factor.category}</h5>
                          <p className="text-xs text-gray-400">{factor.impact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRiskScoreColor(factor.score)}`}>{factor.score}/10</div>
                        <div className="text-xs text-gray-400">{factor.likelihood}</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">{factor.mitigation}</p>

                    {/* Risk Score Bar */}
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          factor.score <= 3
                            ? 'bg-green-500'
                            : factor.score <= 6
                              ? 'bg-yellow-500'
                              : factor.score <= 8
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${(factor.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                <AiOutlineInfoCircle />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {riskAssessment.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-blue-300">
                    <AiOutlineCheckCircle className="mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {riskAssessment.warnings && riskAssessment.warnings.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <AiOutlineWarning />
                Risk Warnings
              </h4>
              <div className="space-y-2">
                {riskAssessment.warnings.map((warning: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-yellow-300">
                    <BsExclamationTriangle className="mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitoring Suggestions */}
          {riskAssessment.monitoring && riskAssessment.monitoring.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
                <AiOutlineEye />
                Monitoring Suggestions
              </h4>
              <div className="space-y-2">
                {riskAssessment.monitoring.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-purple-300">
                    <AiOutlineEye className="mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {!riskAssessment && !loadingRisk && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AiOutlineIe className="text-2xl text-red-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">Comprehensive Risk Analysis</h4>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Get AI-powered risk assessment covering smart contract security, market conditions, liquidity, and operational risks.
          </p>
          <button
            onClick={generateAssessment}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Analyze Risks
          </button>
        </div>
      )}
    </div>
  )
}
