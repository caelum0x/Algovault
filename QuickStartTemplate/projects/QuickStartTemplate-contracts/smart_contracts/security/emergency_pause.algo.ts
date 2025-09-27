import { assert, Contract, uint64, GlobalState, Box, bytes, abimethod, Txn, Global, log, Bytes } from '@algorandfoundation/algorand-typescript'

// EmergencyLevel enum replacement
const EMERGENCY_LEVEL_NONE: uint64 = 0;
const EMERGENCY_LEVEL_LOW: uint64 = 1;
const EMERGENCY_LEVEL_MEDIUM: uint64 = 2;
const EMERGENCY_LEVEL_HIGH: uint64 = 3;
const EMERGENCY_LEVEL_CRITICAL: uint64 = 4;

interface EmergencyEvent {
  level: uint64 // EmergencyLevel: use EMERGENCY_LEVEL_* constants
  reason: string
  triggeredBy: bytes
  timestamp: uint64
  resolved: boolean
  resolvedAt: uint64
  resolvedBy: bytes
}

// Helper to concatenate bytes for box keys
function concat(a: bytes, b: bytes): bytes {
  return a.concat(b)
}

export class EmergencyPause extends Contract {
  // Global emergency state
  currentEmergencyLevel = GlobalState<uint64>()
  emergencyActive = GlobalState<boolean>()
  emergencyCount = GlobalState<uint64>()
  lastEmergencyTime = GlobalState<uint64>()
  
  // Access control
  admin = GlobalState<bytes>()
  emergencyOperators = GlobalState<bytes>() // Packed array of authorized operators
  
  // Emergency configuration
  cooldownPeriod = GlobalState<uint64>() // Minimum time between emergency activations
  autoResolveTime = GlobalState<uint64>() // Auto-resolve after this time for low-level emergencies
  maxEmergencyDuration = GlobalState<uint64>() // Maximum duration for any emergency
  
  // Monitoring and alerts
  suspiciousActivityThreshold = GlobalState<uint64>()
  failedTransactionThreshold = GlobalState<uint64>()
  largeWithdrawalThreshold = GlobalState<uint64>()
  
  // Circuit breaker parameters
  maxDailyVolume = GlobalState<uint64>()
  currentDailyVolume = GlobalState<uint64>()
  lastVolumeReset = GlobalState<uint64>()
  
  // Recovery mechanisms
  recoveryMode = GlobalState<boolean>()
  recoveryStartTime = GlobalState<uint64>()
  recoveryApprovals = GlobalState<uint64>() // Number of operator approvals for recovery

  @abimethod()
  initialize(
    admin: bytes,
    cooldownPeriod: uint64,
    autoResolveTime: uint64,
    maxEmergencyDuration: uint64
  ): void {
    assert(!this.emergencyActive.value)
    
    this.admin.value = admin
    this.currentEmergencyLevel.value = EMERGENCY_LEVEL_NONE
    this.emergencyActive.value = false
    this.emergencyCount.value = 0
    this.lastEmergencyTime.value = 0
    this.cooldownPeriod.value = cooldownPeriod
    this.autoResolveTime.value = autoResolveTime
    this.maxEmergencyDuration.value = maxEmergencyDuration
    
    // Initialize monitoring thresholds
    this.suspiciousActivityThreshold.value = 10 // 10 suspicious events
    this.failedTransactionThreshold.value = 100 // 100 failed transactions
    this.largeWithdrawalThreshold.value = 1000000000 // 1B microALGO
    
    // Initialize circuit breaker
    this.maxDailyVolume.value = 10000000000 // 10B microALGO daily limit
    this.currentDailyVolume.value = 0
    this.lastVolumeReset.value = Global.latestTimestamp
    
    this.recoveryMode.value = false
    this.recoveryApprovals.value = 0
  }

