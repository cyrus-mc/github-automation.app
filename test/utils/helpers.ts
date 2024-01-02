import nock from 'nock'
import { Probot, ProbotOctokit } from 'probot'
import fs from 'fs'
import path from 'path'
import myProbotApp from '../../src'
import type { RepositorySettings } from '../../src/types/repository_settings'

/**
 * Constants used in the fixtures
 */
const IDENTIFIERS = {
  organizationName: '_orgname',
  repositoryName: '_reponame'
}

/**
 * Gets the path to the fixtures
 * @param {string} fixture - the fixture to be loaded
 * @returns the path to the fixture directory
 */
function getFixture (...fixture: string[]): string {
  return path.join(...[__dirname, '..', 'fixtures', ...fixture])
}
/**
 * Gets the private key fixture
 * @returns {string} - the private key
 */
function getPrivateKey (): string {
  const privateKey = fs.readFileSync(
    getFixture('mock-cert.pem'),
    'utf-8'
  )
  return privateKey
}

export async function getTestableProbot (): Promise<Probot> {
  nock.disableNetConnect()

  const probot = new Probot({
    appId: 123456789,
    privateKey: getPrivateKey(),

    // disable request throttling and retries for testing
    Octokit: ProbotOctokit.defaults({
      retry: { enabled: false },
      throttle: { enabled: false }
    }),
    logLevel: 'warn'
  })

  // load our app into probot
  await probot.load(myProbotApp)
  return probot
}

/**
 * Resets the network monitor state
 */
export function resetNetworkingMonitoring (): void {
  nock.cleanAll()
  nock.enableNetConnect()
}

/**
 * Creates a fluent scope for  mocking GitHub API calls using Nock
 * @returns a nock for the GitHub API endpoint
 */
export function mockGitHubApiRequests (): OctokitApiMock {
  return new OctokitApiMock()
}

class OctokitApiMock {
  private readonly nock: nock.Scope

  constructor (scope: nock.Scope | null = null) {
    this.nock = scope ?? nock('https://api.github.com')
  }

  public toNock (): nock.Scope {
    return this.nock
  }

  public getRepoContent (repo: string, file: string, contents: string): OctokitApiMock {
    const mock = this.nock.get(`/repos/${IDENTIFIERS.organizationName}/${repo}/contents/${file}`)
      .reply(200, {
        content: Buffer.from(contents).toString('base64'),
        encoding: 'base64',
        name: file
      })

    return new OctokitApiMock(mock)
  }

  public repoUpdate (settings?: RepositorySettings): OctokitApiMock {
    const mock = this.nock.patch(`/repos/${IDENTIFIERS.organizationName}/${IDENTIFIERS.repositoryName}`, {
      ...settings
    })
      .reply(200, {
        name: IDENTIFIERS.repositoryName,
        full_name: `${IDENTIFIERS.organizationName}/${IDENTIFIERS.repositoryName}`,
        owner: {
          login: IDENTIFIERS.organizationName
        },
        ...settings
      })

    return new OctokitApiMock(mock)
  }
}