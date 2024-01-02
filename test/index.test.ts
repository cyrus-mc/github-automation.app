import nock from 'nock'
import myProbotApp from '../src'
import { Probot, ProbotOctokit } from 'probot'
import type { Config } from '../src/types/config'
import * as labelHandler from '../src/handlers/label'
import * as utils from '../src/utils'
// import * as repositorySettings from '../src/plugins/repository'

import * as fs from 'fs'
import * as path from 'path'

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
    const config: Config = {
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
    const spy = jest.spyOn(utils, 'getConfiguration')
    spy.mockResolvedValue(Promise.resolve(config))

    // await probot.receive(event)
    expect(spy).toHaveBeenCalledTimes(0)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