  @abimethod()
  triggerEmergency(level: uint64, reason: string): void {
    assert(this.isAuthorizedOperator(Txn.sender.bytes) || Txn.sender.bytes === this.admin.value)
    assert(level !== EMERGENCY_LEVEL_NONE)
    if (level < EMERGENCY_LEVEL_CRITICAL) {
      const timeSinceLastEmergency: uint64 = Global.latestTimestamp - this.lastEmergencyTime.value
      assert(timeSinceLastEmergency >= this.cooldownPeriod.value)
    }
    const eventId: uint64 = this.emergencyCount.value + 1 as uint64
    // Store each EmergencyEvent field in a separate box
    Box<uint64>({ key: concat(Bytes(eventId), Bytes('_level')) }).value = level
    Box<bytes>({ key: concat(Bytes(eventId), Bytes('_reason')) }).value = Bytes(reason)
    Box<bytes>({ key: concat(Bytes(eventId), Bytes('_triggeredBy')) }).value = Txn.sender.bytes
    Box<uint64>({ key: concat(Bytes(eventId), Bytes('_timestamp')) }).value = Global.latestTimestamp
    Box<uint64>({ key: concat(Bytes(eventId), Bytes('_resolved')) }).value = 0
    Box<uint64>({ key: concat(Bytes(eventId), Bytes('_resolvedAt')) }).value = 0
    Box<bytes>({ key: concat(Bytes(eventId), Bytes('_resolvedBy')) }).value = Global.zeroAddress.bytes
    this.currentEmergencyLevel.value = level
    this.emergencyActive.value = true
    this.emergencyCount.value = eventId
    this.lastEmergencyTime.value = Global.latestTimestamp
    log('EMERGENCY_ACTIVATED', level, reason, Txn.sender)
  }

  @abimethod()
  resolveEmergency(eventId: uint64, resolution: string): void {
    assert(Txn.sender.bytes === this.admin.value)
    assert(this.emergencyActive.value)
    const resolvedKey = concat(Bytes(eventId), Bytes('_resolved'))
    const resolvedAtKey = concat(Bytes(eventId), Bytes('_resolvedAt'))
    const resolvedByKey = concat(Bytes(eventId), Bytes('_resolvedBy'))
    assert(Box<uint64>({ key: resolvedKey }).exists)
    const resolved = Box<uint64>({ key: resolvedKey }).value
    assert(resolved === 0)
    assert(eventId === this.emergencyCount.value)
    Box<uint64>({ key: resolvedKey }).value = 1
    Box<uint64>({ key: resolvedAtKey }).value = Global.latestTimestamp
    Box<bytes>({ key: resolvedByKey }).value = Txn.sender.bytes
    this.currentEmergencyLevel.value = EMERGENCY_LEVEL_NONE
    this.emergencyActive.value = false
    if (this.recoveryMode.value) {
      this.recoveryMode.value = false
      this.recoveryApprovals.value = 0
    }
    log('EMERGENCY_RESOLVED', eventId, resolution, Txn.sender)
  }

  @abimethod()
  escalateEmergency(newLevel: uint64, reason: string): void {
    assert(Txn.sender.bytes === this.admin.value)
    assert(this.emergencyActive.value)
    assert(newLevel > this.currentEmergencyLevel.value)
    
    this.currentEmergencyLevel.value = newLevel
    
    log('EMERGENCY_ESCALATED', newLevel, reason, Txn.sender)
  }

  @abimethod()
  autoResolveCheck(): void {
    if (!this.emergencyActive.value) return
    const currentEventTimestamp = Box<uint64>({ key: concat(Bytes(this.emergencyCount.value), Bytes('_timestamp')) }).value
    let emergencyDuration: uint64 = Global.latestTimestamp - currentEventTimestamp
    // Auto-resolve low-level emergencies after specified time
    if (this.currentEmergencyLevel.value === EMERGENCY_LEVEL_LOW && emergencyDuration >= this.autoResolveTime.value) {
      this.resolveEmergency(this.emergencyCount.value, 'Auto-resolved after timeout')
      return
    }
    // Force resolution if emergency exceeds maximum duration
    if (emergencyDuration >= this.maxEmergencyDuration.value) {
      this.currentEmergencyLevel.value = EMERGENCY_LEVEL_CRITICAL
      log('EMERGENCY_MAX_DURATION_EXCEEDED', this.emergencyCount.value)
    }
  }

