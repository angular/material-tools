const THEMING_GROUP = 'Theming arguments:';
const PALETTE_OPTIONS = {
  'primary-palette': 'Primary palette color.',
  'accent-palette': 'Accent palette color.',
  'warn-palette': 'Warning palette color.',
  'background-palette': 'Background palette color.'
};

export function registerCommands(yargs: any): any {
  yargs
    .command('css', 'Builds only the CSS files.', command => command.strict())
    .command('js', 'Builds only the JS files.', command => command.strict())
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

      return command.strict();
    });

  return yargs;
}
