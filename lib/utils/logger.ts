import { TimeStamp } from './time';

const IS_VERBOSE = process.argv.indexOf('--verbose') !== -1;
const IS_SILENT = process.argv.indexOf('--silent') !== -1;

export class Logger {

  /** Logs a regular console message. */
  static log(...messages): void {
    if (!IS_SILENT) {
      console.log(TimeStamp.now(), ...messages);
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
      console.warn(TimeStamp.now(), ...messages);
    }
  }

  /** Logs an error message. */
  static error(...messages): void {
    if (!IS_SILENT) {
      console.error(TimeStamp.now(), ...messages);
    }
  }

}
