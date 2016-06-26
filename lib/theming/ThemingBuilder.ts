import {VirtualContext} from '../virtual_context/VirtualContext';

export class ThemingBuilder {

  private _THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];

  private _$mdTheming: any;
  private _$mdThemingProvider: MdThemingProvider;
  private _$mdThemeCSS: string;

  private _registeredTheme: any;

  /**
   * Generates a static theme file from the specified theme.
   * @param theme Angular Material Theme
   */
  constructor(private theme: MdTheme) {

    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    let virtualContext = new VirtualContext({
      // TODO(devversion): revisit this to support different versions
      $$moduleName: 'angular-material'
    });

    // Execute our isolated browser resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    let injector = virtualContext.run(__dirname + '/../resolvers/isolated_browser_resolver.js', true)['injector'];

    let _colorPalettes = injector['$mdColorPalette'];

    // By default the loaded color palettes are not sanitized and do not contain the given contrast colors.
    this._forEach(_colorPalettes, this._preparePalette.bind(this));

    // Instantiate the $mdTheming service by calling the provider function with the $mdColorPalette variable.
    this._$mdThemingProvider = injector['$mdTheming'](_colorPalettes);
    this._$mdTheming = this._$mdThemingProvider['$get']();
    this._$mdThemeCSS = injector['$MD_THEME_CSS'];

    // Register the specified theme in the $mdThemingProvider by overwriting the default theme.
    // Using the `default` theme allows developers to use the static stylesheet without doing anything.
    this._registeredTheme = this._$mdThemingProvider
      .theme('default')
      .primaryPalette(theme.primaryPalette)
      .accentPalette(theme.accentPalette)
      .warnPalette(theme.warnPalette)
      .backgroundPalette(theme.backgroundPalette);

  }

  build(): string {

    // Find all CSS rules and move them into an Array item.
    let rules = this._$mdThemeCSS
      .split(/}(?!(}|'|"|;))/)
      .filter(rule => rule && !!rule.length)
      .map(rule => rule.trim() + '}');

    let compiledRules = '';
    let rulesByType = {};

    // Initialize our color types with empty strings, to be able to concatenate the rules later.
    this._THEME_COLOR_TYPES.forEach(function(type) {
      rulesByType[type] = '';
    });

    // Sort the rules based on their color type concatenate them to the given style.
    rules.forEach(rule => {
      // When the rule contains a given ngMaterial class with the current color type, then we
      // can add the rule to the correct color type.
      for (let colorType of this._THEME_COLOR_TYPES) {
        if (rule.indexOf('.md-' + colorType) !== -1) {
          return rulesByType[colorType] += rule;
        }
      }

      // When the the current rule only contains the given color type without any specific Angular Material
      // class prefix, we can also assume that it belongs to the current color type.
      for (let colorType of this._THEME_COLOR_TYPES) {
        if (rule.indexOf(colorType) !== -1) {
          return rulesByType[colorType] += rule;
        }
      }

      // By default we add the current rule to the `primary` color type.
      return rulesByType['primary'] += rule;
    });

    // Parse all rules for the available color types and concatenate them at the end.
    this._THEME_COLOR_TYPES.forEach(colorType => {
      compiledRules += this._$mdThemingProvider._parseRules(this._registeredTheme, colorType, rulesByType[colorType]);
    });

    return compiledRules;
  }

  /**
   * Prepares a palette by transforming the normal hue values into an object which contains
   * the associated contrast color.
   * @param palette Theme Object.
   * @private
   */
  private _preparePalette(palette) {
    let DARK_CONTRAST_COLOR = this._colorToArray('rgba(0, 0, 0, 0.87)');
    let LIGHT_CONTRAST_COLOR = this._colorToArray('rgba(255, 255, 255, 0.87)');
    let STRONG_LIGHT_CONTRAST_COLOR = this._colorToArray('rgb(255, 255, 255)');

    let defaultContrast = palette['contrastDefaultColor'];
    let lightColors = (palette['contrastLightColors'] || '').split(' ');
    let strongLightColors = (palette['contrastStrongLightColors'] || '').split(' ');
    let darkColors = (palette['contrastDarkColors'] || '').split(' ');

    // Cleanup the palette object, because the referenced object will be used in the theme later.
    delete palette['contrastDefaultColor'];
    delete palette['contrastLightColors'];
    delete palette['contrastStrongLightColors'];
    delete palette['contrastDarkColors'];

    this._forEach(palette, (hueValue, hueName) => {
      // When the hue value is already an object, then it's already converted.
      if (hueValue instanceof Object) {
        return;
      }

      // RGBA value of the current hue.
      let rgbaValue = this._colorToArray(hueValue);

      palette[hueName] = {
        value: rgbaValue,
        contrast: getContrastColor()
      };

      /**
       * Retrieves the contrast color from the current hue, by checking the
       * palettes configuration.
       */
      function getContrastColor() {
        if (defaultContrast === 'light') {
          if (darkColors.indexOf(hueName) !== -1) {
            return DARK_CONTRAST_COLOR;
          } else if (strongLightColors.indexOf(hueName) !== -1) {
            return STRONG_LIGHT_CONTRAST_COLOR;
          } else {
            return LIGHT_CONTRAST_COLOR;
          }
        } else {
          if (lightColors.indexOf(hueName) !== -1) {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR;
          } else {
            return DARK_CONTRAST_COLOR;
          }
        }
      }

    });
  }

  /**
   * Transforms a given color string into an array of the specified colors.
   * @param colorString Color String
   * @returns {number[]}
   */
  private _colorToArray(colorString: string): number[] {

    if (/^rgb/.test(colorString)) {
      return colorString
        .replace(/(^\s*rgba?\(|\)\s*$)/g, '')
        .split(',')
        // If the index is at three, then it's an RGBA value and we have to parse the opacity.
        .map((value, index) => index == 3 ? parseFloat(value) : parseInt(value, 10));
    }

    // When the color string is notated with an hash, then it's a HEX color.
    if (colorString.charAt(0) == '#') {
      colorString = colorString.substring(1);
    }

    // If the color string doesn't match the HEX formation we return nothing.
    if (!/^([a-fA-F0-9]{3}){1,2}$/g.test(colorString)) {
      return;
    }

    // Parse the HEX value by retrieving the digest index.
    let digestIndex = colorString.length / 3;
    let red = colorString.substr(0, digestIndex);
    let grn = colorString.substr(digestIndex, digestIndex);
    let blu = colorString.substr(digestIndex * 2);

    if (digestIndex === 1) {
      red += red;
      grn += grn;
      blu += blu;
    }

    return [parseInt(red, 16), parseInt(grn, 16), parseInt(blu, 16)];
  }

  // TODO(devversion): make more generic - addressed in other PR
  private _forEach(object, fn) {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        fn(object[key], key);
      }
    }
  }

}

/**
 * Mocked interface of the $mdThemingProvider
 * @internal
 */
interface MdThemingProvider {
  _parseRules: (theme, colorType, rules) => void;
  theme: (themeName, inheritFrom?) => MdThemeBuilder;
}

/**
 * Angular Material Theme Builder interface
 * @internal
 */
interface MdThemeBuilder {
  primaryPalette: (value) => MdThemeBuilder,
  accentPalette: (value) => MdThemeBuilder,
  warnPalette: (value) => MdThemeBuilder,
  backgroundPalette: (value) => MdThemeBuilder
}

/** Angular Material Theme definition */
export interface MdTheme {
  primaryPalette: string;
  accentPalette: string;
  warnPalette: string;
  backgroundPalette: string;
}