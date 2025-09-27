export enum ProposalStatus {
  Pending = 'pending',
  Active = 'active',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Executed = 'executed',
  Cancelled = 'cancelled',
}

export enum ProposalType {
  UpdateRewardRate = 'update_reward_rate',
  UpdateMinimumStake = 'update_minimum_stake',
  UpdateFees = 'update_fees',
  EmergencyAction = 'emergency_action',
  UpdateGovernance = 'update_governance',
  AddPool = 'add_pool',
  RemovePool = 'remove_pool',
}

export enum VoteOption {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export interface Proposal {
  id: string
  proposer: string
  title: string
  description: string
  type: ProposalType
  targetContract?: string
  executionData?: string
  votingStartTime: number
  votingEndTime: number
  executionTime?: number
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
  status: ProposalStatus
  quorumRequired: number
  executed: boolean
  cancelled: boolean
  txId?: string
}

export interface Vote {
  voter: string
  proposalId: string
  option: VoteOption
  votingPower: bigint
  timestamp: number
  txId: string
  reason?: string
}

export interface VoterProfile {
  address: string
  votingPower: bigint
  votingPowerPercentage: number
  totalVotes: number
  participationRate: number
  averageVotingPower: bigint
  delegatedTo?: string
  delegatedFrom: string[]
  proposalsCreated: number
  lastVoted?: number
}

export interface GovernanceStats {
  totalVotingPower: bigint
  activeProposals: number
  totalProposals: number
  totalVoters: number
  averageParticipation: number
  quorumThreshold: number
  proposalThreshold: bigint
  votingDuration: number
  executionDelay: number
  gracePeriod: number
}

export interface ProposalForm {
  title: string
  description: string
  type: ProposalType
  targetContract?: string
  executionData?: string
  requiredVotingPower: bigint
  userVotingPower: bigint
}

export interface VotingFormData {
  proposalId: string
  option: VoteOption
  reason?: string
  votingPower: bigint
}

export interface DelegationData {
  delegateTo: string
  currentDelegate?: string
  votingPower: bigint
  delegationHistory: {
    timestamp: number
    delegate: string
    txId: string
  }[]
}

export interface GovernanceConfig {
  votingDuration: number // Duration in seconds
  quorumThreshold: number // Percentage (0-100)
  proposalThreshold: bigint // Minimum tokens needed to propose
  executionDelay: number // Delay before execution in seconds
  gracePeriod: number // Grace period for execution in seconds
  governanceToken: string // Asset ID of governance token
  maxActiveProposals: number
  minVotingPeriod: number
  maxVotingPeriod: number
}

export interface ProposalOutcome {
  proposalId: string
  passed: boolean
  totalVotes: bigint
  participationRate: number
  quorumMet: boolean
  majorityReached: boolean
  executionScheduled?: number
  executionTxId?: string
}

export interface GovernanceActivity {
  type: 'proposal_created' | 'vote_cast' | 'proposal_executed' | 'delegation'
  timestamp: number
  user: string
  proposalId?: string
  details: string
  txId: string
}

export interface QuorumProgress {
  current: bigint
  required: bigint
  percentage: number
  remainingTime: number
  onTrack: boolean
}

export interface VotingDistribution {
  option: VoteOption
  votes: bigint
  percentage: number
  voters: number
}

// UI Component Props Types
export interface ProposalCardProps {
  proposal: Proposal
  userVote?: Vote
  userVotingPower: bigint
  onVote: (proposalId: string, option: VoteOption, reason?: string) => Promise<void>
  onDelegate?: (delegate: string) => Promise<void>
}

export interface VotingInterfaceProps {
  proposal: Proposal
  userVotingPower: bigint
  hasVoted: boolean
  timeRemaining: number
  onVote: (option: VoteOption, reason?: string) => Promise<void>
  loading?: boolean
}

export interface CreateProposalProps {
  minimumVotingPower: bigint
  userVotingPower: bigint
  onCreateProposal: (proposal: ProposalForm) => Promise<void>
  availableTypes: ProposalType[]
}

export interface GovernanceDashboardProps {
  stats: GovernanceStats
  recentActivity: GovernanceActivity[]
  userProfile?: VoterProfile
  activeProposals: Proposal[]
}

// Analytics and Metrics
export interface GovernanceMetrics {
  proposalSuccessRate: number
  averageParticipation: number
  averageQuorum: number
  proposalTypes: {
    type: ProposalType
    count: number
    successRate: number
  }[]
  participationTrend: {
    timestamp: number
    participation: number
  }[]
  votingPowerDistribution: {
    range: string
    count: number
    totalPower: bigint
  }[]
}

export interface ProposalAnalytics {
  proposalId: string
  viewCount: number
  discussionCount: number
  socialSentiment: 'positive' | 'negative' | 'neutral'
  predictedOutcome: {
    prediction: 'pass' | 'fail'
    confidence: number
    reasoning: string[]
  }
  influentialVoters: {
    address: string
    votingPower: bigint
    influence: number
  }[]
}

// Event types for real-time updates
export interface GovernanceEvent {
  type: 'proposal_created' | 'vote_cast' | 'proposal_ended' | 'proposal_executed'
  proposalId: string
  user?: string
  timestamp: number
  txId?: string
  data?: any
}

// Filter and search types
export interface ProposalFilter {
  status?: ProposalStatus[]
  type?: ProposalType[]
  timeframe?: {
    start: number
    end: number
  }
  minVotingPower?: bigint
  proposer?: string
}

export interface ProposalSearchCriteria {
  query?: string
  filter?: ProposalFilter
  sortBy?: 'created' | 'ending' | 'votes' | 'participation'
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Notification types specific to governance
export interface GovernanceNotification {
  id: string
  type: 'proposal_ending' | 'new_proposal' | 'vote_reminder' | 'execution_ready'
  proposalId: string
  title: string
  message: string
  timestamp: number
  read: boolean
  urgent: boolean
}
