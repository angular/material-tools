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
          type: 'string',
          requiresArg: true
        });
      });

      command.option('dark', {
        describe: 'Whether to generate a dark theme.',
        group: THEMING_GROUP
      });

      return markAsStrict(command);
    }, args => {
      // Turn the flat theme arguments into a theme object.
      args.theme = {
        primaryPalette: args.primaryPalette,
        accentPalette: args.accentPalette,
        warnPalette: args.warnPalette,
        backgroundPalette: args.backgroundPalette,
        dark: !!args.dark
      };
    });

  return yargs;
}
