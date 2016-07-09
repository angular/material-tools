import {VirtualContext} from '../virtual_context/virtual_context';

/**
 * Use a customized $mdTheming service to generateThemes for the specified ThemeCSS
 * Preparing the $mdTheming service using our isolated, hijacked Angular script in
 * the virtual context, to completely isolate the window modification from our node
 * environment.
 */
export class ThemingBuilder {

  private _$mdTheming: any;                   // Virtual $mdTheming service
  private _$mdThemeCSS: string;               // Default theming stylesheet for all components
  private _generateThemes: Function;          // VM function which generates the themes
  private _virtualContext: VirtualContext;    // Context which runs all the browser code

  /**
   * Generates a static theme file from the specified theme.
   * @param theme Angular Material Theme
   */
  constructor(theme: MdTheme) {

    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.

    this._virtualContext = new VirtualContext({
      $$interception: {
        run: this._onAngularRunFn.bind(this)
      }
    });

    let angular = `${__dirname}/../resolvers/mock_angular.js`;
    let injector =  this._virtualContext.run( angular, { strictMode: true })['injector'];

    this._buildThemingService(theme, injector);
  }


  /**
   * Builds the theming stylesheet for the current theme and returns it.
   *
   * The `$mdTheming` is using the $injector service for loading the theme stylesheet.
   * Generate our themes, by injecting the fake injector and the virtual `$mdTheming` service, which
   * contains the specified theme.
   *
   * @param themeCSS Optional Theme Stylesheet for override.
   */
  build(themeCSS?: string): string {
    let _fakeInjector = {
      get: () => (themeCSS || this._$mdThemeCSS).trim(),  // Known $mdTheming bug: input CSS cannot end with newline
      has: () => true
    };

    this._generateThemes(_fakeInjector, this._$mdTheming);

    let styleElements = this._virtualContext.globals.document.head.children;

    return styleElements
      .map(element => element.children[0]['data'])
      .reduce((styleSheet, part) => styleSheet + part);
  }

  /**
   *  Instantiate the $mdTheming service by calling the provider function with
   *  the $mdColorPalette variable; using Default Color Palettes for Angular Material
   *
   *  Register the specified theme in the `$mdThemingProvider` by overwriting the default theme.
   *  Using the `default` theme allows developers to use the static stylesheet without doing anything.
   *
   *  Instantiate the `$mdTheming` service after the theme has been configured.
   */
  private _buildThemingService(theme: MdTheme, injector:any) {
    let _colorPalettes = injector['$mdColorPalette'],
        $mdThemingProvider : MdThemingProvider = injector['$mdTheming'](_colorPalettes);

    this._$mdThemeCSS = injector['$MD_THEME_CSS'];

    $mdThemingProvider
      .theme('default')
      .primaryPalette(theme.primaryPalette)
      .accentPalette(theme.accentPalette)
      .warnPalette(theme.warnPalette)
      .backgroundPalette(theme.backgroundPalette);

    this._$mdTheming = $mdThemingProvider['$get']();

  }
  /**
   * Function will be used to intercept Angular's Run Phase.
   * @param runFn Angular Run Function
   * @private
   */
  private _onAngularRunFn(runFn) {
    if (runFn.name === 'generateAllThemes') {
      this._generateThemes = runFn;
    }
  }

}

// *************************************************
// Internal Interfaces
// *************************************************

/**
 * Mocked interface of the $mdThemingProvider
 * @internal
 */
interface MdThemingProvider {
  theme: (themeName, inheritFrom?) => MdThemeBuilder;
}

/**
 * Angular Material Theme Builder interface
 * @internal
 */
interface MdThemeBuilder {
  primaryPalette: (value) => MdThemeBuilder;
  accentPalette: (value) => MdThemeBuilder;
  warnPalette: (value) => MdThemeBuilder;
  backgroundPalette: (value) => MdThemeBuilder;
}

/**
 * Angular Material Theme definition
 */
export interface MdTheme {
  primaryPalette: string;
  accentPalette: string;
  warnPalette: string;
  backgroundPalette: string;
}


