import yaml from 'yaml'
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
    content = yaml.parse(buff.toString()) as Record<string, any>
  }
  return content
}

/**
 *  Convert GitHub team name to slug
 *
 * @param {string } team  - the name of the team
 *
 * @returns { string } - the slug of the team
 */
export function teamSlug (team: string): string {
  return team.toLocaleLowerCase().replace(/ /g, '-')
}
