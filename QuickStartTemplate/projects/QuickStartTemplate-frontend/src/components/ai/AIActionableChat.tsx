import React, { useState, useEffect, useRef } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import {
  AiOutlineRobot,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlineMinus,
  AiOutlineReload,
  AiOutlineCheckCircle,
  AiOutlineWarning,
  AiOutlineStop,
} from 'react-icons/ai'
import { BsLightning } from 'react-icons/bs'
import { getAIActionExecutor, AIActionResult } from '../../services/aiActionExecutor'
import { useStakingPool } from '../../hooks/useStakingPool'
import { useGovernance } from '../../hooks/useGovernance'

interface AIActionableChatProps {
  isOpen: boolean
  isMinimized: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStakeAction?: (amount: number) => Promise<void>
  onUnstakeAction?: (amount: number | 'all') => Promise<void>
  onClaimAction?: () => Promise<void>
  onVoteAction?: (proposalId: string, vote: string) => Promise<void>
  onSendPayment?: (amount: number, recipient: string) => Promise<void>
  onCreateToken?: (name: string, symbol: string, supply: number) => Promise<void>
  onMintNFT?: (name: string, description: string) => Promise<void>
}

interface Message {
  id: string
  type: 'user' | 'ai' | 'system' | 'action'
  content: string
  timestamp: Date
  action?: AIActionResult
  isExecuting?: boolean
}

