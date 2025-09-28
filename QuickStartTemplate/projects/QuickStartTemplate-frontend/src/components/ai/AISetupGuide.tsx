import React, { useState } from 'react'
import { AiOutlineRobot, AiOutlineKey, AiOutlineCheckCircle, AiOutlineInfoCircle, AiOutlineLink } from 'react-icons/ai'
import { BsLightning } from 'react-icons/bs'

interface AISetupGuideProps {
  onClose?: () => void
}

const AISetupGuide: React.FC<AISetupGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to AI-Powered AlgoVault',
      icon: <AiOutlineRobot className="text-4xl text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Enable AI features to get intelligent yield predictions, portfolio optimization, risk assessments, and personalized DeFi guidance.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Yield Predictions</h4>
              <p className="text-sm text-gray-400">AI analyzes market data to forecast pool yields with confidence intervals.</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">Portfolio Optimization</h4>
              <p className="text-sm text-gray-400">Get personalized allocation recommendations based on your risk tolerance.</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Risk Assessment</h4>
              <p className="text-sm text-gray-400">Comprehensive analysis of smart contract and market risks.</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-amber-400 mb-2">AI Chat Assistant</h4>
              <p className="text-sm text-gray-400">Real-time DeFi guidance and strategy recommendations.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Get Your API Keys',
      icon: <AiOutlineKey className="text-4xl text-blue-400" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-300">
            AlgoVault integrates with leading AI providers for the best performance and reliability.
          </p>

          <div className="space-y-4">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <BsLightning className="text-green-400" />
                <h4 className="font-semibold text-green-400">Groq (Recommended)</h4>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Fast & Free</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Ultra-fast AI inference with free tier. Perfect for real-time predictions.
              </p>
              <a
                href="https://console.groq.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
              >
                <AiOutlineLink />
                Get free Groq API key
              </a>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AiOutlineRobot className="text-purple-400" />
                <h4 className="font-semibold text-purple-400">OpenRouter (Alternative)</h4>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Multiple Models</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Access to multiple AI models including GPT-4, Claude, and more.
              </p>
              <a
                href="https://openrouter.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                <AiOutlineLink />
                Get OpenRouter API key
              </a>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Configure API Keys',
      icon: <AiOutlineCheckCircle className="text-4xl text-green-400" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-300">
            Add your API keys to the environment file to enable AI features.
          </p>

          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-200 mb-3">Edit your .env file:</h4>
            <pre className="bg-neutral-900 border border-neutral-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
{`# ======================
# AI Integration (Optional)
# Add your API keys for AI features
# ======================

# Get your Groq API key from: https://console.groq.com/
VITE_GROQ_API_KEY=your_groq_api_key_here

# Get your OpenRouter API key from: https://openrouter.ai/
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# ======================
# Feature Flags
# ======================
VITE_ENABLE_AI_FEATURES=true`}
            </pre>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AiOutlineInfoCircle className="text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">Important Notes:</h4>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>API keys are stored locally in your browser only</li>
                  <li>Keys are never sent to AlgoVault servers</li>
                  <li>You can use either Groq or OpenRouter (or both)</li>
                  <li>Restart the development server after adding keys</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Features Enabled!',
      icon: <BsLightning className="text-4xl text-cyan-400" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-300">
            🎉 You're all set! AI features are now enabled in AlgoVault.
          </p>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">What's Next?</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Visit the "AI Insights" tab to access all AI features
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Click the AI Assistant button for real-time help
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Get yield predictions and portfolio optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Analyze risks before making investment decisions
                </li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">Tips for Best Results:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Connect your wallet to get personalized recommendations</li>
                <li>• Start with small stakes to test AI predictions</li>
                <li>• Use AI analysis as guidance, not absolute truth</li>
                <li>• Always do your own research (DYOR)</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Start Using AI Features
          </button>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentStepData.icon}
              <div>
                <h2 className="text-xl font-bold text-gray-100">{currentStepData.title}</h2>
                <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 text-xl"
              >
                ×
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-neutral-700 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-purple-500'
                    : index < currentStep
                    ? 'bg-green-400'
                    : 'bg-neutral-600'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AISetupGuide