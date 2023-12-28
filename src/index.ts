import type { Context, Probot } from 'probot'
import { label } from './handlers/label'

export = (app: Probot) => {
  app.log('Application loaded')

  app.on('issue_comment.created', async (context: Context<'issue_comment.created'>) => {
    await label(context)
  })
}
