const IS_VERBOSE = process.argv.indexOf('--verbose') !== -1;
const IS_SILENT = process.argv.indexOf('--silent') !== -1;

/** RegEx to retrieve the digits of a ngMaterial version. */
const VERSION_DIGIT_REGEX = /([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})(?:-rc(?:.|-)([0-9]{1,3}))?/;

export class Utils {

  private static getTimestamp(): string {
    let date = new Date();
    let timeDigits = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map(value => value < 10 ? '0' + value : value)
      .join(':');

    return `[${timeDigits}]:`;
  }

  /** Logs a regular console message. */
  static log(...messages): void {
    if (!IS_SILENT) {
      console.log(this.getTimestamp(), ...messages);
    }
  }

  /** Logs a regular message, only if verbose mode is enabled. */
  static info(...messages): void {
    if (IS_VERBOSE) {
      this.info(...messages);
    }
  }

  /** Logs a warning message. */
  static warn(...messages): void {
    if (!IS_SILENT) {
      console.warn(this.getTimestamp(), ...messages);
    }
  }

  /** Logs an error message. */
  static error(...messages): void {
    if (!IS_SILENT) {
      console.error(this.getTimestamp(), ...messages);
    }
  }

  /**
   * Generates a unique identifier / number for the specified version.
   * Those numbers can be easily compared. The higher number is the newer version.
   * Returns `-1`, when the version couldn't be correctly parsed.
   */
  static getVersionNumber(version): number {

    let matches = version.match(VERSION_DIGIT_REGEX);

    if (!matches) {
      return -1;
    }

    matches = matches
      .slice(1)
      .map(digit => fillDigit(digit, 3));

    function fillDigit(digitString = '999', maxSlotLength: number): string {
      let digitLength = digitString.length;

      for (let i = 0; i < maxSlotLength - digitLength; i++) {
        digitString = `0${digitString}`;
      }

      return digitString;
    }

    return parseInt(matches.join(''));
  }

  /**
   * Iterates through an object variable and calls the specified iterator function
   * with the given value and key.
   * Returning a value of the iteration function will overwrite the current item.
   */
  static forEach(object: any, fn: (value, key) => any) {
    for (let _key in object) {
      if (object.hasOwnProperty(_key)) {
        fn(object[_key], _key);
      }
    }
  }
}
