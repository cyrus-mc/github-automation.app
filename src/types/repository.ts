export interface RepositorySettings {
  has_issues?: boolean
  has_projects?: boolean
  has_wiki?: boolean
  allow_squash_merge?: boolean
  allow_merge_commit?: boolean
  allow_rebase_merge?: boolean
  allow_auto_merge?: boolean
  delete_branch_on_merge?: boolean
  allow_update_branch?: boolean
  squash_merge_commit_title?: string
  squash_merge_commit_message?: string
  merge_commit_title?: string
  merge_commit_message?: string
}

export type Branches = BranchSettings[]

export interface BranchSettings {
  name: string
  protection: BranchProtectionRule
}

interface BranchProtectionRule {
  required_pull_request_reviews: any
}

export interface RepositoryConfig {
  repository?: RepositorySettings
  branches?: Branches
}
