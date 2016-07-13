const THEMING_GROUP = 'Theming arguments:';
const PALETTE_OPTIONS = {
  'primary-palette': 'Primary palette color.',
  'accent-palette': 'Accent palette color.',
  'warn-palette': 'Warning palette color.',
  'background-palette': 'Background palette color.'
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
        command.option(key, {
          alias: key.split('-').shift(),
          describe: PALETTE_OPTIONS[key],
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

/** Turns the specified theme options into an array, expected by the theming builder. */
function processThemeArgs(args) {
  const availablePalettes = ['primaryPalette', 'accentPalette', 'warnPalette', 'backgroundPalette'];
  let themes = [];

  // Filter out the theme-specific keys from the rest.
  let definedPalettes = Object.keys(args)
    .filter(key => availablePalettes.indexOf(key) !== -1);

  // Find the palette with the most colors to be used as a reference.
  let largestPalette = definedPalettes
    .sort((key, prevKey) => args[prevKey].length - args[key].length)[0];

  if (largestPalette) {
    /*
      Goes through the colors and creates new themes by matching them to their index.
      E.g. { primaryPalette: ['red', 'green'], accentPalette: ['blue', 'yellow'], turns into
      [
        { primaryPalette: 'red', accentPalette: 'blue' },
        { primaryPalette: green, accentPalette: 'yellow' }
      ]
     */
    for (let i = 0; i < args[largestPalette].length; i++) {
      let newTheme = {
        dark: !!args.dark
      };

      definedPalettes.forEach(palette => {
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
