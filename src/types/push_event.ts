export interface PushEvent {
  ref: string
  repository: {
    owner: {
      login: string
      name: string
    }
  }
  commits: [
    {
      modified: string[]
    }
  ]
  head_commit: {
    modified: string[]
  }
}
