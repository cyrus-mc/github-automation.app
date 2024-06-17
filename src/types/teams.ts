type TeamAssignment = Record<string, string[]>

export interface TeamsSettings {
  idp: string[]
  github: TeamAssignment
}

export interface TeamsConfig {
  teams: TeamsSettings
}