export default function AIActionableChat({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onMaximize,
  onStakeAction,
  onUnstakeAction,
  onClaimAction,
  onVoteAction,
  onSendPayment,
  onCreateToken,
  onMintNFT,
}: AIActionableChatProps) {
  const { activeAddress, signTransactions } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  // Get pool and governance data for context
  const { poolData, userStake } = useStakingPool('pool-1')
  const { userVotingPower } = useGovernance()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Hi! I\'m your AI assistant. I can help you stake tokens, vote on proposals, send payments, create tokens, mint NFTs, and more! Just tell me what you\'d like to do in natural language.',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [pendingAction, setPendingAction] = useState<AIActionResult | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Update AI executor context
  useEffect(() => {
    const executor = getAIActionExecutor()
    executor.updateContext({
      userAddress: activeAddress || undefined,
      walletConnected: !!activeAddress,
      currentPoolData: poolData,
      userStakeData: userStake,
      userBalance: 0, // Could be fetched from wallet
    })
  }, [activeAddress, poolData, userStake])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const executor = getAIActionExecutor()
      const result = await executor.parseAndExecuteCommand(inputText)

      let aiResponse: Message

      if (result.success && result.executeFunction) {
        // Action can be executed
        aiResponse = {
          id: Date.now().toString() + '_ai',
          type: 'action',
          content: result.message,
          timestamp: new Date(),
          action: result,
        }
        setPendingAction(result)
      } else {
        // Just a regular response
        aiResponse = {
          id: Date.now().toString() + '_ai',
          type: 'ai',
          content: result.message,
          timestamp: new Date(),
        }
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'ai',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const executeAction = async (action: AIActionResult) => {
    if (!action.executeFunction) return

    try {
      // Mark as executing
      setMessages(prev =>
        prev.map(msg =>
          msg.action === action
            ? { ...msg, isExecuting: true }
            : msg
        )
      )

      const actionData = await action.executeFunction()

      // Route to appropriate handler based on action type
      switch (actionData.type) {
        case 'staking':
          await handleStakingAction(actionData)
          break
        case 'governance':
          await handleGovernanceAction(actionData)
          break
        case 'payment':
          await handlePaymentAction(actionData)
          break
        case 'token':
          await handleTokenAction(actionData)
          break
        case 'nft':
          await handleNFTAction(actionData)
          break
        default:
          throw new Error(`Unknown action type: ${actionData.type}`)
      }

      // Add success message
      const successMessage: Message = {
        id: Date.now().toString() + '_success',
        type: 'system',
        content: `✅ Action completed successfully!`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, successMessage])

      enqueueSnackbar('Action completed successfully!', { variant: 'success' })
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'system',
        content: `❌ Error executing action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])

      enqueueSnackbar(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' })
    } finally {
      // Remove executing state
      setMessages(prev =>
        prev.map(msg =>
          msg.action === action
            ? { ...msg, isExecuting: false }
            : msg
        )
      )
      setPendingAction(null)
    }
  }

  const handleStakingAction = async (actionData: any) => {
    switch (actionData.action) {
      case 'stake':
        if (onStakeAction) {
          await onStakeAction(actionData.amount)
        } else {
          throw new Error('Staking function not available')
        }
        break
      case 'unstake':
        if (onUnstakeAction) {
          await onUnstakeAction(actionData.amount)
        } else {
          throw new Error('Unstaking function not available')
        }
        break
      case 'claim':
        if (onClaimAction) {
          await onClaimAction()
        } else {
          throw new Error('Claim function not available')
        }
        break
      default:
        throw new Error(`Unknown staking action: ${actionData.action}`)
    }
  }

  const handleGovernanceAction = async (actionData: any) => {
    switch (actionData.action) {
      case 'vote':
        if (onVoteAction) {
          await onVoteAction(actionData.proposalId, actionData.vote)
        } else {
          throw new Error('Voting function not available')
        }
        break
      default:
        throw new Error(`Unknown governance action: ${actionData.action}`)
    }
  }

  const handlePaymentAction = async (actionData: any) => {
    if (onSendPayment) {
      await onSendPayment(actionData.amount, actionData.recipient)
    } else {
      throw new Error('Payment function not available')
    }
  }

  const handleTokenAction = async (actionData: any) => {
    switch (actionData.action) {
      case 'create':
        if (onCreateToken) {
          await onCreateToken(actionData.name, actionData.symbol, actionData.supply)
        } else {
          throw new Error('Token creation function not available')
        }
        break
      default:
        throw new Error(`Unknown token action: ${actionData.action}`)
    }
  }

  const handleNFTAction = async (actionData: any) => {
    switch (actionData.action) {
      case 'mint':
        if (onMintNFT) {
          await onMintNFT(actionData.name, actionData.description)
        } else {
          throw new Error('NFT minting function not available')
        }
        break
      default:
        throw new Error(`Unknown NFT action: ${actionData.action}`)
    }
  }

  const cancelAction = () => {
    setPendingAction(null)
    const cancelMessage: Message = {
      id: Date.now().toString() + '_cancel',
      type: 'system',
      content: '❌ Action cancelled.',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, cancelMessage])
  }

  if (!isOpen) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-20 z-50">
        <button
          onClick={onMaximize}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <AiOutlineRobot className="text-xl text-white" />
          {pendingAction && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <BsLightning className="text-white text-sm" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">AI Assistant</h3>
            <p className="text-xs text-gray-400">Ready to execute actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <AiOutlineMinus />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <AiOutlineClose />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-purple-500 text-white'
                  : message.type === 'system'
                    ? 'bg-neutral-700 text-gray-300'
                    : message.type === 'action'
                      ? 'bg-yellow-500/10 border border-yellow-500/20 text-gray-200'
                      : 'bg-neutral-800 text-gray-300'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {/* Action buttons for executable actions */}
              {message.type === 'action' && message.action && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => executeAction(message.action!)}
                    disabled={message.isExecuting}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                  >
                    {message.isExecuting ? (
                      <>
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <AiOutlineCheckCircle />
                        Execute
                      </>
                    )}
                  </button>

                  {!message.isExecuting && (
                    <button
                      onClick={cancelAction}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                    >
                      <AiOutlineStop />
                      Cancel
                    </button>
                  )}
                </div>
              )}

              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a command like 'stake 100 ALGO' or 'send 5 ALGO to ...'"
            className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            <AiOutlineSend />
          </button>
        </div>

        {!activeAddress && (
          <p className="text-xs text-yellow-400 mt-2">
            ⚠️ Connect your wallet to execute blockchain actions
          </p>
        )}
      </div>
    </div>
  )
}