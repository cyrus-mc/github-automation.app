import yaml from 'js-yaml'
import type { Config } from './types/config'
import type { ProbotOctokit } from 'probot'

/**
 * Read repository settings configuration
 *
 * @param { string } owner - the owner of the repository
 * @param { string } repo - the name of the repository
 * @param { file } file - the name of the file to read
 * @param { ProbotOctokit } github - the GitHub API client
 *
 * @returns { Config } - configuration
 */
export async function getConfiguration (owner: string, repo: string, file: string, github: InstanceType<typeof ProbotOctokit>): Promise<Config> {
  const fileContent = await github.repos.getContent({
    owner,
    repo,
    path: file
  })

  let config: Config = {}
  if ('content' in fileContent.data) {
    const buff = Buffer.from(fileContent.data.content, 'base64') // encoding should be base64
    config = yaml.load(buff.toString()) as Config
  }
  return config
}
