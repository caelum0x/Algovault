import { assert, bytes, Contract, uint64, GlobalState, Box, abimethod, Txn, Global, Bytes } from '@algorandfoundation/algorand-typescript'

// ProposalStatus enum replacement
const PROPOSAL_STATUS_PENDING: uint64 = 0;
const PROPOSAL_STATUS_ACTIVE: uint64 = 1;
const PROPOSAL_STATUS_SUCCEEDED: uint64 = 2;
const PROPOSAL_STATUS_FAILED: uint64 = 3;
const PROPOSAL_STATUS_EXECUTED: uint64 = 4;
const PROPOSAL_STATUS_CANCELLED: uint64 = 5;

// ProposalType enum replacement
const PROPOSAL_TYPE_UPDATE_REWARD_RATE: uint64 = 0;
const PROPOSAL_TYPE_UPDATE_MINIMUM_STAKE: uint64 = 1;
const PROPOSAL_TYPE_UPDATE_FEES: uint64 = 2;
const PROPOSAL_TYPE_EMERGENCY_ACTION: uint64 = 3;
const PROPOSAL_TYPE_UPDATE_GOVERNANCE: uint64 = 4;
const PROPOSAL_TYPE_ADD_POOL: uint64 = 5;
const PROPOSAL_TYPE_REMOVE_POOL: uint64 = 6;

// Helper to convert uint64 to bytes for box keys
function uint64ToBytes(x: uint64): bytes {
  return Bytes(x)
}
// Helper to concat bytes for vote keys
function voteKey(voter: bytes, proposalId: uint64): bytes {
  return concat(voter, uint64ToBytes(proposalId))
}
// Helper to concat bytes
function concat(a: bytes, b: bytes): bytes {
  return a.concat(b)
}

export class GovernanceVault extends Contract {
  // Global governance parameters
  proposalCount = GlobalState<uint64>()
  votingDuration = GlobalState<uint64>() // Duration in seconds
  quorumThreshold = GlobalState<uint64>() // Percentage of total voting power needed
  proposalThreshold = GlobalState<uint64>() // Minimum voting power to create proposal
  
  // Governance token info
  governanceToken = GlobalState<uint64>() // Asset ID of governance token
  totalVotingPower = GlobalState<uint64>()
  
  // Admin controls
  admin = GlobalState<bytes>()
  governanceActive = GlobalState<uint64>() // 1 = true, 0 = false
  
  // Time delays for security
  executionDelay = GlobalState<uint64>() // Delay before execution after passing
  gracePeriod = GlobalState<uint64>() // Grace period for execution

  @abimethod()
  initialize(
    governanceTokenId: uint64,
    votingDuration: uint64,
    quorumThreshold: uint64,
    proposalThreshold: uint64,
    executionDelay: uint64,
    gracePeriod: uint64
  ): void {
    assert(this.governanceActive.value === 0 as uint64)
    
    this.governanceToken.value = governanceTokenId
    this.votingDuration.value = votingDuration
    this.quorumThreshold.value = quorumThreshold
    this.proposalThreshold.value = proposalThreshold
    this.executionDelay.value = executionDelay
    this.gracePeriod.value = gracePeriod
    this.proposalCount.value = 0
    this.totalVotingPower.value = 0
    this.governanceActive.value = 1 as uint64
    this.admin.value = Txn.sender.bytes
  }

  @abimethod()
  createProposal(
    title: bytes,
    description: bytes,
    proposalType: uint64,
    targetContract: bytes,
    executionData: bytes
  ): uint64 {
    assert(this.governanceActive.value === 1 as uint64)
    const proposerVotingPower = this.getVotingPower(Txn.sender.bytes)
    assert(proposerVotingPower >= this.proposalThreshold.value)
    const proposalId: uint64 = this.proposalCount.value + 1 as uint64
    this.proposalCount.value = proposalId
    // Store each field as a separate box
    Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_proposer')) }).value = Txn.sender.bytes
    Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_title')) }).value = title
    Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_description')) }).value = description
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_proposalType')) }).value = proposalType
    Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_targetContract')) }).value = targetContract
    Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_executionData')) }).value = executionData
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingStartTime')) }).value = Global.latestTimestamp
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingEndTime')) }).value = Global.latestTimestamp + this.votingDuration.value as uint64
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_forVotes')) }).value = 0 as uint64
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_againstVotes')) }).value = 0 as uint64
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_abstainVotes')) }).value = 0 as uint64
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_status')) }).value = PROPOSAL_STATUS_ACTIVE
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_quorumRequired')) }).value = this.quorumThreshold.value
    Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_executed')) }).value = 0 as uint64
    return proposalId
  }

