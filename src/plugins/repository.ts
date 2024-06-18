// import yaml from 'js-yaml'
import type { ProbotOctokit } from 'probot'
import type { RepositorySettings } from '../types/repository'
import type { OctokitResponse } from '@octokit/types'

/**
 * Read repository settings configuration
 *
 * @param { Context } context - the context of the event
 * @returns { Settings } - repository settings configuration
 */

module.exports = class Repository {
  config: RepositorySettings
  owner: string
  repo: string
  github: InstanceType<typeof ProbotOctokit>

  constructor (owner: string, repo: string, config: RepositorySettings, github: InstanceType<typeof ProbotOctokit>) {
    this.owner = owner
    this.repo = repo
    this.config = config
    this.github = github
  }

  async sync (): Promise<OctokitResponse<any, number>> {
    /* if allow_squash_merge is false, then don't set squash_merge_commit_title or squash_merge_commit_message */
    if (this.config.allow_squash_merge === false) {
      delete this.config.squash_merge_commit_message
      delete this.config.squash_merge_commit_title
    }

    if (this.config.allow_merge_commit === false) {
      delete this.config.merge_commit_message
      delete this.config.merge_commit_title
    }

    return await this.github.repos.update({
      owner: this.owner,
      repo: this.repo,
      has_issues: this.config?.has_issues,
      has_projects: this.config?.has_projects,
      has_wiki: this.config?.has_wiki,
      allow_squash_merge: this.config?.allow_squash_merge,
      allow_merge_commit: this.config?.allow_merge_commit,
      allow_rebase_merge: this.config?.allow_rebase_merge,
      delete_branch_on_merge: this.config?.delete_branch_on_merge,
      allow_auto_merge: this.config?.allow_auto_merge,
      allow_update_branch: this.config?.allow_update_branch,
      squash_merge_commit_title: this.config?.squash_merge_commit_title as 'PR_TITLE' | 'COMMIT_OR_PR_TITLE' | undefined,
      squash_merge_commit_message: this.config?.squash_merge_commit_message as 'PR_BODY' | 'COMMIT_MESSAGES' | 'BLANK' | undefined,
      merge_commit_title: this.config?.merge_commit_title as 'PR_TITLE' | 'MERGE_MESSAGE' | undefined,
      merge_commit_message: this.config?.merge_commit_message as 'PR_TITLE' | 'PR_BODY' | 'BLANK' | undefined
    })
  }
}
