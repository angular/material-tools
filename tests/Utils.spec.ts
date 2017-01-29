import {Logger} from '../lib/common/Logger';
import {Utils} from '../lib/common/Utils';

describe('Utils', () => {

  describe('_getVersionNumber function', () => {

    it('should correctly compare versions', () => {
      expect(Utils.extractVersionNumber('1.1.0'))
        .toBeGreaterThan(Utils.extractVersionNumber('1.0.9'));
    });

    it('should correctly compare new release candidates versions', () => {
      expect(Utils.extractVersionNumber('1.1.0-rc.5'))
        .toBeGreaterThan(Utils.extractVersionNumber('1.1.0-rc.4'));
    });

    it('should correctly compare old release candidates versions', () => {
      expect(Utils.extractVersionNumber('1.1.0-rc-5'))
        .toBeGreaterThan(Utils.extractVersionNumber('1.1.0-rc-4'));
    });

    it('should correctly compare older versions', () => {
      expect(Utils.extractVersionNumber('0.11.0'))
        .toBeLessThan(Utils.extractVersionNumber('1.1.0'));
    });

    it('should correctly compare release candiates with major releases', () => {
      expect(Utils.extractVersionNumber('1.0.0'))
        .toBeLessThan(Utils.extractVersionNumber('1.1.0-rc.5'));
    });

    it('should should not throw if a version that does not match the pattern', () => {
      let result = null;

      expect(() => {
        result = Utils.extractVersionNumber('something');
      }).not.toThrow();

      expect(result).toBe(-1);
    });

  });

  describe('forEach function', () => {

    it('should correctly call the iterator function', () => {

      let iteratorFn = jasmine.createSpy('onIteratorFn');

      Utils.forEach({
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

      Utils.forEach(iteratorObject, (value, key) => fakeObject[key] = value);

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

  describe('dashToCamel function', () => {

    it('should convert dash-cased strings to camelCase', () => {
      expect(Utils.dashToCamel('dash-cased')).toBe('dashCased');
    });

    it('should should not change strings that are already camel cased', () => {
      expect(Utils.dashToCamel('camelCased')).toBe('camelCased');
    });

    it('should should not change single words', () => {
      expect(Utils.dashToCamel('something')).toBe('something');
    });
  });

});