  @abimethod()
  vote(proposalId: uint64, support: uint64): void {
    assert(this.governanceActive.value === 1 as uint64)
    assert(support <= 2)
    const status = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_status')) }).value
    assert(status === PROPOSAL_STATUS_ACTIVE)
    const votingEndTime = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingEndTime')) }).value
    assert(Global.latestTimestamp <= votingEndTime)
    const voter = Txn.sender.bytes
    const votingPower = this.getVotingPower(voter)
    assert(votingPower > 0)
    // Check if user already voted
    assert(!Box<uint64>({ key: voteKey(voter, proposalId) }).exists, 'Already voted on this proposal')
    // Record the vote
    Box<uint64>({ key: voteKey(voter, proposalId) }).value = support
    // Update proposal vote counts
    if (support === 0 as uint64) {
      const againstVotesKey = concat(uint64ToBytes(proposalId), Bytes('_againstVotes'))
      Box<uint64>({ key: againstVotesKey }).value = Box<uint64>({ key: againstVotesKey }).value + votingPower as uint64
    } else if (support === 1 as uint64) {
      const forVotesKey = concat(uint64ToBytes(proposalId), Bytes('_forVotes'))
      Box<uint64>({ key: forVotesKey }).value = Box<uint64>({ key: forVotesKey }).value + votingPower as uint64
    } else {
      const abstainVotesKey = concat(uint64ToBytes(proposalId), Bytes('_abstainVotes'))
      Box<uint64>({ key: abstainVotesKey }).value = Box<uint64>({ key: abstainVotesKey }).value + votingPower as uint64
    }
  }

  @abimethod()
  finalizeProposal(proposalId: uint64): void {
    const statusKey = concat(uint64ToBytes(proposalId), Bytes('_status'))
    const status = Box<uint64>({ key: statusKey }).value
    assert(status === PROPOSAL_STATUS_ACTIVE)
    const votingEndTime = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingEndTime')) }).value
    assert(Global.latestTimestamp > votingEndTime)
    const forVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_forVotes')) }).value
    const againstVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_againstVotes')) }).value
    const abstainVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_abstainVotes')) }).value
    const totalVotes = forVotes + againstVotes + abstainVotes as uint64
    const quorumRequired = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_quorumRequired')) }).value
    const quorumMet = (totalVotes * 100 as uint64) >= (this.totalVotingPower.value * quorumRequired as uint64)
    if (quorumMet && forVotes > againstVotes) {
      Box<uint64>({ key: statusKey }).value = PROPOSAL_STATUS_SUCCEEDED
    } else {
      Box<uint64>({ key: statusKey }).value = PROPOSAL_STATUS_FAILED
    }
  }

  @abimethod()
  executeProposal(proposalId: uint64): void {
    const statusKey = concat(uint64ToBytes(proposalId), Bytes('_status'))
    const status = Box<uint64>({ key: statusKey }).value
    assert(status === PROPOSAL_STATUS_SUCCEEDED)
    const executedKey = concat(uint64ToBytes(proposalId), Bytes('_executed'))
    assert(Box<uint64>({ key: executedKey }).value === 0 as uint64)
    const votingEndTime = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingEndTime')) }).value
    assert(Global.latestTimestamp >= votingEndTime + this.executionDelay.value)
    assert(Global.latestTimestamp <= votingEndTime + this.executionDelay.value + this.gracePeriod.value)
    // Mark as executed
    Box<uint64>({ key: executedKey }).value = 1 as uint64
    Box<uint64>({ key: statusKey }).value = PROPOSAL_STATUS_EXECUTED
  }

