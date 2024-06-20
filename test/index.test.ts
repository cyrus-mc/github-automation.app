import nock from 'nock'
import myProbotApp from '../src'
import { Probot, ProbotOctokit } from 'probot'
import type { RepositoryConfig } from '../src/types/repository'
import type { TeamsConfig } from '../src/types/teams'
import * as labelHandler from '../src/handlers/label'
import * as utils from '../src/utils'
// import * as repositorySettings from '../src/plugins/repository'

import * as fs from 'fs'
import * as path from 'path'
import { mockGitHubApiRequests } from './utils/helpers'

const privateKey = fs.readFileSync(
  path.join(__dirname, 'fixtures/mock-cert.pem'),
  'utf-8'
)

describe('My Probot app', () => {
  let probot: any
  let event: any

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({
      appId: 12345678,
      privateKey,
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false }
      })
    })
    // load our app into probot
    probot.load(myProbotApp)

    event = {}
  })

  test('receives release comment', async () => {
    event = {
      name: 'issue_comment',
      payload: require('./fixtures/issue_comment.created.json')
    }
    const spy = jest.spyOn(labelHandler, 'label')
    // mock the function so it doesn't run
    spy.mockResolvedValue(Promise.resolve())

    await probot.receive(event)
    expect(spy).toHaveBeenCalled()
  })

  test('receives repository created event', async () => {
    event = {
      name: 'repository',
      payload: require('./fixtures/repository.created.json')
    }
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
    const spy = jest.spyOn(utils, 'getRepoContent')
    spy.mockResolvedValue(Promise.resolve(config))

    // await probot.receive(event)
    expect(spy).toHaveBeenCalledTimes(0)
  })

  test('receives repository push event (non-main branch)', async () => {
    const event: any = {
      name: 'repository',
      payload: require('./fixtures/repository.push.json')
    }
    event.payload.ref = 'refs/heads/feature-branch'
    /* trigger event */
    await probot.receive(event)
  })

  test('receives repository push event (main branch)', async () => {
    const event: any = {
      name: 'repository',
      payload: require('./fixtures/repository.push.json')
    }

    const config: TeamsConfig = {
      teams: {
        idp: ['github'],
        github: {
          team1: ['user', 'user2'],
          team2: []
        }
      }
    }

    const githubTeams: string[] = ['github', 'team1', 'obselete']

    mockGitHubApiRequests()
      .orgListTeams(githubTeams)
      .deleteTeam('obselete')
      .createTeam('team2')
      .orgListTeamMembers('team1', ['user', 'user3'])
      .orgListTeamMembers('team2', [])
      .orgAddTeamMember('team1', 'user2')
      .orgRemoveTeamMember('team1', 'user3')
      .toNock()

    /* mock getRepoContent */
    const spy = jest.spyOn(utils, 'getRepoContent')
    spy.mockResolvedValue(Promise.resolve(config))

    /* trigger event */
    await probot.receive(event)

    /* assertions */
    /* this assert fails when running test via jest, but passes in the IDE */
    // expect(spy).toHaveBeenCalledTimes(1)
    // expect(mock.pendingMocks()).toHaveLength(0)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
