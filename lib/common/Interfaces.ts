import {MdTheme} from '../builders/ThemeBuilder';
import {MaterialToolsFiles} from '../resolvers/FileResolver';

// TODO(devversion): revisit interface, due to typescript compiler and AST

export interface MaterialToolsOutput {
  source: string;
  compressed: string;
  map?: string;
}

export interface MaterialToolsData {
  files: MaterialToolsFiles,
  dependencies: any
}

export interface MaterialToolsOptions {
  destination?: string;
  modules?: string[];
  version?: string;
  theme?: MdTheme;
  mainFilename?: string;
  cache?: string;
  destinationFilename?: string;
}