  @abimethod()
  addEmergencyOperator(operator: bytes): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    // Add operator to authorized list
    // Implementation would manage the packed array of operators
    log('EMERGENCY_OPERATOR_ADDED', operator)
  }

  @abimethod()
  removeEmergencyOperator(operator: bytes): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    // Remove operator from authorized list
    log('EMERGENCY_OPERATOR_REMOVED', operator)
  }

  @abimethod()
  activateRecoveryMode(): void {
    assert(this.currentEmergencyLevel.value === EMERGENCY_LEVEL_CRITICAL)
    assert(this.isAuthorizedOperator(Txn.sender.bytes))
    
    if (!this.recoveryMode.value) {
      this.recoveryMode.value = true
      this.recoveryStartTime.value = Global.latestTimestamp
      this.recoveryApprovals.value = 0
    }
    
    // Count operator approval
    this.recoveryApprovals.value = this.recoveryApprovals.value + 1
    
    log('RECOVERY_MODE_APPROVAL', Txn.sender, this.recoveryApprovals.value)
  }

  @abimethod()
  executeRecovery(): void {
    assert(this.recoveryMode.value)
    assert(this.recoveryApprovals.value >= 3) // Require 3 operator approvals
    assert(Txn.sender.bytes === this.admin.value)
    
    // Execute recovery procedures
    this.currentEmergencyLevel.value = EMERGENCY_LEVEL_NONE
    this.emergencyActive.value = false
    this.recoveryMode.value = false
    this.recoveryApprovals.value = 0
    
    log('RECOVERY_EXECUTED', Txn.sender)
  }

  @abimethod()
  checkCircuitBreaker(transactionAmount: uint64): boolean {
    // Reset daily volume if new day
    let daysSinceReset: uint64 = (Global.latestTimestamp - this.lastVolumeReset.value) / 86400 as uint64
    if (daysSinceReset >= 1) {
      this.currentDailyVolume.value = 0
      this.lastVolumeReset.value = Global.latestTimestamp
    }
    // Check if transaction would exceed daily limit
    let newDailyVolume: uint64 = this.currentDailyVolume.value + transactionAmount as uint64
    if (newDailyVolume > this.maxDailyVolume.value) {
      this.triggerEmergency(EMERGENCY_LEVEL_MEDIUM, 'Daily volume limit exceeded')
      return false
    }
    // Check for large withdrawal
    if (transactionAmount >= this.largeWithdrawalThreshold.value) {
      log('LARGE_WITHDRAWAL_DETECTED', transactionAmount, Txn.sender)
      if (!this.emergencyActive.value) {
        this.triggerEmergency(EMERGENCY_LEVEL_LOW, 'Large withdrawal detected')
      }
    }
    this.currentDailyVolume.value = newDailyVolume
    return true
  }

  @abimethod()
  reportSuspiciousActivity(activityType: string, details: string): void {
    // Anyone can report suspicious activity
    
    log('SUSPICIOUS_ACTIVITY_REPORTED', activityType, details, Txn.sender)
    
    // Implement logic to count suspicious activities and auto-trigger emergency
    // This would typically involve tracking reports in box storage
  }

  @abimethod()
  updateEmergencyThresholds(
    suspiciousThreshold: uint64,
    failedTxThreshold: uint64,
    largeWithdrawalThreshold: uint64,
    maxDailyVolume: uint64
  ): void {
    assert(Txn.sender.bytes === this.admin.value)
    
    this.suspiciousActivityThreshold.value = suspiciousThreshold
    this.failedTransactionThreshold.value = failedTxThreshold
    this.largeWithdrawalThreshold.value = largeWithdrawalThreshold
    this.maxDailyVolume.value = maxDailyVolume
  }

  // Function authorization checks
  isOperationAllowed(operationType: string): boolean {
    if (!this.emergencyActive.value) {
      return true // Normal operations allowed
    }
    
    const level = this.currentEmergencyLevel.value
    
    if (level === EMERGENCY_LEVEL_CRITICAL) {
      // Only emergency and admin functions allowed
      return operationType === 'emergency' || operationType === 'admin'
    }
    
    if (level === EMERGENCY_LEVEL_HIGH) {
      // No user operations, only emergency and admin
      return operationType === 'emergency' || operationType === 'admin' || operationType === 'view'
    }
    
    if (level === EMERGENCY_LEVEL_MEDIUM) {
      // Limited operations: withdrawals and views only
      return operationType === 'withdraw' || operationType === 'view' || operationType === 'emergency' || operationType === 'admin'
    }
    
    if (level === EMERGENCY_LEVEL_LOW) {
      // Most operations allowed except new deposits
      return operationType !== 'deposit'
    }
    
    return true
  }

  // View functions
  isAuthorizedOperator(operator: bytes): boolean {
    // Implementation would check the packed array of operators
    return operator === this.admin.value // Simplified for now
  }

  getEmergencyEvent(eventId: uint64): { level: uint64, reason: bytes, triggeredBy: bytes, timestamp: uint64, resolved: uint64, resolvedAt: uint64, resolvedBy: bytes } {
    const levelKey = concat(Bytes(eventId), Bytes('_level'))
    const reasonKey = concat(Bytes(eventId), Bytes('_reason'))
    const triggeredByKey = concat(Bytes(eventId), Bytes('_triggeredBy'))
    const timestampKey = concat(Bytes(eventId), Bytes('_timestamp'))
    const resolvedKey = concat(Bytes(eventId), Bytes('_resolved'))
    const resolvedAtKey = concat(Bytes(eventId), Bytes('_resolvedAt'))
    const resolvedByKey = concat(Bytes(eventId), Bytes('_resolvedBy'))
    return {
      level: Box<uint64>({ key: levelKey }).value,
      reason: Box<bytes>({ key: reasonKey }).value,
      triggeredBy: Box<bytes>({ key: triggeredByKey }).value,
      timestamp: Box<uint64>({ key: timestampKey }).value,
      resolved: Box<uint64>({ key: resolvedKey }).value,
      resolvedAt: Box<uint64>({ key: resolvedAtKey }).value,
      resolvedBy: Box<bytes>({ key: resolvedByKey }).value
    }
  }

  getCurrentEmergencyStatus(): { active: boolean, level: uint64, eventId: uint64, duration: uint64, recoveryMode: boolean } {
    let duration: uint64 = 0
    if (this.emergencyActive.value) {
      const currentEventTimestamp = Box<uint64>({ key: concat(Bytes(this.emergencyCount.value), Bytes('_timestamp')) }).value
      duration = Global.latestTimestamp - currentEventTimestamp
    }
    return {
      active: this.emergencyActive.value,
      level: this.currentEmergencyLevel.value,
      eventId: this.emergencyCount.value,
      duration: duration,
      recoveryMode: this.recoveryMode.value
    }
  }

  getCircuitBreakerStatus(): { currentDailyVolume: uint64, maxDailyVolume: uint64, remainingVolume: uint64, lastReset: uint64 } {
    let remaining: uint64 = 0
    if (this.maxDailyVolume.value > this.currentDailyVolume.value) {
      remaining = this.maxDailyVolume.value - this.currentDailyVolume.value
    }
    return {
      currentDailyVolume: this.currentDailyVolume.value,
      maxDailyVolume: this.maxDailyVolume.value,
      remainingVolume: remaining,
      lastReset: this.lastVolumeReset.value
    }
  }

  getEmergencyHistory(limit: uint64): { level: uint64, reason: bytes, triggeredBy: bytes, timestamp: uint64, resolved: uint64, resolvedAt: uint64, resolvedBy: bytes }[] {
    let events: { level: uint64, reason: bytes, triggeredBy: bytes, timestamp: uint64, resolved: uint64, resolvedAt: uint64, resolvedBy: bytes }[] = []
    let count: uint64 = 0
    let i: uint64 = this.emergencyCount.value
    while (i > 0 && count < limit) {
      const levelKey = concat(Bytes(i), Bytes('_level'))
      if (Box<uint64>({ key: levelKey }).exists) {
        const event = this.getEmergencyEvent(i)
        events = events.concat([event])
        count = count + 1 as uint64
      }
      i = i - 1 as uint64
    }
    return events
  }
}