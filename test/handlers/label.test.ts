import type { Context } from 'probot'
import { ProbotOctokit } from 'probot'
import { label } from '../../src/handlers/label'
import issue from '../fixtures/issue_comment.created.json'

describe('label handler', () => {
  let context: Context<'issue_comment.created'>
  let payload: any
  let owner: string
  let repo: string
  let issueNumber: number

  beforeEach(async () => {
    const octokit = new ProbotOctokit()
    payload = JSON.parse(JSON.stringify(issue))

    owner = payload.repository.owner.login
    repo = payload.repository.name
    issueNumber = payload.issue.number

    context = {
      config: jest.fn().mockResolvedValue(undefined),
      id: '1234',
      name: 'issue_comment.created',
      isBot: false,
      issue: jest.fn().mockImplementation(() => {
        return {
          owner,
          repo,
          issue_number: issueNumber
        }
      }),
      pullRequest: jest.fn(),
      octokit: octokit as any,
      repo: jest.fn(),
      log: {
        info: jest.fn(),
        warn: jest.fn()
      } as any,
      payload
    }
    context.octokit.repos.createDeployment = jest.fn() as any
    context.octokit.auth = jest.fn().mockResolvedValue({ token: 'test' })
  })

  test('receives comment without slash', async () => {
    context.payload.comment.body = 'hello world'

    await label(context)
  })

  // test scenario where PR comment invokes non-existent function
  test('receives invalid comment', async () => {
    // override comment body
    context.payload.comment.body = '/invalid'
    const comment = 'error: unknown command `invalid`'

    context.octokit.issues.createComment = jest.fn().mockImplementation(() => {
      return {
        data: {
          created_at: '2023-11-28T23:06:31Z',
          body: 'error: unknown command `invalid`'
        }
      }
    }) as any

    await label(context)
    expect(context.octokit.issues.createComment).toHaveBeenCalledWith(context.issue({ body: comment }))
  })

  test('receives release comment', async () => {
    context.payload.comment.body = '/release'

    context.octokit.pulls.get = jest.fn().mockImplementation(() => {
      return {
        data: {
          head: {
            ref: 'triggers'
          }
        }
      }
    }) as any

    await label(context)
    expect(context.octokit.repos.createDeployment).toHaveBeenCalledWith({
      owner,
      repo,
      ref: 'triggers',
      environment: 'stage',
      auto_merge: false,
      required_contexts: []
    })
  })

  test('receives production release comment', async () => {
    context.payload.comment.body = '/release'

    context.octokit.pulls.get = jest.fn().mockImplementation(() => {
      return {
        data: {
          head: {
            ref: 'release-prod'
          }
        }
      }
    }) as any

    await label(context)
    expect(context.octokit.repos.createDeployment).toHaveBeenCalledWith({
      owner,
      repo,
      ref: 'release-prod',
      environment: 'production',
      auto_merge: false,
      required_contexts: []
    })
  }, 100000)
})
