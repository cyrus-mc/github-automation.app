import { ProbotOctokit } from 'probot'
import { mockGitHubApiRequests } from '../utils/helpers'
import { Settings } from '../../src/settings'
import type { RepositoryConfig } from '../../src/types/repository'

describe('repository plugin', () => {
  const octokit = new ProbotOctokit()
  const config: RepositoryConfig = {
    repository: {
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true,
      allow_auto_merge: false,
      delete_branch_on_merge: true,
      allow_update_branch: false,
      squash_merge_commit_title: 'PR_TITLE',
      squash_merge_commit_message: 'BLANK',
      merge_commit_title: 'PR_TITLE',
      merge_commit_message: 'PR_TITLE'
    }
  }

  test('set repository settings', async () => {
    const mock = mockGitHubApiRequests()
      .repoUpdate(config.repository).toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test.skip('do not set squash_merge_commit_title or squash_merge_commit_message if allow_squash_merge is false', async () => {
    const mock = mockGitHubApiRequests()
      .repoUpdate(Object.assign({}, config, { allow_squash_merge: false })).toNock()

    await Settings.sync('_orgname', '_reponame', Object.assign({}, config, { repository: Object.assign({}, config.repository, { allow_squash_merge: false }) }), octokit)
    expect(mock.pendingMocks()).toEqual([])
  }, 100000)
})
