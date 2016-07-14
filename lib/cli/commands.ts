import {Utils} from '../common/Utils';

const THEMING_GROUP = 'Theming arguments:';
const PALETTE_OPTIONS = {
  'name':                 { desc: 'Name for the theme.' },
  'primary-palette':      { desc: 'Primary palette color.', alias: 'primary' },
  'accent-palette':       { desc: 'Accent palette color.', alias: 'accent' },
  'warn-palette':         { desc: 'Warning palette color.', alias: 'warn' },
  'background-palette':   { desc: 'Background palette color.', alias: 'background' }
};

// Yargs requires that all commands be marked as strict individually.
const markAsStrict = command => command.strict();

export function registerCommands(yargs: any): any {
  yargs
    .command('', 'Default command. Builds all of the files.', markAsStrict)
    .command('css', 'Builds only the CSS files.', markAsStrict)
    .command('js', 'Builds only the JS files.', markAsStrict)
    .command('theme', 'Builds the theme files.', command => {
      Object.keys(PALETTE_OPTIONS).forEach(key => {
        let argConfig = PALETTE_OPTIONS[key];

        command.option(key, {
          alias: argConfig.alias,
          describe: argConfig.desc,
          group: THEMING_GROUP,
          type: 'array',
          requiresArg: true
        });
      });

      command.option('dark', {
        describe: 'Whether to generate a dark theme.',
        group: THEMING_GROUP
      });

      return markAsStrict(command);
    }, processThemeArgs);

  return yargs;
}

/**
 * Turns the specified theme options into an array, expected by the theming builder.
 */
function processThemeArgs(args) {
  const themeArgs = Object.keys(PALETTE_OPTIONS).map(key => Utils.dashToCamel(key));
  let themes = [];

  // Filter out the defined, theme-specific keys from the rest.
  let definedArgs = Object.keys(args)
    .filter(key => args[key] && themeArgs.indexOf(key) !== -1);

  // Find the palette with the most colors to be used as a reference.
  let largestPalette = definedArgs
    .sort((key, prevKey) => args[prevKey].length - args[key].length)[0];

  if (largestPalette) {
    /**
     * Goes through the colors and creates new themes by matching them to their index.
     * E.g. { primaryPalette: ['red', 'green'], accentPalette: ['blue', 'yellow'], turns into
     * [
     *   { primaryPalette: 'red', accentPalette: 'blue' },
     *   { primaryPalette: green, accentPalette: 'yellow' }
     * ]
     */
    for (let i = 0; i < args[largestPalette].length; i++) {
      let newTheme = {
        dark: !!args.dark
      };

      definedArgs.forEach(palette => {
        let value = args[palette][i];

        if (value) {
          newTheme[palette] = value;
        }
      });

      themes.push(newTheme);
    }
  } else {
    // Add a default theme, that will use the defaults, if no palettes were specified.
    themes.push({
      dark: !!args.dark
    });
  }

  args.theme = themes;
};
