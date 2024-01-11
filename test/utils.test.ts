import type { RepositoryConfig } from '../src/types/repository'
import type { Context } from 'probot'
import { ProbotOctokit } from 'probot'
import { mockGitHubApiRequests } from './utils/helpers'
import { getRepoContent } from '../src/utils'

describe('utils', () => {
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

  let context: Context

  beforeEach(async () => {
    const octokit = new ProbotOctokit()

    context = {
      id: '1234',
      name: 'repository.created',
      payload: {} as any,
      octokit,
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      } as any,
      config: jest.fn().mockResolvedValue(undefined),
      isBot: false,
      issue: jest.fn(),
      pullRequest: jest.fn(),
      repo: jest.fn()
    }
  })

  test('read configuraiton file', async () => {
    /* mock the call to getRepoContent */
    const mock = mockGitHubApiRequests()
      .getRepoContent('_reponame', 'settings.repo.yaml', 'main', JSON.stringify(config)).toNock()

    const expectedConfig = await getRepoContent('_orgname', '_reponame', 'settings.repo.yaml', 'main', context.octokit)

    expect(expectedConfig).toEqual(config)
    /* ensure there are no pending mock requests */
    expect(mock.pendingMocks()).toEqual([])
  }, 100000)
})
