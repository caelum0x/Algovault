import { useState, useEffect, useCallback } from 'react'
import { useSnackbar } from 'notistack'
import {
  getAIService,
  AIResponse,
  YieldPredictionRequest,
  PortfolioOptimizationRequest,
  RiskAssessmentRequest,
} from '../services/aiService'

interface AIAnalyticsState {
  yieldPredictions: any | null
  portfolioOptimization: any | null
  riskAssessment: any | null
  loadingYields: boolean
  loadingOptimization: boolean
  loadingRisk: boolean
  error: string | null
}

interface UseAIAnalyticsReturn extends AIAnalyticsState {
  predictYields: (request: YieldPredictionRequest) => Promise<void>
  optimizePortfolio: (request: PortfolioOptimizationRequest) => Promise<void>
  assessRisk: (request: RiskAssessmentRequest) => Promise<void>
  clearPredictions: () => void
  refreshAnalytics: () => Promise<void>
}

export function useAIAnalytics(): UseAIAnalyticsReturn {
  const { enqueueSnackbar } = useSnackbar()

  const [state, setState] = useState<AIAnalyticsState>({
    yieldPredictions: null,
    portfolioOptimization: null,
    riskAssessment: null,
    loadingYields: false,
    loadingOptimization: false,
    loadingRisk: false,
    error: null,
  })

  const predictYields = useCallback(
    async (request: YieldPredictionRequest) => {
      try {
        setState((prev) => ({ ...prev, loadingYields: true, error: null }))

        const aiService = getAIService()
        const response = await aiService.predictYields(request)

        if (response.success) {
          setState((prev) => ({
            ...prev,
            yieldPredictions: response.data,
            loadingYields: false,
          }))

          enqueueSnackbar('AI yield predictions generated successfully', { variant: 'success' })
        } else {
          throw new Error(response.error || 'Failed to generate yield predictions')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to predict yields'
        setState((prev) => ({
          ...prev,
          loadingYields: false,
          error: errorMessage,
        }))
        enqueueSnackbar(`Yield prediction failed: ${errorMessage}`, { variant: 'error' })
      }
    },
    [enqueueSnackbar],
  )

  const optimizePortfolio = useCallback(
    async (request: PortfolioOptimizationRequest) => {
      try {
        setState((prev) => ({ ...prev, loadingOptimization: true, error: null }))

        const aiService = getAIService()
        const response = await aiService.optimizePortfolio(request)

        if (response.success) {
          setState((prev) => ({
            ...prev,
            portfolioOptimization: response.data,
            loadingOptimization: false,
          }))

          enqueueSnackbar('AI portfolio optimization completed', { variant: 'success' })
        } else {
          throw new Error(response.error || 'Failed to optimize portfolio')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to optimize portfolio'
        setState((prev) => ({
          ...prev,
          loadingOptimization: false,
          error: errorMessage,
        }))
        enqueueSnackbar(`Portfolio optimization failed: ${errorMessage}`, { variant: 'error' })
      }
    },
    [enqueueSnackbar],
  )

  const assessRisk = useCallback(
    async (request: RiskAssessmentRequest) => {
      try {
        setState((prev) => ({ ...prev, loadingRisk: true, error: null }))

        const aiService = getAIService()
        const response = await aiService.assessRisk(request)

        if (response.success) {
          setState((prev) => ({
            ...prev,
            riskAssessment: response.data,
            loadingRisk: false,
          }))

          enqueueSnackbar('AI risk assessment completed', { variant: 'success' })
        } else {
          throw new Error(response.error || 'Failed to assess risk')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to assess risk'
        setState((prev) => ({
          ...prev,
          loadingRisk: false,
          error: errorMessage,
        }))
        enqueueSnackbar(`Risk assessment failed: ${errorMessage}`, { variant: 'error' })
      }
    },
    [enqueueSnackbar],
  )

  const clearPredictions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      yieldPredictions: null,
      portfolioOptimization: null,
      riskAssessment: null,
      error: null,
    }))
  }, [])

  const refreshAnalytics = useCallback(async () => {
    // This would trigger refresh of all analytics based on current data
    enqueueSnackbar('Refreshing AI analytics...', { variant: 'info' })
    clearPredictions()
  }, [clearPredictions, enqueueSnackbar])

  return {
    ...state,
    predictYields,
    optimizePortfolio,
    assessRisk,
    clearPredictions,
    refreshAnalytics,
  }
}

