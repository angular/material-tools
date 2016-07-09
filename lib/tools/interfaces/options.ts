/** Angular Material Theme definition */
export interface ThemeOptions {
  primaryPalette: string;
  accentPalette: string;
  warnPalette: string;
  backgroundPalette: string;
}

export interface ToolOptions {
  destination?: string;
  modules?: string[];
  version?: string;
  theme?: ThemeOptions;
  mainFilename?: string;
  cache?: string;
  destinationFilename?: string;
}
