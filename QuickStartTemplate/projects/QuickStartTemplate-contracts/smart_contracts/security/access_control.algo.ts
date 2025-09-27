import { assert, bytes, Bytes, Contract, GlobalState, log, uint64, abimethod, Txn, Global, Box } from '@algorandfoundation/algorand-typescript'

// Role enum replacement
const ROLE_NONE: uint64 = 0;
const ROLE_USER: uint64 = 1;
const ROLE_OPERATOR: uint64 = 2;
const ROLE_ADMIN: uint64 = 3;
const ROLE_SUPERADMIN: uint64 = 4;

// Permission enum replacement
const PERMISSION_READ: uint64 = 0;
const PERMISSION_WRITE: uint64 = 1;
const PERMISSION_EXECUTE: uint64 = 2;
const PERMISSION_MANAGE: uint64 = 3;
const PERMISSION_EMERGENCY: uint64 = 4;

interface RoleData {
  role: uint64 // Role: use ROLE_* constants
  permissions: uint64 // Bitmask of permissions
  assignedBy: bytes
  assignedAt: uint64
  expiresAt: uint64 // 0 for permanent
  revoked: boolean
  revokedAt: uint64
  revokedBy: bytes
}

interface PermissionRequest {
  requester: bytes
  targetRole: uint64 // Role: use ROLE_* constants
  requestedPermissions: uint64
  reason: string
  requestedAt: uint64
  approvals: uint64
  approvers: bytes // Packed array of approver addresses
  status: uint64// 0 = pending, 1 = approved, 2 = rejected
}

// Helper to concatenate bytes for box keys
function concat(a: bytes, b: bytes): bytes {
  // Simple concat for AVM: a || b
  return a.concat(b)
}

export class AccessControl extends Contract {
  // Global access control state
  totalUsers = GlobalState<uint64>()
  totalAdmins = GlobalState<uint64>()
  totalOperators = GlobalState<uint64>()

  // Super admin (contract deployer initially)
  superAdmin = GlobalState<bytes>()
  
  // Access control configuration
  maxAdmins = GlobalState<uint64>()
  maxOperators = GlobalState<uint64>()
  multiSigRequiredForAdmin = GlobalState<uint64>() // Number of approvals needed
  
  // Permission management
  permissionRequestCount = GlobalState<uint64>()
  defaultUserPermissions = GlobalState<uint64>()
  emergencyOverride = GlobalState<boolean>()
  
  // Time-based controls
  adminSessionDuration = GlobalState<uint64>() // Max session time for admins
  operatorSessionDuration = GlobalState<uint64>()
  
  // Security monitoring
  failedAccessAttempts = GlobalState<uint64>()
  lastSecurityAudit = GlobalState<uint64>()
  accessLogCount = GlobalState<uint64>()

  @abimethod()
  initialize(
    maxAdmins: uint64,
    maxOperators: uint64,
    multiSigRequired: uint64,
    defaultPermissions: uint64
  ): void {
    assert(!this.superAdmin.value)
    
    this.superAdmin.value = Txn.sender.bytes
    this.maxAdmins.value = maxAdmins
    this.maxOperators.value = maxOperators
    this.multiSigRequiredForAdmin.value = multiSigRequired
    this.defaultUserPermissions.value = defaultPermissions
    
    this.totalUsers.value = 0
    this.totalAdmins.value = 0
    this.totalOperators.value = 0
    this.permissionRequestCount.value = 0
    this.emergencyOverride.value = false
    
    // Set session durations (in seconds)
    this.adminSessionDuration.value = 28800 // 8 hours
    this.operatorSessionDuration.value = 14400 // 4 hours
    
    this.failedAccessAttempts.value = 0
    this.lastSecurityAudit.value = Global.latestTimestamp
    this.accessLogCount.value = 0
    
    // Assign super admin role to deployer
    this.assignRole(Txn.sender.bytes, ROLE_SUPERADMIN, (1 << PERMISSION_READ) | (1 << PERMISSION_WRITE) | (1 << PERMISSION_EXECUTE) | (1 << PERMISSION_MANAGE) | (1 << PERMISSION_EMERGENCY), 0)
  }

