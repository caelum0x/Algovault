import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import {
  AiOutlineRobot,
  AiOutlineBulb,
  AiOutlineLineChart,
  AiOutlineWarning,
  AiOutlinePieChart,
  AiOutlineClose,
  AiOutlinePlus,
  AiOutlineEye,
} from 'react-icons/ai'
import { BsGraphUp, BsShield } from 'react-icons/bs'
import { useAI } from '../../contexts/AIContext'
import { useAIAnalytics } from '../../hooks/useAIAnalytics'

interface AIFloatingActionsProps {
  onOpenChat: () => void
  onOpenYieldPredictor: () => void
  onOpenPortfolioOptimizer: () => void
  onOpenRiskAssessment: () => void
  onOpenSetup: () => void
}

interface AIAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  action: () => void
  status?: 'loading' | 'ready' | 'error'
  badge?: string
}

export default function AIFloatingActions({
  onOpenChat,
  onOpenYieldPredictor,
  onOpenPortfolioOptimizer,
  onOpenRiskAssessment,
  onOpenSetup,
}: AIFloatingActionsProps) {
  const { activeAddress } = useWallet()
  const { isAIEnabled, isAIInitialized, isLoading } = useAI()
  const { yieldPredictions, riskAssessment, portfolioOptimization, loadingYields, loadingRisk, loadingOptimization } = useAIAnalytics()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  // Show notification when new AI insights are available
  useEffect(() => {
    if (!isAIEnabled || !activeAddress) return

    const hasNewData = yieldPredictions || riskAssessment || portfolioOptimization
    if (hasNewData && !isExpanded) {
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [yieldPredictions, riskAssessment, portfolioOptimization, isAIEnabled, activeAddress, isExpanded])

  if (!isAIEnabled || !activeAddress) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenSetup}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <AiOutlineRobot className="text-xl" />
        </button>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">!</span>
        </div>
      </div>
    )
  }

  const aiActions: AIAction[] = [
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: <AiOutlineRobot />,
      color: 'text-purple-400',
      bgColor: 'from-purple-500 to-pink-600',
      action: onOpenChat,
      status: isAIInitialized ? 'ready' : 'loading',
    },
    {
      id: 'yield',
      label: 'Yield Prediction',
      icon: <AiOutlineLineChart />,
      color: 'text-green-400',
      bgColor: 'from-green-500 to-emerald-600',
      action: onOpenYieldPredictor,
      status: loadingYields ? 'loading' : yieldPredictions ? 'ready' : undefined,
      badge: yieldPredictions?.predictions ? `${yieldPredictions.predictions.expected.toFixed(1)}%` : undefined,
    },
    {
      id: 'portfolio',
      label: 'Portfolio Optimizer',
      icon: <AiOutlinePieChart />,
      color: 'text-blue-400',
      bgColor: 'from-blue-500 to-cyan-600',
      action: onOpenPortfolioOptimizer,
      status: loadingOptimization ? 'loading' : portfolioOptimization ? 'ready' : undefined,
    },
    {
      id: 'risk',
      label: 'Risk Assessment',
      icon: <BsShield />,
      color: 'text-amber-400',
      bgColor: 'from-amber-500 to-orange-600',
      action: onOpenRiskAssessment,
      status: loadingRisk ? 'loading' : riskAssessment ? 'ready' : undefined,
      badge: riskAssessment?.overallRisk?.level ? riskAssessment.overallRisk.level.toUpperCase() : undefined,
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Notification Pulse */}
      {showNotification && (
        <div className="absolute -top-8 right-0 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-bounce">
          New AI insights!
        </div>
      )}

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {aiActions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Action Label */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-300 shadow-lg">
                {action.label}
                {action.badge && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${action.color} bg-current/10`}>
                    {action.badge}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  action.action()
                  setIsExpanded(false)
                }}
                disabled={action.status === 'loading' || !isAIInitialized}
                className={`relative w-12 h-12 bg-gradient-to-r ${action.bgColor} hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {action.status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  action.icon
                )}

                {/* Status Indicator */}
                {action.status === 'ready' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
                {action.status === 'error' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isLoading}
        className={`relative w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isExpanded ? (
          <AiOutlineClose className="text-xl" />
        ) : (
          <AiOutlinePlus className="text-xl" />
        )}

        {/* Notification Badge */}
        {showNotification && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        )}

        {/* AI Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
          isAIInitialized ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
      </button>

      {/* Background Overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}