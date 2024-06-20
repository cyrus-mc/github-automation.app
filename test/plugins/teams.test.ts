import { ProbotOctokit } from 'probot'
import { Settings } from '../../src/settings'
import type { TeamsConfig } from '../../src/types/teams'
import { mockGitHubApiRequests } from '../utils/helpers'

describe('teams plugin', () => {
  const octokit = new ProbotOctokit()

  test('delete team', async () => {
    const githubTeams: string[] = ['Team 1', 'remove']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          'Team 1': []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .deleteTeam('remove')
      .orgListTeamMembers('Team 1', [])
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test('add team', async () => {
    const githubTeams: string[] = ['Team 1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          'Team 1': [],
          Add: []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .createTeam('Add')
      .orgListTeamMembers('Team 1', [])
      .orgListTeamMembers('Add', [])
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  }, 70000)

  test('add members to team', async () => {
    const githubTeams: string[] = ['Team 1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          'Team 1': ['user1']
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .orgListTeamMembers('Team 1', [])
      .orgAddTeamMember('Team 1', 'user1')
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test('remove member from team', async () => {
    const githubTeams: string[] = ['Team 1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          'Team 1': []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .orgListTeamMembers('Team 1', ['user1'])
      .orgRemoveTeamMember('Team 1', 'user1')
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })
})
