export type RepositoryRoles = 'push' | 'pull' | 'admin' | 'triage' | 'maintain'

export interface RepositoryAction {
  push?: string[]
  pull?: string[]
  admin?: string[]
  triage?: string[]
}

export type RepositoryPermissions = Record<string, RepositoryAction>

// const hlPermissions: RepositoryPermissions = {
//  topic1: {
//    push: ['team1'],
//    pull: ['team2']
//  },
//  topic2: {
//    push: ['team1']
//  }
// }