// Hook for AI-powered chat assistance
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  suggestions?: string[]
  links?: string[]
}

interface UseAIChatReturn {
  messages: ChatMessage[]
  loading: boolean
  sendMessage: (message: string) => Promise<void>
  clearChat: () => void
}

export function useAIChat(userContext?: any): UseAIChatReturn {
  const { enqueueSnackbar } = useSnackbar()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI assistant for AlgoVault. I can help you with yield farming strategies, risk assessment, portfolio optimization, and governance decisions. What would you like to know?",
      timestamp: Date.now(),
      suggestions: [
        'How can I optimize my staking strategy?',
        'What are the risks of this pool?',
        'Should I participate in governance?',
        'Explain compound interest in DeFi',
      ],
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(
    async (message: string) => {
      try {
        setLoading(true)

        // Add user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: message,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, userMessage])

        // Get AI response
        const aiService = getAIService()
        const response = await aiService.getChatResponse(message, userContext || {})

        if (response.success) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.data.response,
            timestamp: Date.now(),
            suggestions: response.data.suggestions,
            links: response.data.links,
          }

          setMessages((prev) => [...prev, assistantMessage])
        } else {
          throw new Error(response.error || 'Failed to get AI response')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
        enqueueSnackbar(`Chat error: ${errorMessage}`, { variant: 'error' })

        // Add error message
        const errorChatMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: "I apologize, but I'm having trouble processing your request right now. Please try again or ask a different question.",
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, errorChatMessage])
      } finally {
        setLoading(false)
      }
    },
    [userContext, enqueueSnackbar],
  )

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. How can I help you with AlgoVault today?',
        timestamp: Date.now(),
        suggestions: [
          'How can I optimize my staking strategy?',
          'What are the risks of this pool?',
          'Should I participate in governance?',
          'Explain compound interest in DeFi',
        ],
      },
    ])
  }, [])

  return {
    messages,
    loading,
    sendMessage,
    clearChat,
  }
}

// Hook for AI-powered governance analysis
interface UseAIGovernanceReturn {
  proposalAnalysis: any | null
  loadingAnalysis: boolean
  analyzeProposal: (
    proposalTitle: string,
    proposalDescription: string,
    proposalType: string,
    votingPower: bigint,
    historicalVotes: any[],
  ) => Promise<void>
  clearAnalysis: () => void
}

export function useAIGovernance(): UseAIGovernanceReturn {
  const { enqueueSnackbar } = useSnackbar()
  const [proposalAnalysis, setProposalAnalysis] = useState<any | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  const analyzeProposal = useCallback(
    async (proposalTitle: string, proposalDescription: string, proposalType: string, votingPower: bigint, historicalVotes: any[]) => {
      try {
        setLoadingAnalysis(true)

        const aiService = getAIService()
        const response = await aiService.analyzeGovernanceProposal(
          proposalTitle,
          proposalDescription,
          proposalType,
          votingPower,
          historicalVotes,
        )

        if (response.success) {
          setProposalAnalysis(response.data)
          enqueueSnackbar('AI governance analysis completed', { variant: 'success' })
        } else {
          throw new Error(response.error || 'Failed to analyze proposal')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze proposal'
        enqueueSnackbar(`Governance analysis failed: ${errorMessage}`, { variant: 'error' })
      } finally {
        setLoadingAnalysis(false)
      }
    },
    [enqueueSnackbar],
  )

  const clearAnalysis = useCallback(() => {
    setProposalAnalysis(null)
  }, [])

  return {
    proposalAnalysis,
    loadingAnalysis,
    analyzeProposal,
    clearAnalysis,
  }
}
