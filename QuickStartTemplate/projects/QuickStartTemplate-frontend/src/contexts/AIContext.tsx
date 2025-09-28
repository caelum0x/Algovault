import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { initializeAIService, getAIService } from '../services/aiService'
import { useSnackbar } from 'notistack'

interface AIContextType {
  isAIEnabled: boolean
  isAIInitialized: boolean
  isLoading: boolean
  error: string | null
  enableAI: (config: AIConfig) => Promise<void>
  disableAI: () => void
  checkAIStatus: () => Promise<boolean>
  showSetupGuide: boolean
  setShowSetupGuide: (show: boolean) => void
}

interface AIConfig {
  groqApiKey?: string
  openRouterApiKey?: string
  preferredProvider: 'groq' | 'openrouter'
}

const AIContext = createContext<AIContextType | undefined>(undefined)

interface AIProviderProps {
  children: ReactNode
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isAIEnabled, setIsAIEnabled] = useState(false)
  const [isAIInitialized, setIsAIInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  // Check for AI configuration on mount
  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // Check for API keys in environment variables
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
      const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY
      const aiFeatureFlag = import.meta.env.VITE_ENABLE_AI_FEATURES

      // Check if AI is disabled by feature flag
      if (aiFeatureFlag === 'false') {
        setIsAIEnabled(false)
        setIsAIInitialized(false)
        return false
      }

      // If we have API keys, initialize AI automatically
      if (groqApiKey || openRouterApiKey) {
        await enableAI({
          groqApiKey,
          openRouterApiKey,
          preferredProvider: groqApiKey ? 'groq' : 'openrouter',
        })
        return true
      }

      // Check if AI is already initialized
      const aiService = getAIService()
      if (aiService && (await aiService.isHealthy())) {
        setIsAIEnabled(true)
        setIsAIInitialized(true)
        return true
      }

      // No configuration found
      setIsAIEnabled(false)
      setIsAIInitialized(false)
      return false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check AI status'
      setError(errorMessage)
      setIsAIEnabled(false)
      setIsAIInitialized(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const enableAI = async (config: AIConfig): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate configuration
      if (!config.groqApiKey && !config.openRouterApiKey) {
        throw new Error('At least one API key is required')
      }

      // Initialize the AI service
      await initializeAIService(config)

      // Test the connection
      const aiService = getAIService()
      if (!(await aiService?.isHealthy())) {
        throw new Error('AI service initialization failed - please check your API keys')
      }

      setIsAIEnabled(true)
      setIsAIInitialized(true)
      setShowSetupGuide(false)

      enqueueSnackbar('AI features enabled successfully!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable AI features'
      setError(errorMessage)
      setIsAIEnabled(false)
      setIsAIInitialized(false)

      enqueueSnackbar(`AI Error: ${errorMessage}`, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 6000
      })

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disableAI = (): void => {
    setIsAIEnabled(false)
    setIsAIInitialized(false)
    setError(null)

    enqueueSnackbar('AI features disabled', {
      variant: 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'right' }
    })
  }

  const contextValue: AIContextType = {
    isAIEnabled,
    isAIInitialized,
    isLoading,
    error,
    enableAI,
    disableAI,
    checkAIStatus,
    showSetupGuide,
    setShowSetupGuide,
  }

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>
}

export const useAI = (): AIContextType => {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

export default AIContext