  @abimethod()
  assignRole(
    user: bytes,
    role: uint64,
    permissions: uint64,
    expiresAt: uint64
  ): void {
    assert(this.hasPermission(Txn.sender.bytes, PERMISSION_MANAGE))
    
    // Validate role assignment limits
    if (role === ROLE_ADMIN) {
      assert(this.totalAdmins.value < this.maxAdmins.value)
    } else if (role === ROLE_OPERATOR) {
      assert(this.totalOperators.value < this.maxOperators.value)
    }
    
    // Check if user already has a role
    const roleKey = concat(user, Bytes('_role'))
    const permissionsKey = concat(user, Bytes('_permissions'))
    const assignedByKey = concat(user, Bytes('_assignedBy'))
    const assignedAtKey = concat(user, Bytes('_assignedAt'))
    const expiresAtKey = concat(user, Bytes('_expiresAt'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const revokedAtKey = concat(user, Bytes('_revokedAt'))
    const revokedByKey = concat(user, Bytes('_revokedBy'))
    
    let hadRole = false
    let prevRole: uint64 = ROLE_NONE
    if (Box<uint64>({ key: roleKey }).exists) {
      hadRole = true
      prevRole = Box<uint64>({ key: roleKey }).value
      
      // Update role counters
      if (prevRole === ROLE_ADMIN && role !== ROLE_ADMIN) {
        this.totalAdmins.value = this.totalAdmins.value - 1
      } else if (prevRole === ROLE_OPERATOR && role !== ROLE_OPERATOR) {
        this.totalOperators.value = this.totalOperators.value - 1
      } else if (prevRole === ROLE_USER && role !== ROLE_USER) {
        this.totalUsers.value = this.totalUsers.value - 1
      }
    }
    
    // Store new role data as AVM primitives
    Box<uint64>({ key: roleKey }).value = role
    Box<uint64>({ key: permissionsKey }).value = permissions
    Box<bytes>({ key: assignedByKey }).value = Txn.sender.bytes
    Box<uint64>({ key: assignedAtKey }).value = Global.latestTimestamp
    Box<uint64>({ key: expiresAtKey }).value = expiresAt
    Box<uint64>({ key: revokedKey }).value = 0 // false
    Box<uint64>({ key: revokedAtKey }).value = 0
    Box<bytes>({ key: revokedByKey }).value = Global.zeroAddress.bytes
    
    // Update role counters
    if (role === ROLE_ADMIN) {
      this.totalAdmins.value = this.totalAdmins.value + 1
    } else if (role === ROLE_OPERATOR) {
      this.totalOperators.value = this.totalOperators.value + 1
    } else if (role === ROLE_USER) {
      this.totalUsers.value = this.totalUsers.value + 1
    }
    
    this.logAccess('ROLE_ASSIGNED', user, role, Txn.sender.bytes)
  }

  @abimethod()
  revokeRole(user: bytes, reason: string): void {
    assert(this.hasPermission(Txn.sender.bytes, PERMISSION_MANAGE))
    assert(user !== this.superAdmin.value) // Cannot revoke super admin
    
    const roleKey = concat(user, Bytes('_role'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const revokedAtKey = concat(user, Bytes('_revokedAt'))
    const revokedByKey = concat(user, Bytes('_revokedBy'))
    
    assert(Box<uint64>({ key: roleKey }).exists)
    
    const role = Box<uint64>({ key: roleKey }).value
    const revoked = Box<uint64>({ key: revokedKey }).value
    assert(revoked === 0)
    
    // Update role data
    Box<uint64>({ key: revokedKey }).value = 1
    Box<uint64>({ key: revokedAtKey }).value = Global.latestTimestamp
    Box<bytes>({ key: revokedByKey }).value = Txn.sender.bytes
    
    // Update counters
    if (role === ROLE_ADMIN) {
      this.totalAdmins.value = this.totalAdmins.value - 1
    } else if (role === ROLE_OPERATOR) {
      this.totalOperators.value = this.totalOperators.value - 1
    } else if (role === ROLE_USER) {
      this.totalUsers.value = this.totalUsers.value - 1
    }
    
    this.logAccess('ROLE_REVOKED', user, role, Txn.sender.bytes)
  }

  @abimethod()
  requestPermission(
    targetRole: uint64,
    requestedPermissions: uint64,
    reason: string
  ): uint64 {
    const requestId: uint64 = this.permissionRequestCount.value + 1 as uint64
    this.permissionRequestCount.value = requestId
    // Store each PermissionRequest field in a separate box
    Box<bytes>({ key: concat(Bytes(requestId), Bytes('_requester')) }).value = Txn.sender.bytes
    Box<uint64>({ key: concat(Bytes(requestId), Bytes('_targetRole')) }).value = targetRole
    Box<uint64>({ key: concat(Bytes(requestId), Bytes('_requestedPermissions')) }).value = requestedPermissions
    Box<bytes>({ key: concat(Bytes(requestId), Bytes('_reason')) }).value = Bytes(reason)
    Box<uint64>({ key: concat(Bytes(requestId), Bytes('_requestedAt')) }).value = Global.latestTimestamp
    Box<uint64>({ key: concat(Bytes(requestId), Bytes('_approvals')) }).value = 0
    Box<bytes>({ key: concat(Bytes(requestId), Bytes('_approvers')) }).value = Bytes('')
    Box<uint64>({ key: concat(Bytes(requestId), Bytes('_status')) }).value = 0 // pending
    this.logAccess('PERMISSION_REQUESTED', Txn.sender.bytes, targetRole, Txn.sender.bytes)
    return requestId
  }

  @abimethod()
  approvePermissionRequest(requestId: uint64): void {
    assert(this.hasPermission(Txn.sender.bytes, PERMISSION_MANAGE))
    const statusKey = concat(Bytes(requestId), Bytes('_status'))
    const approvalsKey = concat(Bytes(requestId), Bytes('_approvals'))
    const requesterKey = concat(Bytes(requestId), Bytes('_requester'))
    const targetRoleKey = concat(Bytes(requestId), Bytes('_targetRole'))
    const requestedPermissionsKey = concat(Bytes(requestId), Bytes('_requestedPermissions'))
    assert(Box<uint64>({ key: statusKey }).exists)
    const status = Box<uint64>({ key: statusKey }).value
    assert(status === 0)
    // Increment approvals
    let approvals = Box<uint64>({ key: approvalsKey }).value
    approvals = approvals + 1 as uint64
    Box<uint64>({ key: approvalsKey }).value = approvals
    // Check if sufficient approvals
    if (approvals >= this.multiSigRequiredForAdmin.value) {
      Box<uint64>({ key: statusKey }).value = 1 // approved
      // Assign the requested role
      const requester = Box<bytes>({ key: requesterKey }).value
      const targetRole = Box<uint64>({ key: targetRoleKey }).value
      const requestedPermissions = Box<uint64>({ key: requestedPermissionsKey }).value
      this.assignRole(requester, targetRole, requestedPermissions, 0)
    }
    this.logAccess('PERMISSION_APPROVED', Box<bytes>({ key: requesterKey }).value, Box<uint64>({ key: targetRoleKey }).value, Txn.sender.bytes)
  }

  @abimethod()
  rejectPermissionRequest(requestId: uint64, reason: string): void {
    assert(this.hasPermission(Txn.sender.bytes, PERMISSION_MANAGE))
    const statusKey = concat(Bytes(requestId), Bytes('_status'))
    assert(Box<uint64>({ key: statusKey }).exists)
    const status = Box<uint64>({ key: statusKey }).value
    assert(status === 0)
    Box<uint64>({ key: statusKey }).value = 2 // rejected
    const requesterKey = concat(Bytes(requestId), Bytes('_requester'))
    const targetRoleKey = concat(Bytes(requestId), Bytes('_targetRole'))
    this.logAccess('PERMISSION_REJECTED', Box<bytes>({ key: requesterKey }).value, Box<uint64>({ key: targetRoleKey }).value, Txn.sender.bytes)
  }

  @abimethod()
  enableEmergencyOverride(): void {
    assert(Txn.sender.bytes === this.superAdmin.value)
    
    this.emergencyOverride.value = true
    
    this.logAccess('EMERGENCY_OVERRIDE_ENABLED', Txn.sender.bytes, ROLE_SUPERADMIN, Txn.sender.bytes)
  }

  @abimethod()
  disableEmergencyOverride(): void {
    assert(Txn.sender.bytes === this.superAdmin.value)
    
    this.emergencyOverride.value = false
    
    this.logAccess('EMERGENCY_OVERRIDE_DISABLED', Txn.sender.bytes, ROLE_SUPERADMIN, Txn.sender.bytes)
  }

  @abimethod()
  transferSuperAdmin(newSuperAdmin: bytes): void {
    assert(Txn.sender.bytes === this.superAdmin.value)
    assert(newSuperAdmin !== Global.zeroAddress.bytes)
    
    const oldSuperAdmin = this.superAdmin.value
    this.superAdmin.value = newSuperAdmin
    
    // Transfer super admin role
    this.assignRole(newSuperAdmin, ROLE_SUPERADMIN, (1 << PERMISSION_READ) | (1 << PERMISSION_WRITE) | (1 << PERMISSION_EXECUTE) | (1 << PERMISSION_MANAGE) | (1 << PERMISSION_EMERGENCY), 0)
    
    // Revoke old super admin role
    this.revokeRole(oldSuperAdmin, 'Super admin transferred')
    
    this.logAccess('SUPER_ADMIN_TRANSFERRED', newSuperAdmin, ROLE_SUPERADMIN, oldSuperAdmin)
  }

  @abimethod()
  updateAccessControlSettings(
    newMaxAdmins: uint64,
    newMaxOperators: uint64,
    newMultiSigRequired: uint64,
    newDefaultPermissions: uint64
  ): void {
    assert(Txn.sender.bytes === this.superAdmin.value)
    
    this.maxAdmins.value = newMaxAdmins
    this.maxOperators.value = newMaxOperators
    this.multiSigRequiredForAdmin.value = newMultiSigRequired
    this.defaultUserPermissions.value = newDefaultPermissions
  }

  @abimethod()
  performSecurityAudit(): void {
    assert(this.hasPermission(Txn.sender.bytes, PERMISSION_MANAGE))
    
    // Perform various security checks
    this.checkExpiredRoles()
    this.cleanupOldRequests()
    
    this.lastSecurityAudit.value = Global.latestTimestamp
    
    this.logAccess('SECURITY_AUDIT_PERFORMED', Txn.sender.bytes, ROLE_NONE, Txn.sender.bytes)
  }

  checkExpiredRoles(): void {
    // Implementation would iterate through roles and revoke expired ones
    // This is simplified for demonstration
  }

  cleanupOldRequests(): void {
    // Implementation would clean up old permission requests
    // This is simplified for demonstration
  }

  logAccess(action: string, targetUser: bytes, role: uint64, actor: bytes): void {
    const logId: uint64 = this.accessLogCount.value + 1 as uint64
    this.accessLogCount.value = logId
    log(action, targetUser, role, actor, Global.latestTimestamp)
  }

  // Authorization functions
  hasRole(user: bytes, role: uint64): boolean {
    const roleKey = concat(user, Bytes('_role'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const expiresAtKey = concat(user, Bytes('_expiresAt'))
    if (!Box<uint64>({ key: roleKey }).exists) {
      return false
    }
    const userRole = Box<uint64>({ key: roleKey }).value
    const revoked = Box<uint64>({ key: revokedKey }).value
    const expiresAt = Box<uint64>({ key: expiresAtKey }).value
    if (revoked === 1) {
      return false
    }
    if (expiresAt > 0 && Global.latestTimestamp > expiresAt) {
      return false
    }
    return userRole === role || userRole === ROLE_SUPERADMIN
  }

  hasPermission(user: bytes, permission: uint64): boolean {
    if (this.emergencyOverride.value && user === this.superAdmin.value) {
      return true
    }
    const roleKey = concat(user, Bytes('_role'))
    const permissionsKey = concat(user, Bytes('_permissions'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const expiresAtKey = concat(user, Bytes('_expiresAt'))
    if (!Box<uint64>({ key: roleKey }).exists) {
      return false
    }
    const revoked = Box<uint64>({ key: revokedKey }).value
    const expiresAt = Box<uint64>({ key: expiresAtKey }).value
    if (revoked === 1) {
      return false
    }
    if (expiresAt > 0 && Global.latestTimestamp > expiresAt) {
      return false
    }
    const permissions = Box<uint64>({ key: permissionsKey }).value
    // Compute permission bit as 2^permission (AVM-compatible)
    let permissionBit: uint64 = 1
    let i: uint64 = 0
    while (i < permission) {
      permissionBit = permissionBit * 2 as uint64
      i = i + 1 as uint64
    }
    return (permissions / permissionBit) % 2 === 1
  }

  canExecuteFunction(user: bytes, functionName: string): boolean {
    // Define function permission requirements
    if (functionName === 'stake' || functionName === 'withdraw' || functionName === 'claimRewards') {
      return this.hasPermission(user, PERMISSION_EXECUTE)
    }
    
    if (functionName === 'updateRewardRate' || functionName === 'pausePool') {
      return this.hasPermission(user, PERMISSION_MANAGE)
    }
    
    if (functionName === 'emergencyWithdraw' || functionName === 'emergencyPause') {
      return this.hasPermission(user, PERMISSION_EMERGENCY)
    }
    
    // Default: require read permission for view functions
    return this.hasPermission(user, PERMISSION_READ)
  }

  @abimethod()
  isSessionValid(user: bytes, sessionStartTime: uint64): boolean {
    const roleKey = concat(user, Bytes('_role'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const expiresAtKey = concat(user, Bytes('_expiresAt'))
    if (!Box<uint64>({ key: roleKey }).exists) {
      return false
    }
    const userRole = Box<uint64>({ key: roleKey }).value
    const revoked = Box<uint64>({ key: revokedKey }).value
    const expiresAt = Box<uint64>({ key: expiresAtKey }).value
    if (revoked === 1) {
      return false
    }
    if (expiresAt > 0 && Global.latestTimestamp > expiresAt) {
      return false
    }
    let maxSessionDuration: uint64 = 3600
    if (userRole === ROLE_ADMIN || userRole === ROLE_SUPERADMIN) {
      maxSessionDuration = this.adminSessionDuration.value
    } else if (userRole === ROLE_OPERATOR) {
      maxSessionDuration = this.operatorSessionDuration.value
    }
    return (Global.latestTimestamp - sessionStartTime) <= maxSessionDuration
  }

  // View functions
  @abimethod()
  getUserRole(user: bytes): { role: uint64, permissions: uint64, assignedBy: bytes, assignedAt: uint64, expiresAt: uint64, revoked: uint64, revokedAt: uint64, revokedBy: bytes } {
    const roleKey = concat(user, Bytes('_role'))
    const permissionsKey = concat(user, Bytes('_permissions'))
    const assignedByKey = concat(user, Bytes('_assignedBy'))
    const assignedAtKey = concat(user, Bytes('_assignedAt'))
    const expiresAtKey = concat(user, Bytes('_expiresAt'))
    const revokedKey = concat(user, Bytes('_revoked'))
    const revokedAtKey = concat(user, Bytes('_revokedAt'))
    const revokedByKey = concat(user, Bytes('_revokedBy'))
    if (Box<uint64>({ key: roleKey }).exists) {
      return {
        role: Box<uint64>({ key: roleKey }).value,
        permissions: Box<uint64>({ key: permissionsKey }).value,
        assignedBy: Box<bytes>({ key: assignedByKey }).value,
        assignedAt: Box<uint64>({ key: assignedAtKey }).value,
        expiresAt: Box<uint64>({ key: expiresAtKey }).value,
        revoked: Box<uint64>({ key: revokedKey }).value,
        revokedAt: Box<uint64>({ key: revokedAtKey }).value,
        revokedBy: Box<bytes>({ key: revokedByKey }).value
      }
    }
    // Return default role
    return {
      role: ROLE_NONE,
      permissions: this.defaultUserPermissions.value,
      assignedBy: Global.zeroAddress.bytes,
      assignedAt: 0,
      expiresAt: 0,
      revoked: 0,
      revokedAt: 0,
      revokedBy: Global.zeroAddress.bytes
    }
  }

  @abimethod()
  getPermissionRequest(requestId: uint64): { requester: bytes, targetRole: uint64, requestedPermissions: uint64, reason: bytes, requestedAt: uint64, approvals: uint64, approvers: bytes, status: uint64 } {
    const requesterKey = concat(Bytes(requestId), Bytes('_requester'))
    const targetRoleKey = concat(Bytes(requestId), Bytes('_targetRole'))
    const requestedPermissionsKey = concat(Bytes(requestId), Bytes('_requestedPermissions'))
    const reasonKey = concat(Bytes(requestId), Bytes('_reason'))
    const requestedAtKey = concat(Bytes(requestId), Bytes('_requestedAt'))
    const approvalsKey = concat(Bytes(requestId), Bytes('_approvals'))
    const approversKey = concat(Bytes(requestId), Bytes('_approvers'))
    const statusKey = concat(Bytes(requestId), Bytes('_status'))
    assert(Box<uint64>({ key: statusKey }).exists)
    return {
      requester: Box<bytes>({ key: requesterKey }).value,
      targetRole: Box<uint64>({ key: targetRoleKey }).value,
      requestedPermissions: Box<uint64>({ key: requestedPermissionsKey }).value,
      reason: Box<bytes>({ key: reasonKey }).value,
      requestedAt: Box<uint64>({ key: requestedAtKey }).value,
      approvals: Box<uint64>({ key: approvalsKey }).value,
      approvers: Box<bytes>({ key: approversKey }).value,
      status: Box<uint64>({ key: statusKey }).value
    }
  }

  @abimethod()
  getAccessControlStats(): { totalUsers: uint64, totalAdmins: uint64, totalOperators: uint64, pendingRequests: uint64, emergencyOverride: boolean, lastAudit: uint64 } {
    let pendingRequests: uint64 = 0
    let i: uint64 = 1
    while (i <= this.permissionRequestCount.value) {
      const statusKey = concat(Bytes(i), Bytes('_status'))
      if (Box<uint64>({ key: statusKey }).exists && Box<uint64>({ key: statusKey }).value === 0) {
        pendingRequests = pendingRequests + 1 as uint64
      }
      i = i + 1 as uint64
    }
    return {
      totalUsers: this.totalUsers.value,
      totalAdmins: this.totalAdmins.value,
      totalOperators: this.totalOperators.value,
      pendingRequests: pendingRequests,
      emergencyOverride: this.emergencyOverride.value,
      lastAudit: this.lastSecurityAudit.value
    }
  }

  getAllUserRoles(): bytes[] {
    // Implementation would return all users with roles
    // This is simplified for demonstration
    let users: bytes[] = []
    return users
  }

  @abimethod()
  getPermissionRequestsByUser(user: bytes): { requester: bytes, targetRole: uint64, requestedPermissions: uint64, reason: bytes, requestedAt: uint64, approvals: uint64, approvers: bytes, status: uint64 }[] {
    let requests: { requester: bytes, targetRole: uint64, requestedPermissions: uint64, reason: bytes, requestedAt: uint64, approvals: uint64, approvers: bytes, status: uint64 }[] = []
    let i: uint64 = 1
    while (i <= this.permissionRequestCount.value) {
      const requesterKey = concat(Bytes(i), Bytes('_requester'))
      const statusKey = concat(Bytes(i), Bytes('_status'))
      if (Box<bytes>({ key: requesterKey }).exists && Box<bytes>({ key: requesterKey }).value === user) {
        // AVM-compatible array push (simulate push by creating a new array with the new element appended)
        requests = requests.concat([
          {
            requester: Box<bytes>({ key: requesterKey }).value,
            targetRole: Box<uint64>({ key: concat(Bytes(i), Bytes('_targetRole')) }).value,
            requestedPermissions: Box<uint64>({ key: concat(Bytes(i), Bytes('_requestedPermissions')) }).value,
            reason: Box<bytes>({ key: concat(Bytes(i), Bytes('_reason')) }).value,
            requestedAt: Box<uint64>({ key: concat(Bytes(i), Bytes('_requestedAt')) }).value,
            approvals: Box<uint64>({ key: concat(Bytes(i), Bytes('_approvals')) }).value,
            approvers: Box<bytes>({ key: concat(Bytes(i), Bytes('_approvers')) }).value,
            status: Box<uint64>({ key: statusKey }).value
          }
        ])
      }
      i = i + 1 as uint64
    }
    return requests
  }
}