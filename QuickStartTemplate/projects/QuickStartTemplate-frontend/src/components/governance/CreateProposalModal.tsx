import React, { useState, useEffect } from 'react'
import {
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlinePlus,
  AiOutlineCalendar,
  AiOutlineCode,
  AiOutlineFileText,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from 'react-icons/ai'
import { BsFillPersonFill, BsGraphUp, BsShield } from 'react-icons/bs'
import { ProposalType } from '../../types/governance'
import { useGovernance } from '../../hooks/useGovernance'
import { formatLargeNumber } from '../../utils/vault/yieldCalculations'

interface CreateProposalModalProps {
  isOpen: boolean
  onClose: () => void
  onProposalCreated?: (proposalId: string) => void
}

interface ProposalFormData {
  title: string
  description: string
  type: ProposalType
  targetContract?: string
  executionData?: string
  votingDuration: number
  executionDelay: number
  quorumRequired: number
  reason: string
}

const proposalTypes = [
  {
    type: ProposalType.UpdateRewardRate,
    label: 'Update Reward Rate',
    description: 'Modify the reward rate for staking pools',
    icon: <BsGraphUp />,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
  },
  {
    type: ProposalType.UpdateMinimumStake,
    label: 'Update Minimum Stake',
    description: 'Change the minimum stake requirement',
    icon: <BsFillPersonFill />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
  },
  {
    type: ProposalType.UpdateFees,
    label: 'Update Protocol Fees',
    description: 'Modify fee structure across the protocol',
    icon: <AiOutlineCode />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
  {
    type: ProposalType.EmergencyAction,
    label: 'Emergency Action',
    description: 'Critical security or operational changes',
    icon: <BsShield />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20',
  },
]

export default function CreateProposalModal({ isOpen, onClose, onProposalCreated }: CreateProposalModalProps) {
  const { governanceStats, userVotingPower, createProposal, creating } = useGovernance()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    type: ProposalType.UpdateRewardRate,
    targetContract: '',
    executionData: '',
    votingDuration: 604800, // 7 days in seconds
    executionDelay: 172800, // 2 days in seconds
    quorumRequired: 10,
    reason: '',
  })

  interface ProposalFormErrors {
    title?: string
    description?: string
    type?: string
    targetContract?: string
    executionData?: string
    votingDuration?: string
    executionDelay?: string
    quorumRequired?: string
    reason?: string
  }

  const [errors, setErrors] = useState<ProposalFormErrors>({})
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setFormData({
        title: '',
        description: '',
        type: ProposalType.UpdateRewardRate,
        targetContract: '',
        executionData: '',
        votingDuration: 604800,
        executionDelay: 172800,
        quorumRequired: 10,
        reason: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: ProposalFormErrors = {}

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (formData.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters'
    }

    if (stepNumber === 2) {
      if (formData.type === ProposalType.EmergencyAction) {
        if (!formData.targetContract?.trim()) newErrors.targetContract = 'Target contract is required for emergency actions'
      }
      if (formData.votingDuration < 86400) newErrors.votingDuration = 'Voting duration must be at least 1 day'
      if (formData.executionDelay < 0) newErrors.executionDelay = 'Execution delay cannot be negative'
      if (formData.quorumRequired < 5 || formData.quorumRequired > 50) {
        newErrors.quorumRequired = 'Quorum must be between 5% and 50%'
      }
    }

    if (stepNumber === 3) {
      if (!formData.reason.trim()) newErrors.reason = 'Justification is required'
      if (formData.reason.length > 500) newErrors.reason = 'Justification must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    try {
      const proposalData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        targetContract: formData.targetContract || undefined,
        executionData: formData.executionData || undefined,
        votingStartTime: Date.now(),
        votingEndTime: Date.now() + formData.votingDuration * 1000,
        executionTime: Date.now() + formData.votingDuration * 1000 + formData.executionDelay * 1000,
        quorumRequired: formData.quorumRequired,
        executed: false,
        cancelled: false,
        proposer: '', // TODO: Replace with correct user address if available
      }

      const txId = await createProposal(proposalData)

      if (txId) {
        onProposalCreated?.(txId)
        onClose()
      }
    } catch (error) {
      console.error('Failed to create proposal:', error)
    }
  }

  const selectedType = proposalTypes.find((t) => t.type === formData.type)
  const canCreateProposal = governanceStats && userVotingPower >= governanceStats.proposalThreshold

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <AiOutlinePlus className="text-xl text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Create Proposal</h2>
              <p className="text-sm text-gray-400">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-300 hover:bg-neutral-700 rounded-lg transition-colors">
            <AiOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    stepNum <= step ? 'bg-cyan-500 text-white' : 'bg-neutral-700 text-gray-400'
                  }`}
                >
                  {stepNum < step ? <AiOutlineCheckCircle /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 rounded transition-colors ${stepNum < step ? 'bg-cyan-500' : 'bg-neutral-700'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Basic Info</span>
            <span>Configuration</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Check if user can create proposals */}
          {!canCreateProposal && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AiOutlineExclamationCircle className="text-red-400 text-xl mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium mb-1">Insufficient Voting Power</h3>
                  <p className="text-red-300/80 text-sm">
                    You need at least {governanceStats ? formatLargeNumber(Number(governanceStats.proposalThreshold) / 1e6) : '1,000'} ALGO
                    voting power to create proposals. You currently have {formatLargeNumber(Number(userVotingPower) / 1e6)} ALGO.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Basic Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Proposal Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a clear, descriptive title"
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      maxLength={100}
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                    <p className="text-gray-400 text-xs mt-1">{formData.title.length}/100 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide a detailed description of what this proposal aims to achieve"
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                      maxLength={1000}
                    />
                    {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                    <p className="text-gray-400 text-xs mt-1">{formData.description.length}/1000 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Proposal Type *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {proposalTypes.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => setFormData((prev) => ({ ...prev, type: type.type }))}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            formData.type === type.type
                              ? `${type.bgColor} ${type.borderColor} ${type.color}`
                              : 'bg-neutral-700/50 border-neutral-600 text-gray-300 hover:border-neutral-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`text-xl ${formData.type === type.type ? type.color : 'text-gray-400'}`}>{type.icon}</div>
                            <div>
                              <h4 className="font-medium mb-1">{type.label}</h4>
                              <p className="text-xs opacity-80">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Configuration</h3>

                <div className="space-y-4">
                  {/* Advanced Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-200">Advanced Mode</h4>
                      <p className="text-sm text-gray-400">Configure advanced settings and execution data</p>
                    </div>
                    <button
                      onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                      className={`w-12 h-6 rounded-full transition-colors ${isAdvancedMode ? 'bg-cyan-500' : 'bg-neutral-600'}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          isAdvancedMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <AiOutlineCalendar className="inline mr-2" />
                        Voting Duration (days)
                      </label>
                      <select
                        value={formData.votingDuration / 86400}
                        onChange={(e) => setFormData((prev) => ({ ...prev, votingDuration: parseInt(e.target.value) * 86400 }))}
                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500"
                      >
                        <option value={1}>1 Day</option>
                        <option value={3}>3 Days</option>
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Quorum Required (%)</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={formData.quorumRequired}
                        onChange={(e) => setFormData((prev) => ({ ...prev, quorumRequired: parseInt(e.target.value) || 10 }))}
                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500"
                      />
                      {errors.quorumRequired && <p className="text-red-400 text-sm mt-1">{errors.quorumRequired}</p>}
                    </div>
                  </div>

                  {isAdvancedMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Execution Delay (hours)</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.executionDelay / 3600}
                          onChange={(e) => setFormData((prev) => ({ ...prev, executionDelay: parseInt(e.target.value) * 3600 || 0 }))}
                          className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {(formData.type === ProposalType.EmergencyAction || formData.type === ProposalType.UpdateRewardRate) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Target Contract Address
                            {formData.type === ProposalType.EmergencyAction && ' *'}
                          </label>
                          <input
                            type="text"
                            value={formData.targetContract || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, targetContract: e.target.value }))}
                            placeholder="Contract address to execute against"
                            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                          />
                          {errors.targetContract && <p className="text-red-400 text-sm mt-1">{errors.targetContract}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Execution Data (hex)</label>
                        <textarea
                          value={formData.executionData || ''}
                          onChange={(e) => setFormData((prev) => ({ ...prev, executionData: e.target.value }))}
                          placeholder="0x... (optional contract call data)"
                          rows={3}
                          className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none font-mono text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Review & Submit</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Justification *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="Explain why this proposal is necessary and beneficial for the protocol"
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                      maxLength={500}
                    />
                    {errors.reason && <p className="text-red-400 text-sm mt-1">{errors.reason}</p>}
                    <p className="text-gray-400 text-xs mt-1">{formData.reason.length}/500 characters</p>
                  </div>

                  {/* Proposal Summary */}
                  <div className="bg-neutral-700/50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
                      <AiOutlineFileText />
                      Proposal Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-gray-200">{selectedType?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Voting Duration:</span>
                        <span className="text-gray-200">{formData.votingDuration / 86400} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quorum Required:</span>
                        <span className="text-gray-200">{formData.quorumRequired}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Execution Delay:</span>
                        <span className="text-gray-200">{formData.executionDelay / 3600} hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning for Emergency Actions */}
                  {formData.type === ProposalType.EmergencyAction && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AiOutlineExclamationCircle className="text-yellow-400 text-xl mt-0.5" />
                        <div>
                          <h4 className="text-yellow-400 font-medium mb-1">Emergency Action Warning</h4>
                          <p className="text-yellow-300/80 text-sm">
                            Emergency actions require higher consensus and immediate attention from the community. Ensure your justification
                            clearly explains the urgency.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-700">
          <div>
            {step > 1 && (
              <button onClick={handlePrevious} className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors">
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 transform active:scale-95"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={creating || !canCreateProposal}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 transform active:scale-95 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <AiOutlineCheckCircle />
                    Create Proposal
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
