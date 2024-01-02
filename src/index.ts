import type { Context, Probot } from 'probot'
import { label } from './handlers/label'
import { getConfiguration } from './utils'
import { Settings } from './settings'

export = (app: Probot) => {
  app.log('Application loaded')

  app.on('issue_comment.created', async (context: Context<'issue_comment.created'>) => {
    await label(context)
  })

  app.on('repository.created', async (context: Context<'repository.created'>) => {
    let controlRepository = '.github'
    if (process.env.CONTROL_REPOSITORY != null) {
      controlRepository = process.env.CONTROL_REPOSITORY
    }
    let settingsFile = 'settings.repo.yaml'
    if (process.env.REPOSITORY_SETTINGS_FILE != null) {
      settingsFile = process.env.REPOSITORY_SETTINGS_FILE
    }

    const config = await getConfiguration(context.payload.repository.owner.login,
      controlRepository,
      settingsFile, context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
  })
}