  @abimethod()
  cancelProposal(proposalId: uint64): void {
    assert(Txn.sender.bytes === this.admin.value)
    const statusKey = concat(uint64ToBytes(proposalId), Bytes('_status'))
    const status = Box<uint64>({ key: statusKey }).value
    assert(status === PROPOSAL_STATUS_ACTIVE || status === PROPOSAL_STATUS_SUCCEEDED)
    Box<uint64>({ key: statusKey }).value = PROPOSAL_STATUS_CANCELLED
  }

  @abimethod()
  delegateVoting(delegate: bytes): void {
    Box<bytes>({ key: Txn.sender.bytes }).value = delegate
  }

  @abimethod()
  updateVotingPower(user: bytes, newPower: uint64): void {
    // This would typically be called by the staking contract
    // to update voting power based on staked tokens
    
    const oldPower = this.getVotingPower(user)
    const votingPowerKey = Box<uint64>({ key: user })
    
    votingPowerKey.value = newPower
    
    // Update total voting power
    this.totalVotingPower.value = this.totalVotingPower.value - oldPower + newPower
  }

  // Admin functions
  @abimethod()
  updateGovernanceParameters(
    newVotingDuration: uint64,
    newQuorumThreshold: uint64,
    newProposalThreshold: uint64
  ): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.votingDuration.value = newVotingDuration
    this.quorumThreshold.value = newQuorumThreshold
    this.proposalThreshold.value = newProposalThreshold
  }

  @abimethod()
  pauseGovernance(): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.governanceActive.value = 0 as uint64
  }

  @abimethod()
  resumeGovernance(): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.governanceActive.value = 1 as uint64
  }

  // View functions
  getVotingPower(user: bytes): uint64 {
    const votingPowerKey = Box<uint64>({ key: user })
    if (votingPowerKey.exists) {
      return votingPowerKey.value
    }
    return 0 as uint64
  }

  getProposal(proposalId: uint64): [bytes, bytes, bytes, uint64, bytes, bytes, uint64, uint64, uint64, uint64, uint64, uint64, uint64, uint64, uint64] {
    // Return tuple of AVM primitives for proposal fields
    return [
      Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_proposer')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_title')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_description')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_proposalType')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_targetContract')) }).value,
      Box<bytes>({ key: concat(uint64ToBytes(proposalId), Bytes('_executionData')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingStartTime')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_votingEndTime')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_forVotes')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_againstVotes')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_abstainVotes')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_status')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_quorumRequired')) }).value,
      Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_executed')) }).value,
      proposalId
    ]
  }

  getVote(voter: bytes, proposalId: uint64): uint64 {
    // Return support value (0, 1, 2) for this vote
    return Box<uint64>({ key: voteKey(voter, proposalId) }).value
  }

  hasVoted(voter: bytes, proposalId: uint64): uint64 {
    return Box<uint64>({ key: voteKey(voter, proposalId) }).exists ? 1 as uint64 : 0 as uint64
  }

  getGovernanceInfo(): [uint64, uint64, uint64, uint64, uint64, uint64] {
    return [
      this.proposalCount.value,
      this.votingDuration.value,
      this.quorumThreshold.value,
      this.proposalThreshold.value,
      this.totalVotingPower.value,
      this.governanceActive.value
    ]
  }

  calculateQuorumProgress(proposalId: uint64): uint64 {
    const forVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_forVotes')) }).value
    const againstVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_againstVotes')) }).value
    const abstainVotes = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_abstainVotes')) }).value
    const totalVotes = forVotes + againstVotes + abstainVotes as uint64
    const quorumRequired = Box<uint64>({ key: concat(uint64ToBytes(proposalId), Bytes('_quorumRequired')) }).value
    const requiredVotes = (this.totalVotingPower.value * quorumRequired as uint64) / 100 as uint64
    return requiredVotes > 0 ? (totalVotes * 100 as uint64) / requiredVotes as uint64 : 0 as uint64
  }
}