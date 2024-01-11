// import yaml from 'js-yaml'
import { type ProbotOctokit } from 'probot'
import type { RepositoryPermissions, RepositoryRoles } from '../types/permissions'

/**
 * Read repository settings configuration
 *
 * @param { Context } context - the context of the event
 * @returns { Settings } - repository settings configuration
 */

module.exports = class Permissions {
  config: RepositoryPermissions
  owner: string
  repo: string
  github: InstanceType<typeof ProbotOctokit>

  constructor (owner: string, repo: string, config: RepositoryPermissions, github: InstanceType<typeof ProbotOctokit>) {
    this.owner = owner
    this.repo = repo
    this.config = config
    this.github = github
  }

  async sync (): Promise<void> {
    /* get list of defined topic (keys) from configuration */
    const topics = Object.keys(this.config)

    /* get repository topics */
    const { data: currentRepoTopics } = await this.github.repos.getAllTopics({
      owner: this.owner,
      repo: this.repo
    })

    /* check topics against configuration (intersection) */
    const topicsToKeep = topics.filter(topic => currentRepoTopics.names.includes(topic))
    // don't assign default permissions
    // if (currentRepoTopics.names.length === 0 || topicsToKeep.length === 0) {
    //  /* use default permissions */
    //  topicsToKeep = ['default']
    // }

    /* clear all current repository team associations */
    const { data: currentAssignedTeams } = await this.github.repos.listTeams({
      owner: this.owner,
      repo: this.repo
    })

    for (const team of currentAssignedTeams) {
      await this.github.teams.removeRepoInOrg({
        org: this.owner,
        team_slug: team.slug,
        owner: this.owner,
        repo: this.repo
      })
    }

    for (const topic of topicsToKeep) {
      for (const [permission, teamArray] of Object.entries(this.config[topic])) {
        for (const team of teamArray) {
          try {
            await this.github.teams.addOrUpdateRepoPermissionsInOrg({
              org: this.owner,
              team_slug: team,
              owner: this.owner,
              repo: this.repo,
              permission: permission as RepositoryRoles
            })
          } catch (error) {
            console.log(`Failed to add ${team} to ${this.owner}/${this.repo} with ${permission} permissions`)
          }
        }
      }
    }
  }
}
