import React, { useState, useEffect } from 'react'
import {
  AiOutlineLineChart,
  AiOutlineBulb,
  AiOutlineRobot,
  AiOutlineReload,
  //,
  AiOutlineWarning,
  AiOutlineDingding,
  AiOutlineInfoCircle,
} from 'react-icons/ai'
import { BsGraphUp, BsShield } from 'react-icons/bs'
import { useAIAnalytics } from '../../hooks/useAIAnalytics'
import { StakingPoolData } from '../../types/vault'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface AIYieldPredictorProps {
  poolData: StakingPoolData
  onPredictionComplete?: (predictions: any) => void
}

interface PredictionDisplay {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}

export default function AIYieldPredictor({ poolData, onPredictionComplete }: AIYieldPredictorProps) {
  const { yieldPredictions, loadingYields, predictYields, error } = useAIAnalytics()

  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d')
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Auto-generate predictions when pool data changes
  useEffect(() => {
    if (poolData && poolData.totalStaked > 0n) {
      generatePredictions()
    }
    return undefined
  }, [poolData.id, selectedTimeframe])

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(
        () => {
          generatePredictions()
        },
        5 * 60 * 1000,
      ) // 5 minutes

      return () => clearInterval(interval)
    }
    return undefined
  }, [autoRefresh])

  const generatePredictions = async () => {
    if (!poolData) return

    const historicalYields = generateMockHistoricalYields(poolData.apy)
    const marketConditions = getMarketConditions(poolData)

    await predictYields({
      poolData: {
        totalStaked: poolData.totalStaked,
        currentAPY: poolData.apy,
        poolUtilization: (Number(poolData.totalStaked) / Number(poolData.maxCapacity || poolData.totalStaked * 2n)) * 100,
        historicalYields,
        marketConditions,
      },
      timeframe: selectedTimeframe,
    })
  }

  const generateMockHistoricalYields = (currentAPY: number): number[] => {
    const yields = []
    const volatility = 0.15 // 15% volatility

    for (let i = 0; i < 30; i++) {
      const randomFactor = 1 + (Math.random() - 0.5) * volatility
      yields.push(currentAPY * randomFactor)
    }

    return yields
  }

  const getMarketConditions = (poolData: StakingPoolData): string => {
    const utilization = (Number(poolData.totalStaked) / Number(poolData.maxCapacity || poolData.totalStaked * 2n)) * 100

    if (utilization > 80) return 'High demand, strong market sentiment'
    if (utilization > 50) return 'Moderate demand, stable market'
    if (utilization > 20) return 'Low demand, cautious market'
    return 'Very low demand, bearish sentiment'
  }

  const timeframeOptions = [
    { value: '1d' as const, label: '1 Day', description: 'Short-term prediction' },
    { value: '7d' as const, label: '7 Days', description: 'Weekly forecast' },
    { value: '30d' as const, label: '30 Days', description: 'Monthly outlook' },
    { value: '90d' as const, label: '90 Days', description: 'Quarterly projection' },
  ]

  const getPredictionDisplays = (): PredictionDisplay[] => {
    if (!yieldPredictions?.predictions) return []

    return [
      {
        label: 'Conservative',
        value: yieldPredictions.predictions.conservative,
        color: 'text-blue-400',
        icon: <BsShield />,
      },
      {
        label: 'Expected',
        value: yieldPredictions.predictions.expected,
        color: 'text-green-400',
        icon: <AiOutlineLineChart />,
      },
      {
        label: 'Optimistic',
        value: yieldPredictions.predictions.optimistic,
        color: 'text-purple-400',
        icon: <AiOutlineWarning />,
      },
    ]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRecommendationIcon = (rec: string) => {
    if (rec.toLowerCase().includes('stake') || rec.toLowerCase().includes('invest')) {
      return <AiOutlineWarning className="text-green-400" />
    }
    if (rec.toLowerCase().includes('caution') || rec.toLowerCase().includes('risk')) {
      return <AiOutlineWarning className="text-yellow-400" />
    }
    if (rec.toLowerCase().includes('avoid') || rec.toLowerCase().includes('withdraw')) {
      return <AiOutlineDingding className="text-red-400" />
    }
    return <AiOutlineInfoCircle className="text-blue-400" />
  }

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <AiOutlineRobot className="text-xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">AI Yield Predictor</h3>
            <p className="text-sm text-gray-400">ML-powered yield forecasting</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-gray-400 hover:text-gray-300'
            }`}
            title="Auto-refresh predictions"
          >
            <AiOutlineReload className={autoRefresh ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={generatePredictions}
            disabled={loadingYields}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingYields ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <AiOutlineBulb />
                Predict Yields
              </>
            )}
          </button>
        </div>
      </div>

      {/* Timeframe Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Prediction Timeframe</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeframe(option.value)}
              className={`p-3 rounded-lg text-center transition-all duration-300 ${
                selectedTimeframe === option.value
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                  : 'bg-neutral-700 border border-neutral-600 text-gray-300 hover:border-neutral-500'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AiOutlineWarning />
            <span className="font-medium">Prediction Error</span>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loadingYields && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">AI is analyzing market data and generating predictions...</p>
        </div>
      )}

      {/* Predictions Display */}
      {yieldPredictions && !loadingYields && (
        <div className="space-y-6">
          {/* Prediction Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getPredictionDisplays().map((prediction) => (
              <div key={prediction.label} className="bg-neutral-700/50 rounded-xl p-4 text-center">
                <div className={`text-2xl mb-2 ${prediction.color}`}>{prediction.icon}</div>
                <div className="text-sm text-gray-400 mb-1">{prediction.label}</div>
                <div className={`text-xl font-bold ${prediction.color}`}>{prediction.value.toFixed(2)}%</div>
                <div className="text-xs text-gray-500">APY</div>
              </div>
            ))}
          </div>

          {/* Confidence Score */}
          <div className="bg-neutral-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">AI Confidence</span>
              <span className={`text-lg font-bold ${getConfidenceColor(yieldPredictions.confidence || 0)}`}>
                {yieldPredictions.confidence || 0}%
              </span>
            </div>
            <div className="w-full bg-neutral-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  (yieldPredictions.confidence || 0) >= 80
                    ? 'bg-green-500'
                    : (yieldPredictions.confidence || 0) >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${yieldPredictions.confidence || 0}%` }}
              />
            </div>
          </div>

          {/* Key Factors */}
          {yieldPredictions.factors && yieldPredictions.factors.length > 0 && (
            <div className="bg-neutral-700/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <BsGraphUp />
                Key Factors Analyzed
              </h4>
              <div className="space-y-2">
                {yieldPredictions.factors.map((factor: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {yieldPredictions.reasoning && (
            <div className="bg-neutral-700/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <AiOutlineRobot />
                AI Analysis
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{yieldPredictions.reasoning}</p>
            </div>
          )}

          {/* Recommendations */}
          {yieldPredictions.recommendations && yieldPredictions.recommendations.length > 0 && (
            <div className="bg-neutral-700/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <AiOutlineBulb />
                AI Recommendations
              </h4>
              <div className="space-y-3">
                {yieldPredictions.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">{getRecommendationIcon(rec)}</div>
                    <span className="text-gray-300 flex-1">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {!yieldPredictions && !loadingYields && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AiOutlineRobot className="text-2xl text-purple-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">Get AI-Powered Yield Predictions</h4>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Our AI analyzes market data, historical patterns, and pool metrics to forecast future yields with confidence intervals.
          </p>
          <button
            onClick={generatePredictions}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Generate Predictions
          </button>
        </div>
      )}
    </div>
  )
}
