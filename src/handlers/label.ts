/* eslint no-eval: 0 */
import type { Context } from 'probot'

export async function label (context: Context<'issue_comment.created'>): Promise<void> {
  const comment = context.payload.comment.body

  // only act if comment starts with (/)
  if (comment[0] === '/') {
    const handlerFunc = comment.slice(1)
    if (handlerFunc === 'release') {
      await release(context)
    } else {
      await unknown(context, handlerFunc)
    }
  }
}

// since we use eval, we have to ignore lint and ts errors for unused function
/* eslint-disable */
async function release (context: Context<'issue_comment.created'>): Promise<void> {
/* eslint-enable */
  // get owner, repo, and issue number
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const issueNumber = context.payload.issue.number

  // get the ref of the pull request
  const response = await context.octokit.pulls.get({ owner, repo, pull_number: issueNumber })
  const ref = response.data.head.ref

  let environment = 'stage'
  // if ref startswith release, set environment to production
  if (ref.startsWith('release')) environment = 'production'
  // create a deployment
  await context.octokit.repos.createDeployment({ owner, repo, ref, environment, auto_merge: false, required_contexts: [] })
}

async function unknown (context: Context<'issue_comment.created'>, handlerFunc: string): Promise<void> {
  const error = `error: unknown command \`${handlerFunc}\``
  await context.octokit.issues.createComment(context.issue({ body: error }))
}
