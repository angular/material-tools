const IS_VERBOSE = process.argv.indexOf('--verbose') !== -1;
const IS_SILENT = process.argv.indexOf('--silent') !== -1;

export class Logger {

  /** Logs a regular console message. */
  static log(...messages): void {
    if (!IS_SILENT) {
      console.log(this._currentTime(), ...messages);
    }
  }

  /** Logs a regular message, only if verbose mode is enabled. */
  static info(...messages): void {
    if (IS_VERBOSE) {
      console.info(this._currentTime(), ...messages);
    }
  }

  /** Logs a warning message. */
  static warn(...messages): void {
    if (!IS_SILENT) {
      console.warn(this._currentTime(), ...messages);
    }
  }

  /** Logs an error message. */
  static error(...messages): void {
    if (!IS_SILENT) {
      console.error(this._currentTime(), ...messages);
    }
  }

  private static _currentTime(): string {
    let date = new Date();
    let timeDigits = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map(value => value < 10 ? '0' + value : value)
      .join(':');

    return `[${timeDigits}]:`;
  }

}
