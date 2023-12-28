import nock from 'nock'
import myProbotApp from '../src'
import { Probot, ProbotOctokit } from 'probot'
import payload from './fixtures/issue_comment.created.json'
import * as labelHandler from '../src/handlers/label'

import * as fs from 'fs'
import * as path from 'path'

const privateKey = fs.readFileSync(
  path.join(__dirname, 'fixtures/mock-cert.pem'),
  'utf-8'
)

describe('My Probot app', () => {
  let probot: any

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
  })

  test('receives release comment', async () => {
    const spy = jest.spyOn(labelHandler, 'label')
    // mock the function so it doesn't run
    spy.mockResolvedValue(Promise.resolve())

    await probot.receive({ name: 'issue_comment', payload })
    expect(spy).toHaveBeenCalled()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
