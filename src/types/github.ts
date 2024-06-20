/* https://docs.github.com/en/rest/teams/teams?apiVersion=2022-11-28#list-teams */
export interface ListTeamResponse {
  id: number
  name: string
  slug: string
}

/* https://docs.github.com/en/rest/teams/members?apiVersion=2022-11-28#list-team-members */
export interface ListTeamMembersResponse {
  login: string
  id: number
}
