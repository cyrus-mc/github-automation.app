import { ProbotOctokit } from 'probot'
import { Settings } from '../../src/settings'
import type { TeamsConfig } from '../../src/types/teams'
import { mockGitHubApiRequests } from '../utils/helpers'

describe('teams plugin', () => {
  const octokit = new ProbotOctokit()

  test('delete team', async () => {
    const githubTeams: string[] = ['team1', 'remove']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          team1: []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .deleteTeam('remove')
      .orgListTeamMembers('team1', [])
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test('add team', async () => {
    const githubTeams: string[] = ['team1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          team1: [],
          add: []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .createTeam('add')
      .orgListTeamMembers('team1', [])
      .orgListTeamMembers('add', [])
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test('add members to team', async () => {
    const githubTeams: string[] = ['team1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          team1: ['user1']
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .orgListTeamMembers('team1', [])
      .orgAddTeamMember('team1', 'user1')
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })

  test('remove member from team', async () => {
    const githubTeams: string[] = ['team1']
    const config: TeamsConfig = {
      teams: {
        idp: [],
        github: {
          team1: []
        }
      }
    }

    const mock = mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .orgListTeamMembers('team1', ['user1'])
      .orgRemoveTeamMember('team1', 'user1')
      .toNock()

    await Settings.sync('_orgname', '_reponame', config, octokit)
    expect(mock.pendingMocks()).toEqual([])
  })
})
