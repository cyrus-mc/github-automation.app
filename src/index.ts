import type { Context, Probot } from 'probot'
import { label } from './handlers/label'
import { getRepoContent } from './utils'
import { Settings } from './settings'
import type { PushEvent } from './types/push_event'

export = (app: Probot) => {
  let controlRepository = '.github'
  if (process.env.CONTROL_REPOSITORY != null) {
    controlRepository = process.env.CONTROL_REPOSITORY
  }

  let settingsFile = 'settings.repo.yaml'
  if (process.env.REPOSITORY_SETTINGS_FILE != null) {
    settingsFile = process.env.REPOSITORY_SETTINGS_FILE
  }

  // let teamsFile = 'teams.yaml'
  // if (process.env.TEAMS_CONFIG_FILE != null) {
  //  teamsFile = process.env.TEAMS_CONFIG_FILE
  // }

  app.log.info('Application loaded')

  app.on('issue_comment.created', async (context: Context<'issue_comment.created'>) => {
    await label(context)
  })

  app.on('repository.created', async (context: Context<'repository.created'>) => {
    let config = await getRepoContent(context.payload.repository.owner.login,
      controlRepository,
      settingsFile, 'main', context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)

    config = await getRepoContent(context.payload.repository.owner.login,
      controlRepository,
      'permissions.repo.yaml', 'main', context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
  })

  app.on('repository.edited', async (context: Context<'repository.edited'>) => {
    const config = await getRepoContent(context.payload.repository.owner.login,
      controlRepository,
      'permissions.repo.yaml', 'main', context.octokit)

    await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
  })

  app.on('repository', async (context: any) => {
    const payload = context.payload as PushEvent

    /* only trigger on push to main */
    if (payload.ref !== 'refs/heads/main') {
      return
    }
    /* check if modified files includes the teams file */
    const updateTeams = payload.commits.some((commit) => commit.modified.includes('teams.yaml'))

    /* if push event modifies team file, sync teams */
    if (updateTeams) {
      const config = await getRepoContent(context.payload.repository.owner.login,
        controlRepository,
        'teams.yaml', 'main', context.octokit)

      await Settings.sync(context.payload.repository.owner.login, context.payload.repository.name, config, context.octokit)
    }
  })
}
