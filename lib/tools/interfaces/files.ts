
export interface MaterialToolsFile {
  source: string;
  compressed: string;
  map?: string;
}

/** Interface for the output object of the local resolver. */
export interface LocalBuildFiles {
  root: string;
  js: string[];
  css: string[];
  scss: string[];
  themes: string[];
  layout: string[];
}


export interface MaterialToolsData {
  files: LocalBuildFiles,
  dependencies: any
}
