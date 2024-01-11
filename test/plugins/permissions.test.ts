import { ProbotOctokit } from 'probot'
import { mockGitHubApiRequests } from '../utils/helpers'
import { Settings } from '../../src/settings'

describe('repository plugin', () => {
  const octokit = new ProbotOctokit()

  const config: any = {
    permissions: {
      platform: {
        push:
          ['platform-engineering']
      }
    }
  }

  test.skip('set repository settings', async () => {
    const mock = mockGitHubApiRequests()
      .repoUpdate(config.repository).toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test.skip('don not set squash_merge_commit_title or squash_merge_commit_message if allow_squash_merge is false', async () => {
    const mock = mockGitHubApiRequests()
      .repoUpdate(Object.assign({}, config, { allow_squash_merge: false })).toNock()

    await Settings.sync('_orgname', '_reponame', Object.assign({}, config, { repository: Object.assign({}, config.repository, { allow_squash_merge: false }) }), octokit)
    expect(mock.pendingMocks()).toEqual([])
  }, 100000)
})
