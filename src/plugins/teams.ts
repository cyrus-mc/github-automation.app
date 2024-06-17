// import yaml from 'js-yaml'
import { type ProbotOctokit } from 'probot'
import type { TeamsSettings } from '../types/teams'

/**
 * Create and manage GitHub Teams
 *
 * @param { Context } context - the context of the event
 * @returns { Settings } - repository settings configuration
 */

// export class Teams {
module.exports = class Teams {
  config: TeamsSettings
  owner: string
  repo: string
  github: InstanceType<typeof ProbotOctokit>

  constructor (owner: string, repo: string, config: TeamsSettings, github: InstanceType<typeof ProbotOctokit>) {
    this.owner = owner
    this.repo = repo
    this.config = config
    this.github = github
  }

  // Sets team associations for `this.repo` based on topic=>team mappings present in `this.config`
  async sync (): Promise<void> {
    /* get list of defined teams (keys) from configuration */
    const teams = Object.keys(this.config.github).map(function (team) { return team.replace(/ /g, '-').toLocaleLowerCase() })

    /* get all organization teams */
    const { data: response } = await this.github.teams.list({
      org: this.owner
    })
    /* map teams to a list of team slugs */
    const organizationTeams = response.map(function (team) { return team.slug })

    /* create required teams */
    const teamsToCreate = teams.filter(team => !organizationTeams.includes(team))
    for (const team of teamsToCreate) {
      /* what do we do with failures? */
      await this.github.teams.create({
        org: this.owner,
        name: team
      })
    }

    /* delete required teams (ignoring IDP teams) */
    const teamsToDelete = organizationTeams.filter(team => !teams.includes(team) && !this.config.idp.includes(team))
    for (const team of teamsToDelete) {
      /* what do we do with failures? */
      await this.github.teams.deleteInOrg({
        org: this.owner,
        team_slug: team
      })
    }

    /* now that we have the teams, we can start adding and removing members */
    /* for each team defined, get list of members */
    for (const team of teams) {
      const { data: response } = await this.github.teams.listMembersInOrg({
        org: this.owner,
        team_slug: team
      })
      const teamMembers = response.map(function (member) { return member.login })

      /* team members - defined in configuration = members to remove */
      const membersToRemove = teamMembers.filter(member => !this.config.github[team].includes(member))
      for (const member of membersToRemove) {
        /* what do we do with failures? */
        await this.github.teams.removeMembershipForUserInOrg({
          org: this.owner,
          team_slug: team,
          username: member
        })
      }

      /* defined in configuration - team members = members to add */
      const membersToAdd = this.config.github[team].filter(member => !teamMembers.includes(member))
      for (const member of membersToAdd) {
        /* what do we do with failures? */
        await this.github.teams.addOrUpdateMembershipForUserInOrg({
          org: this.owner,
          team_slug: team,
          username: member,
          role: 'member'
        })
      }
    }
  }
}