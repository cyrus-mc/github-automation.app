import type { RepositorySettings } from './repository_settings'
import type { Branches } from './branches'

export interface Config {
  repository?: RepositorySettings
  branches?: Branches
}
