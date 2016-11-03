import {VirtualContext} from '../virtual_context/VirtualContext';
import {DefaultConfig} from '../common/DefaultConfig';
import {Utils} from '../common/Utils';

const merge = require('merge');

export class ThemeBuilder {

  private _$mdTheming: any;
  private _$mdThemingProvider: MdThemingProvider;
  private _$mdThemeCSS: string;
  private _generateThemes: Function;
  private _virtualContext: VirtualContext;

  /**
   * Instantiates the Theme Builder with the specified themes and possible palettes.
   */
  constructor(theme: MdTheme | MdTheme[], palettes?: MdPaletteDefinition, mainModule?: string) {

    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    this._virtualContext = new VirtualContext({
      $$moduleName: mainModule,
      $$interception: {
        run: this._onAngularRunFn.bind(this)
      }
    });

    let injector =  this._virtualContext.run(__dirname + '/../resolvers/isolated_angular.js', {
      strictMode: true
    })['injector'];

    this._buildThemingService([].concat(theme), palettes || {}, injector);
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
  private _buildThemingService(themes: MdTheme[], palettes: MdPaletteDefinition, injector: any) {
    let _colorPalettes = injector['$mdColorPalette'];

    this._$mdThemingProvider = injector['$mdTheming'](_colorPalettes);
    this._$mdThemeCSS = injector['$MD_THEME_CSS'];

    themes.forEach(theme => this._registerTheme(theme));
    Utils.forEach(palettes, (palette, name) => this._registerPalette(name, palette));

    this._$mdTheming = this._$mdThemingProvider['$get']();
  }

  /** Registers a theme in the $mdTheming provider */
  private _registerTheme(theme: MdTheme) {
    // Apply defaults theme palettes to current theme.
    theme = merge({}, DefaultConfig.theme, theme);

    let themeRef = this._$mdThemingProvider
      .theme(theme.name || 'default')
      .primaryPalette(theme.primaryPalette, theme.primaryPaletteHues)
      .accentPalette(theme.accentPalette, theme.accentPaletteHues)
      .warnPalette(theme.warnPalette, theme.warnPaletteHues)
      .backgroundPalette(theme.backgroundPalette, theme.backgroundPaletteHues);

    if (theme.dark) {
      themeRef.dark();
    }
  }

  /** Registers a palette in the $mdTheming provider */
  private _registerPalette(paletteName: string, palette: MdPalette) {

    if (palette.extends) {
      const basePalette = palette.extends;

      // Sanitize the palette to fulfill the $mdTheming service requirements
      this._sanitizePalette(palette);

      palette = this._$mdThemingProvider.extendPalette(basePalette, palette);
    }

    this._$mdThemingProvider.definePalette(paletteName, palette);
  }

  /**
   * Function will be used to intercept Angular's Run Phase.
   */
  private _onAngularRunFn(runFn) {
    if (runFn.name === 'generateAllThemes') {
      this._generateThemes = runFn;
    }
  }

  /**
   * Sanitizes the palette definition from unnecessary overflow, which can lead to errors in the
   * $mdTheming service.
   */
  private _sanitizePalette(palette: MdPalette) {
    delete palette.extends;
  }

}

/** Mocked interface of the $mdThemingProvider */
interface MdThemingProvider {
  theme: (themeName, inheritFrom?) => MdThemeBuilder;
  definePalette: (paletteName: string, palette: MdPalette) => void;
  extendPalette: (paletteName: string, palette: MdPalette) => MdPalette;
}

/** Angular Material Theme Builder interface */
interface MdThemeBuilder {
  primaryPalette: (name, hue?: MdThemeHues) => MdThemeBuilder;
  accentPalette: (name, hue?: MdThemeHues) => MdThemeBuilder;
  warnPalette: (name, hue?: MdThemeHues) => MdThemeBuilder;
  backgroundPalette: (name, hue?: MdThemeHues) => MdThemeBuilder;
  dark: () => MdThemeBuilder;
}

/** Angular Material Theme definition */
export interface MdTheme {
  name?: string;
  dark?: boolean;

  // Primary Palette
  primaryPalette?: string;
  primaryPaletteHues?: MdThemeHues;

  accentPalette?: string;
  accentPaletteHues?: MdThemeHues;

  warnPalette?: string;
  warnPaletteHues?: MdThemeHues;

  backgroundPalette?: string;
  backgroundPaletteHues?: MdThemeHues;
}

/** Angular Material Theme hue registry */
export interface MdThemeHues {
  'default'?: string;
  'hue-1'?: string;
  'hue-2'?: string;
  'hue-3'?: string;
}

/** Angular Material Palette registry */
export interface MdPaletteDefinition {
  [paletteName: string]: MdPalette;
}

/** Angular Material Palette map */
export interface MdPalette {
  extends: string;
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  A100?: string;
  A200?: string;
  A400?: string;
  A700?: string;
  contrastDefaultColor?: string;
  contrastDarkColors?: string[];
  contrastLightColors?: string[];
  contrastStrongLightColors?: string[];
}
