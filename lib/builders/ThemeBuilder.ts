import {VirtualContext} from '../virtual_context/VirtualContext';
import {DefaultConfig} from '../common/DefaultConfig';

const merge = require('merge');

export class ThemeBuilder {

  private _$mdTheming: any;
  private _$mdThemeCSS: string;
  private _generateThemes: Function;
  private _virtualContext: VirtualContext;

  constructor(theme: MdTheme) {

    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    this._virtualContext = new VirtualContext({
      $$interception: {
        run: this._onAngularRunFn.bind(this)
      }
    });

    let injector =  this._virtualContext.run(__dirname + '/../resolvers/isolated_angular.js', {
      strictMode: true
    })['injector'];

    theme = merge({}, DefaultConfig.theme, theme);

    this._buildThemingService(theme, injector);
  }


  /**
   * Generates a static theme file from the specified theme.
   */
  build(themeCSS?: string): string {
    let _fakeInjector = {
      // Trim the theme CSS, because the $mdTheming service accidentally introduces a syntax error.
      get: () => (themeCSS || this._$mdThemeCSS).trim(),
      has: () => true
    };

    this._generateThemes(_fakeInjector, this._$mdTheming);

    let styleElements = this._virtualContext.globals.document.head.children;

    return styleElements
      .map(element => element.children[0]['data'])
      .reduce((styleSheet, part) => styleSheet + part);
  }

  /**
   * Instantiate the $mdTheming service by calling the provider function with
   * the default color palettes of Angular Material.
   *
   * Register the specified theme in the `$mdThemingProvider` by overwriting the default theme.
   * Using the default theme allows users to use the static stylesheet without doing anything.
   *
   * Instantiate the `$mdTheming` service after the provider has been configured.
   */
  private _buildThemingService(theme: MdTheme, injector: any) {
    let _colorPalettes = injector['$mdColorPalette'];
    let $mdThemingProvider: MdThemingProvider = injector['$mdTheming'](_colorPalettes);

    this._$mdThemeCSS = injector['$MD_THEME_CSS'];

    let defaultTheme = $mdThemingProvider
      .theme('default')
      .primaryPalette(theme.primaryPalette)
      .accentPalette(theme.accentPalette)
      .warnPalette(theme.warnPalette)
      .backgroundPalette(theme.backgroundPalette);

    if (theme.dark) {
      defaultTheme.dark();
    }

    this._$mdTheming = $mdThemingProvider['$get']();
  }
  /**
   * Function will be used to intercept Angular's Run Phase.
   */
  private _onAngularRunFn(runFn) {
    if (runFn.name === 'generateAllThemes') {
      this._generateThemes = runFn;
    }
  }

}

/** Mocked interface of the $mdThemingProvider */
interface MdThemingProvider {
  theme: (themeName, inheritFrom?) => MdThemeBuilder;
}

/** Angular Material Theme Builder interface */
interface MdThemeBuilder {
  primaryPalette: (value) => MdThemeBuilder;
  accentPalette: (value) => MdThemeBuilder;
  warnPalette: (value) => MdThemeBuilder;
  backgroundPalette: (value) => MdThemeBuilder;
  dark: () => MdThemeBuilder;
}

/** Angular Material Theme definition */
export interface MdTheme {
  primaryPalette?: string;
  accentPalette?: string;
  warnPalette?: string;
  backgroundPalette?: string;
  dark?: boolean;
}


