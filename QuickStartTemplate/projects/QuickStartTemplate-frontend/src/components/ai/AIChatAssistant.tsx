import React, { useState, useRef, useEffect } from 'react'
import {
  AiOutlineRobot,
  AiOutlineSend,
  AiOutlineUser,
  AiOutlineClose,
  AiOutlineMinusCircle,
  AiOutlineExpandAlt,
  AiOutlineReload,
  AiOutlineBulb,
  AiOutlineLink,
  AiOutlineQuestionCircle,
} from 'react-icons/ai'
import { BsChat, BsGraphUp, BsCoin } from 'react-icons/bs'
import { useAIChat } from '../../hooks/useAIAnalytics'

interface AIChatAssistantProps {
  userContext?: {
    userStakes?: any[]
    portfolioValue?: number
    recentActivity?: any[]
  }
  onClose?: () => void
  isOpen?: boolean
  isMinimized?: boolean
  onMinimize?: () => void
  onMaximize?: () => void
}

export default function AIChatAssistant({
  userContext,
  onClose,
  isOpen = true,
  isMinimized = false,
  onMinimize,
  onMaximize,
}: AIChatAssistantProps) {
  const { messages, loading, sendMessage, clearChat } = useAIChat(userContext)
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const quickActions = [
    {
      icon: <BsCoin />,
      label: 'Staking Strategy',
      prompt: "What's the best staking strategy for my portfolio?",
      color: 'text-yellow-400',
    },
    {
      icon: <BsGraphUp />,
      label: 'Yield Analysis',
      prompt: 'Analyze my current yield performance',
      color: 'text-green-400',
    },
    {
      icon: <BsChat />,
      label: 'Governance Help',
      prompt: 'How should I participate in governance voting?',
      color: 'text-purple-400',
    },
    {
      icon: <AiOutlineQuestionCircle />,
      label: 'DeFi Basics',
      prompt: 'Explain DeFi concepts and how AlgoVault works',
      color: 'text-blue-400',
    },
  ]

  if (!isOpen) return null

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMaximize}
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
        >
          <AiOutlineRobot className="text-xl text-white" />
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'}`}>
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <AiOutlineRobot className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200">AI Assistant</h3>
              <p className="text-xs text-gray-400">DeFi Expert</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <AiOutlineExpandAlt className="text-sm" />
            </button>

            <button onClick={clearChat} className="p-1 text-gray-400 hover:text-gray-300 transition-colors" title="Clear chat">
              <AiOutlineReload className="text-sm" />
            </button>

            <button onClick={onMinimize} className="p-1 text-gray-400 hover:text-gray-300 transition-colors" title="Minimize">
              <AiOutlineMinusCircle className="text-sm" />
            </button>

            {onClose && (
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-300 transition-colors" title="Close">
                <AiOutlineClose className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <AiOutlineRobot className="text-xs text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] ${
                  message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-gray-200'
                } rounded-lg p-3`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Message timestamp */}
                <div className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <AiOutlineBulb />
                      Suggestions:
                    </div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-neutral-600 hover:bg-neutral-500 rounded p-2 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Links */}
                {message.links && message.links.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <AiOutlineLink />
                      Resources:
                    </div>
                    {message.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <AiOutlineUser className="text-xs text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <AiOutlineRobot className="text-xs text-white" />
              </div>
              <div className="bg-neutral-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t border-neutral-700">
            <div className="text-xs text-gray-400 mb-2">Quick actions:</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(action.prompt)}
                  className="flex items-center gap-2 p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-left"
                >
                  <div className={action.color}>{action.icon}</div>
                  <span className="text-xs text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about DeFi, staking, governance..."
              className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <AiOutlineSend className="text-sm" />
            </button>
          </div>

          {/* Character count */}
          <div className="text-xs text-gray-500 mt-1 text-right">{inputValue.length}/500</div>
        </div>
      </div>
    </div>
  )
}
