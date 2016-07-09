import {Logger} from '../lib/utils/logger';
import {extractVersionNumber} from '../lib/utils/versioner';
import {forEach} from '../lib/utils/lodash';

describe('Utils', () => {

  describe('_getVersionNumber function', () => {

    it('should correctly compare versions', () => {
      expect(extractVersionNumber('1.1.0'))
        .toBeGreaterThan(extractVersionNumber('1.0.9'))
    });

    it('should correctly compare new release candidates versions', () => {
      expect(extractVersionNumber('1.1.0-rc.5'))
        .toBeGreaterThan(extractVersionNumber('1.1.0-rc.4'))
    });

    it('should correctly compare old release candidates versions', () => {
      expect(extractVersionNumber('1.1.0-rc-5'))
        .toBeGreaterThan(extractVersionNumber('1.1.0-rc-4'))
    });

    it('should correctly compare older versions', () => {
      expect(extractVersionNumber('0.11.0'))
        .toBeLessThan(extractVersionNumber('1.1.0'));
    });

    it('should correctly compare release candiates with major releases', () => {
      expect(extractVersionNumber('1.0.0'))
        .toBeLessThan(extractVersionNumber('1.1.0-rc.5'))
    });

    it('should should not throw if a version that does not match the pattern', () => {
      let result = null;

      expect(() => {
        result = extractVersionNumber('something');
      }).not.toThrow();

      expect(result).toBe(-1);
    });

  });

  describe('forEach function', () => {

    it('should correctly call the iterator function', () => {

      let iteratorFn = jasmine.createSpy('onIteratorFn');

      forEach({
        key1: 'value1',
        key2: 'value2'
      }, iteratorFn);

      expect(iteratorFn).toHaveBeenCalledTimes(2);
    });

    it('should correctly resolve the value', () => {
      let fakeObject = {};
      let iteratorObject = {
        key1: 'value1',
        key2: 'value2'
      };

      forEach(iteratorObject, (value, key) => fakeObject[key] = value);

      expect(fakeObject).toEqual(iteratorObject);

    });

  });

  describe('Logging', () => {

    it('should correctly log a message', () => {
      spyOn(console, 'log');

      Logger.log('Test');

      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should correctly error a message', () => {
      spyOn(console, 'error');

      Logger.error('Test');

      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should correctly warn a message', () => {
      spyOn(console, 'warn');

      Logger.warn('Test');

      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should not log an info message by default', () => {
      spyOn(console, 'info');

      Logger.info('Test');

      expect(console.info).not.toHaveBeenCalled();
    });

  });

});
