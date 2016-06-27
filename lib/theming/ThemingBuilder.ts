import {VirtualContext} from '../virtual_context/VirtualContext';

export class ThemingBuilder {

  /** Virtual $mdTheming service */
  private _$mdTheming: any;

  /** Default theming stylesheet for all components */
  private _$mdThemeCSS: string;

  /** The Virtual Context instance, which runs all the browser code */
  private _virtualContext: VirtualContext;

  /** Synchronized function from the Virtual Machine, which generates the themes */
  private _generateThemes: Function;

  /**
   * Generates a static theme file from the specified theme.
   * @param theme Angular Material Theme
   */
  constructor(private theme: MdTheme) {

    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    this._virtualContext = new VirtualContext({
      $$interception: {
        run: this._onAngularRunFn.bind(this)
      }
    });

    // Execute our isolated browser resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    let injector = this._virtualContext.run(__dirname + '/../resolvers/isolated_browser_resolver.js', true)['injector'];

    // Default Color Palettes for Angular Material.
    let _colorPalettes = injector['$mdColorPalette'];

    // Instantiate the $mdTheming service by calling the provider function with the $mdColorPalette variable.
    let $mdThemingProvider: MdThemingProvider = injector['$mdTheming'](_colorPalettes);

    this._$mdThemeCSS = injector['$MD_THEME_CSS'];

    // Register the specified theme in the `$mdThemingProvider` by overwriting the default theme.
    // Using the `default` theme allows developers to use the static stylesheet without doing anything.
    $mdThemingProvider
      .theme('default')
      .primaryPalette(theme.primaryPalette)
      .accentPalette(theme.accentPalette)
      .warnPalette(theme.warnPalette)
      .backgroundPalette(theme.backgroundPalette);

    // Instantiate the `$mdTheming` service after the theme has been configured.
    this._$mdTheming = $mdThemingProvider['$get']();
  }

  /**
   * Builds the theming stylesheet for the current theme and returns it.
   * @param themeCSS Optional Theme Stylesheet for override.
   */
  build(themeCSS?: string): string {

    // The `$mdTheming` is using the $injector service for loading the theme stylesheet.
    // We can take advantage of it, for specifying our own theme stylesheet.
    let _fakeInjector = {
      get: () => themeCSS || this._$mdThemeCSS,
      has: () => true
    };

    // Generate our themes, by injecting the fake injector and the virtual `$mdTheming` service, which
    // contains the specified theme.
    this._generateThemes(_fakeInjector, this._$mdTheming);

    let styleElements = this._virtualContext.globals.document.head.children;

    return styleElements
      .map(element => element.children[0]['data'])
      .reduce((styleSheet, part) => styleSheet + part);

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

/** Angular Material Theme definition */
export interface MdTheme {
  primaryPalette: string;
  accentPalette: string;
  warnPalette: string;
  backgroundPalette: string;
}