export type Branches = BranchSettings[]

export interface BranchSettings {
  name: string
  protection: BranchProtectionRule
}

interface BranchProtectionRule {
  required_pull_request_reviews: any
}
