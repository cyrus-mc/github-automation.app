import { ProbotOctokit } from 'probot'
import { mockGitHubApiRequests } from '../utils/helpers'
import { Settings } from '../../src/settings'

describe('repository plugin', () => {
  const octokit = new ProbotOctokit()

  const config: any = {
    permissions: {
      topic1: {
        push:
          ['platform-engineering']
      }
    }
  }

  test('add or update team repository permissions', async () => {
    const mock = mockGitHubApiRequests()
      .reposGetAllTopics()
      .reposListTeams()
      .teamsRemoveRepoInOrg('platform-engineering')
      .teamsAddOrUpdateRepoPermissionsInOrg('platform-engineering', 'push').toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  }, 100000)
})
