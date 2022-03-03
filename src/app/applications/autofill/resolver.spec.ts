/**
 * This file is used to test the AutofillResolver API
 */

import { Observable } from 'rxjs';
import { AutofillResolver, getResolver, setResolver } from './resolver';
import { AutofillConfig, ConfigItem } from './types';

describe('AutofillResolver', () => {
  let resolver: AutofillResolver;
  let config: AutofillConfig;
  let configSpy: jasmine.Spy;
  let configSpy1: jasmine.Spy;
  let testObject: ConfigItem;

  beforeEach(() => {
    testObject = {
      value: () => {
        return {
          property: 'value',
          nested: {
            property: 'value1',
            nested1: {
              property: 'value2'
            }
          }
        }
      },
      proxies: {
        sub: 'nested1'
      }
    };

    config = {
      test: testObject,
      observable: {
        value: () => new Observable(observable => observable.next({property: 'value3'})),
        executeValue: true
      }
    };

    configSpy = spyOn(testObject, 'value');
    configSpy1 = spyOn(config.observable, 'value');
    configSpy.and.callThrough();
    configSpy1.and.callThrough();
    resolver = AutofillResolver.fromConfig(config);
  });

  it('#fromConfig should create resolver from configuration', () => {
    resolver = AutofillResolver.fromConfig(config);
    expect(resolver).toBeTruthy();
    expect(configSpy).not.toHaveBeenCalled();
  });

  it('#fromConfig should handle executeValue config correctly', () => {
    testObject['executeValue'] = true;
    resolver = AutofillResolver.fromConfig(config);
    expect(resolver).toBeTruthy();
    expect(configSpy).toHaveBeenCalled();
    delete testObject['executeValue'];
  });

  it('#resolve should resolve with single parameter', (done) => {
    const queryString = 'test';

    resolver.resolve(queryString).retrieveValue(value => {
      expect(value).toEqual(testObject.value());
      expect(configSpy).toHaveBeenCalled();
      done();
    });
  });

  it('#resolve should resolve full path without proxy', (done) => {
    const queryString = 'test.nested.nested1.property';

    resolver.resolve(queryString).retrieveValue(value => {
      expect(value).toEqual('value2');
      expect(configSpy).toHaveBeenCalled();
      done();
    });
  });

  it('#resolve should resolve full path with proxy', (done) => {
    const queryString = 'test.nested.sub.property';

    resolver.resolve(queryString).retrieveValue(value => {
      expect(value).toEqual('value2');
      expect(configSpy).toHaveBeenCalled();
      done();
    });
  });

  it('#resolve should resolve with observable', (done) => {
    const queryString = 'observable.property';

    resolver.resolve(queryString).retrieveValue(value => {
      expect(value).toEqual('value3');
      expect(configSpy1).toHaveBeenCalled();
      done();
    });
  });

  it('#resolve should return undefined if property does not exist', (done) => {
    let queryString = 'not-found';

    resolver.resolve(queryString).retrieveValue(value => {
      expect(value).toBeUndefined();

      queryString = 'test.nested.sub.not-found';

      resolver.resolve(queryString).retrieveValue(value => {
        expect(value).toBeUndefined();

        queryString = 'test.property.sub';
        resolver.resolve(queryString).retrieveValue(value => {
          expect(value).toBeUndefined();
          done();
        })
      })
    })
  });

  it('#getResolver and #setResolver should get and set the resolver instance', () => {
    expect(getResolver()).toBeUndefined();
    setResolver(resolver);
    expect(getResolver()).toEqual(resolver);
  })
});