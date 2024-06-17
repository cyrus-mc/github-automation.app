// import type { Config } from './types/config'
import type { ProbotOctokit } from 'probot'
import type { OctokitResponse } from '@octokit/types'

export class Settings {
  config: any
  repo: string
  owner: string
  github: InstanceType<typeof ProbotOctokit>
  plugins: Record<string, any>

  constructor (owner: string, repo: string, config: any, github: InstanceType<typeof ProbotOctokit>) {
    this.repo = repo
    this.owner = owner
    this.github = github
    this.config = config
    this.plugins = {
      repository: require('./plugins/repository'),
      permissions: require('./plugins/permissions'),
      teams: require('./plugins/teams')
    }
  }

  static async sync (owner: string, repo: string, config: any, github: InstanceType<typeof ProbotOctokit>): Promise<any> {
    await new Settings(owner, repo, config, github).update()
  }

  async update (): Promise<any> {
    const { branches, ...rest } = this.config

    await Promise.all(
      Object.entries(rest).map(async ([section, config]) => {
        return await this.processSection(section, config)
      })
    )
  }

  async processSection (section: string, config: any): Promise<OctokitResponse<any, number>> {
    const debug: Record<string, any> = { repo: this.repo }
    debug[section] = config

    const Plugin = this.plugins[section]
    return new Plugin(this.owner, this.repo, config, this.github).sync()
  }
}
