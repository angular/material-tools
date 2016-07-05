import {PackageResolver} from '../lib/resolvers/PackageResolver';

describe('Package Resolver', () => {

  describe('_getVersionNumber', () => {

    it('should correctly compare versions', () => {
      expect(PackageResolver._getVersionNumber('1.1.0'))
        .toBeGreaterThan(PackageResolver._getVersionNumber('1.0.9'))
    });

    it('should correctly compare new release candidates versions', () => {
      expect(PackageResolver._getVersionNumber('1.1.0-rc.5'))
        .toBeGreaterThan(PackageResolver._getVersionNumber('1.1.0-rc.4'))
    });

    it('should correctly compare old release candidates versions', () => {
      expect(PackageResolver._getVersionNumber('1.1.0-rc-5'))
        .toBeGreaterThan(PackageResolver._getVersionNumber('1.1.0-rc-4'))
    });

    it('should correctly compare older versions', () => {
      expect(PackageResolver._getVersionNumber('0.11.0'))
        .toBeLessThan(PackageResolver._getVersionNumber('1.1.0'));
    });

    it('should correctly compare release candiates with major releases', () => {
      expect(PackageResolver._getVersionNumber('1.0.0'))
        .toBeLessThan(PackageResolver._getVersionNumber('1.1.0-rc.5'))
    });

  })

});