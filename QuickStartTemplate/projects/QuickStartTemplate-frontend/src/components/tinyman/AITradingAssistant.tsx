import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import {
  BsRobot,
  BsSend,
  BsLightning,
  BsGraphUp,
  BsShield,
  BsMic,
  BsMicMute,
  BsArrowRight
} from 'react-icons/bs'
import { getAITinymanService } from '../../services/tinyman/aiTinymanService'
import { MarketIntelligence, TradingOpportunity } from '../../services/tinyman/types'

interface AITradingAssistantProps {
  openModal: boolean
  closeModal: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  actions?: TradingAction[]
}

interface TradingAction {
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'analyze'
  description: string
  parameters: any
  executable: boolean
}

const AITradingAssistant = ({ openModal, closeModal }: AITradingAssistantProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null)
  const [opportunities, setOpportunities] = useState<TradingOpportunity[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiService = getAITinymanService()

  // Sample trading commands for suggestions
  const sampleCommands = [
    "Swap 100 ALGO for USDC at best rate",
    "Add liquidity to ALGO/USDC pool with $500",
    "Show me high APY farming opportunities",
    "Analyze my portfolio risk",
    "Find arbitrage opportunities",
    "What's the best strategy for market conditions?"
  ]

  useEffect(() => {
    if (openModal && activeAddress) {
      initializeAssistant()
    }
  }, [openModal, activeAddress])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeAssistant = async () => {
    try {
      // Load market intelligence and opportunities
      const [intel, ops] = await Promise.all([
        aiService.getMarketIntelligence(),
        aiService.findTradingOpportunities(activeAddress!)
      ])

      setMarketIntel(intel)
      setOpportunities(ops)

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Welcome to AI Trading Assistant! 🤖

I can help you with:
• Smart swaps with optimal timing
• Liquidity management strategies
• Market analysis and insights
• Portfolio optimization
• Natural language trading commands

Current market sentiment: ${intel.sentiment.toUpperCase()}
${intel.recommendations.slice(0, 2).join('. ')}

What would you like to do today?`,
        timestamp: new Date()
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to initialize assistant:', error)
      enqueueSnackbar('Failed to load AI assistant', { variant: 'error' })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !activeAddress) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)

    try {
      const response = await aiService.executeNaturalLanguageCommand(
        inputValue,
        activeAddress,
        transactionSigner
      )

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: formatAIResponse(response),
        timestamp: new Date(),
        actions: extractActions(response)
      }

      setMessages(prev => [...prev, aiMessage])

      if (response.success) {
        enqueueSnackbar('Command executed successfully!', { variant: 'success' })
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I encountered an error: ${error.message}. Let me help you try a different approach.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      enqueueSnackbar('Failed to execute command', { variant: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSampleCommand = (command: string) => {
    setInputValue(command)
  }

  const handleExecuteAction = async (action: TradingAction) => {
    if (!activeAddress || !transactionSigner) {
      enqueueSnackbar('Please connect your wallet', { variant: 'warning' })
      return
    }

    try {
      setIsProcessing(true)
      enqueueSnackbar('Executing trade...', { variant: 'info' })

      const result = await executeTradeAction(action)

      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content:
          'txId' in result && result.txId
            ? `✅ Trade executed successfully! Transaction ID: ${result.txId}`
            : '✅ Trade executed successfully!',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, successMessage])
      enqueueSnackbar('Trade completed!', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(`Trade failed: ${error.message}`, { variant: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  const executeTradeAction = async (action: TradingAction) => {
    switch (action.type) {
      case 'swap':
        return await aiService.executeAISwap(
          action.parameters.assetIn,
          action.parameters.assetOut,
          BigInt(action.parameters.amount),
          activeAddress!,
          transactionSigner!
        )

      case 'add_liquidity':
        return await aiService.getAILiquidityStrategy(
          action.parameters.assetA,
          action.parameters.assetB,
          BigInt(action.parameters.amount)
        )

      default:
        throw new Error(`Unsupported action: ${action.type}`)
    }
  }

  const formatAIResponse = (response: any): string => {
    if (typeof response === 'string') return response

    if (response.sentiment) {
      return `Market Analysis:
• Sentiment: ${response.sentiment.toUpperCase()}
• Direction: ${response.priceDirection}
• Volatility: ${response.volatility}
• Recommendations: ${response.recommendations.join(', ')}`
    }

    return 'Analysis completed successfully!'
  }

  const extractActions = (response: any): TradingAction[] => {
    // Extract executable actions from AI response
    if (response.action && response.parameters) {
      return [{
        type: response.action,
        description: `Execute ${response.action} with suggested parameters`,
        parameters: response.parameters,
        executable: true
      }]
    }
    return []
  }

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
      }

      recognition.start()
    } else {
      enqueueSnackbar('Voice input not supported in this browser', { variant: 'warning' })
    }
  }

  return (
    <dialog
      id="ai_trading_assistant_modal"
      className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-0 max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="flex items-center gap-3">
            <BsRobot className="text-3xl text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                AI Trading Assistant
              </h3>
              <p className="text-sm text-gray-400">Natural language DeFi trading</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Market Intelligence Summary */}
        {marketIntel && (
          <div className="p-4 bg-neutral-750 border-b border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BsGraphUp className="text-green-400" />
                <span>Sentiment: <span className="text-green-400">{marketIntel.sentiment}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <BsLightning className="text-yellow-400" />
                <span>Volatility: <span className="text-yellow-400">{marketIntel.volatility}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <BsShield className="text-blue-400" />
                <span>Direction: <span className="text-blue-400">{marketIntel.priceDirection}</span></span>
              </div>
              <div className="text-purple-400">
                {opportunities.length} opportunities found
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.type === 'system'
                    ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                    : 'bg-neutral-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleExecuteAction(action)}
                        disabled={!action.executable || isProcessing}
                        className="w-full btn btn-sm bg-purple-600 hover:bg-purple-500 border-none text-white disabled:opacity-50"
                      >
                        <BsArrowRight className="mr-2" />
                        {action.description}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-neutral-700 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Commands */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-neutral-700">
            <p className="text-sm text-gray-400 mb-3">Try these commands:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleCommands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleCommand(command)}
                  className="text-left p-2 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-lg text-gray-300 transition-colors"
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your trading command... (e.g., 'swap 100 ALGO for USDC')"
                className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                disabled={isProcessing || !activeAddress}
              />

              {/* Voice Input Button */}
              <button
                onClick={startVoiceInput}
                disabled={isListening || isProcessing}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-colors ${
                  isListening
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isListening ? <BsMicMute /> : <BsMic />}
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing || !activeAddress}
              className="btn bg-purple-600 hover:bg-purple-500 border-none text-white disabled:opacity-50"
            >
              <BsSend />
            </button>
          </div>

          {!activeAddress && (
            <p className="text-yellow-400 text-sm mt-2">Please connect your wallet to use the AI assistant</p>
          )}
        </div>
      </div>
    </dialog>
  )
}

export default AITradingAssistant