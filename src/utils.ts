import yaml from 'js-yaml'
import type { ProbotOctokit } from 'probot'

/**
 * Read repository settings configuration
 *
 * @param { string } owner - the owner of the repository
 * @param { string } repo - the name of the repository
 * @param { file } file - the name of the file to read
 * @param { ProbotOctokit } github - the GitHub API client
 *
 * @returns { Record<string,any> } - contents of the file
 */
export async function getRepoContent (owner: string, repo: string, file: string, ref: string, github: InstanceType<typeof ProbotOctokit>): Promise<Record<string, any>> {
  const fileContent = await github.repos.getContent({
    owner,
    repo,
    path: file,
    ref
  })

  let content: Record<string, any> = {}
  if ('content' in fileContent.data) {
    const buff = Buffer.from(fileContent.data.content, 'base64') // encoding should be base64
    content = yaml.load(buff.toString()) as Record<string, any>
  }
  return content
}
