export type RepositoryRoles = 'push' | 'pull' | 'admin' | 'triage' | 'maintain'

export interface RepositoryAction {
  push?: string[]
  pull?: string[]
  admin?: string[]
  triage?: string[]
}

export type RepositoryPermissions = Record<string, RepositoryAction>

export interface PermissionsConfig {
  permissions: RepositoryPermissions
}
