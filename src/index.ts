import type { Context, Probot } from 'probot'
import { label } from './handlers/label'
import { getRepoContent } from './utils'
import { Settings } from './settings'

export = (app: Probot) => {
  let controlRepository = '.github'
  if (process.env.CONTROL_REPOSITORY != null) {
    controlRepository = process.env.CONTROL_REPOSITORY
  }

  let settingsFile = 'settings.repo.yaml'
  if (process.env.REPOSITORY_SETTINGS_FILE != null) {
    settingsFile = process.env.REPOSITORY_SETTINGS_FILE
  }
  app.log('Application loaded')

  app.on('issue_comment.created', async (context: Context<'issue_comment.created'>) => {
    await label(context)
  })

  app.on('repository.created', async (context: Context<'repository.created'>) => {
    const config = await getRepoContent(context.payload.repository.owner.login,
      controlRepository,
      settingsFile, 'main', context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
  })

  app.on('repository.edited', async (context: Context<'repository.edited'>) => {
    const config = await getRepoContent(context.payload.repository.owner.login,
      controlRepository,
      'permissions.repo.yaml', 'main', context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
  })
}
