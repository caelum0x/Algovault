import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  AiOutlineRobot,
  AiOutlineBulb,
  AiOutlineWarning,
  AiOutlineInfoCircle,
  AiOutlineCheckCircle,
  AiOutlineSetting,
  AiOutlineEye,
  AiOutlineLineChart,
} from 'react-icons/ai'
import { BsLightning, BsShield } from 'react-icons/bs'
import { useAI } from '../../contexts/AIContext'
import { useAIAnalytics } from '../../hooks/useAIAnalytics'
import { StakingPoolData } from '../../types/vault'

interface AIHeaderProps {
  poolData?: StakingPoolData
  onOpenChat: () => void
  onOpenSetup: () => void
}

interface QuickInsight {
  type: 'prediction' | 'risk' | 'opportunity' | 'warning'
  message: string
  confidence: number
  icon: React.ReactNode
  color: string
}

export default function AIHeader({ poolData, onOpenChat, onOpenSetup }: AIHeaderProps) {
  const { activeAddress } = useWallet()
  const { isAIEnabled, isAIInitialized, isLoading, error } = useAI()
  const { yieldPredictions, riskAssessment, portfolioOptimization } = useAIAnalytics()

  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([])
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)
  const [showInsights, setShowInsights] = useState(false)

  // Generate quick insights from AI data
  useEffect(() => {
    if (!isAIEnabled || !isAIInitialized || !poolData) return

    const insights: QuickInsight[] = []

    // Add yield prediction insight
    if (yieldPredictions?.predictions) {
      const prediction = yieldPredictions.predictions.expected
      const confidence = yieldPredictions.confidence || 0

      if (prediction > poolData.apy * 1.1) {
        insights.push({
          type: 'opportunity',
          message: `AI predicts ${prediction.toFixed(2)}% APY (${((prediction - poolData.apy) / poolData.apy * 100).toFixed(1)}% increase)`,
          confidence,
          icon: <AiOutlineLineChart />,
          color: 'text-green-400'
        })
      } else if (prediction < poolData.apy * 0.9) {
        insights.push({
          type: 'warning',
          message: `AI predicts yield decline to ${prediction.toFixed(2)}% APY`,
          confidence,
          icon: <AiOutlineWarning />,
          color: 'text-yellow-400'
        })
      }
    }

    // Add risk assessment insight
    if (riskAssessment?.overallRisk) {
      const risk = riskAssessment.overallRisk
      if (risk.level === 'high' || risk.level === 'critical') {
        insights.push({
          type: 'risk',
          message: `High risk detected: ${risk.factors?.[0] || 'Market volatility'}`,
          confidence: risk.confidence || 70,
          icon: <BsShield />,
          color: 'text-red-400'
        })
      } else if (risk.level === 'low') {
        insights.push({
          type: 'prediction',
          message: 'AI confirms low risk conditions',
          confidence: risk.confidence || 80,
          icon: <AiOutlineCheckCircle />,
          color: 'text-green-400'
        })
      }
    }

    // Add portfolio optimization insight
    if (portfolioOptimization?.recommendations?.length) {
      const topRec = portfolioOptimization.recommendations[0]
      if (topRec) {
        insights.push({
          type: 'opportunity',
          message: `AI suggests: ${topRec.slice(0, 50)}...`,
          confidence: portfolioOptimization.confidence || 75,
          icon: <AiOutlineBulb />,
          color: 'text-purple-400'
        })
      }
    }

    setQuickInsights(insights)
    setShowInsights(insights.length > 0)
  }, [yieldPredictions, riskAssessment, portfolioOptimization, poolData, isAIEnabled, isAIInitialized])

  // Rotate insights every 5 seconds
  useEffect(() => {
    if (quickInsights.length <= 1) return

    const interval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % quickInsights.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [quickInsights.length])

  if (!isAIEnabled) {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <AiOutlineRobot className="text-white text-sm" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-200">AI Features Available</div>
              <div className="text-xs text-gray-400">Enable AI for smart insights and predictions</div>
            </div>
          </div>
          <button
            onClick={onOpenSetup}
            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors"
          >
            Enable AI
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AiOutlineWarning className="text-red-400" />
            <div>
              <div className="text-sm font-medium text-red-400">AI Service Error</div>
              <div className="text-xs text-red-300">{error}</div>
            </div>
          </div>
          <button
            onClick={onOpenSetup}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
          >
            Fix Setup
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !isAIInitialized) {
    return (
      <div className="bg-neutral-700/50 border border-neutral-600 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-200">Initializing AI</div>
            <div className="text-xs text-gray-400">Setting up intelligent features...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* AI Status Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BsLightning className="text-white text-sm" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                AI Powered
                <AiOutlineCheckCircle className="text-green-400 text-xs" />
              </div>
              <div className="text-xs text-gray-400">Smart insights active</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeAddress && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xs rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <AiOutlineRobot />
                Chat
              </button>
            )}

            <button
              onClick={onOpenSetup}
              className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors"
              title="AI Settings"
            >
              <AiOutlineSetting className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Insights Ticker */}
      {showInsights && quickInsights.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 min-w-fit">
              <AiOutlineEye />
              <span>AI Insight</span>
            </div>

            <div className="flex-1 relative h-5">
              {quickInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === currentInsightIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`${insight.color} text-sm`}>{insight.icon}</span>
                    <span className="text-sm text-gray-300 truncate">{insight.message}</span>
                    <span className="text-xs text-gray-500 min-w-fit">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {quickInsights.length > 1 && (
              <div className="flex gap-1">
                {quickInsights.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentInsightIndex ? 'bg-purple-500' : 'bg-neutral-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}