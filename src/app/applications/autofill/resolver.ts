/**
 * This file defines components and functions for resolving autofill strings in the template
 */

import { Observable } from 'rxjs';
import { ResolveMap, ProxyMapping, ProxyProperties, ResolvedProperty, ConfigItem, AutofillConfig } from './types';
import { Config } from './config';

/**
 * The resolver instance
 */
let _resolver: AutofillResolver; 

/**
 * Converts values to an autofill friendly version
 */
export interface Converter {
  /**
   * Convert the value
   * @param value the value to convert
   */
  convert(value: any): any;
}

/**
 * Converts dates to a format for a text-input
 */
export class DateConverter implements Converter {
  convert(value: any) {
    if (value instanceof Date) {
      let str = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getUTCDate()}`

      return str;
    } else {
      return value;
    }
  }
}

/**
 * Map of property types to converter
 */
export type Converters = {
  [key: string]: Converter;
}

/**
 * The map of converters
 */
const _converters: Converters = {}

_converters[Date.name] = new DateConverter();

/**
 * This class is used to resolve autofill query strings. Resolves paths as so:
 * key.property.property1... etc.
 * 
 * For example, if you have an object user with a nested object account with sub-properties, username, email,
 * and the template had an autofill string user.account.email. The user object was registered with register('user', user);
 * The query string will be broken up into the separate properties of user -> account -> email. Email is at the end
 * of the query and exists in the account object, so the value of email is returned. For nested objects along the path,
 * they must be objects and not simple values like numbers or strings. I.e., you can't have user.name.property since name
 * is just a string and not a nested object
 */
export class AutofillResolver {
  /**
   * The map that has values that can be resolved
   */
  private resolvable: ResolveMap = {};
  /**
   * Mapping of proxies for the resolver
   */
  private proxies: ProxyMapping = {};

  /**
   * Register a key with the associated object
   * @param key the key to register the object with
   * @param value the value to associate with the key. The value can be an observable. If it is an observable,
   * it will be resolved before proceeding with the property resolution. for example key.item.value and key is an observable.
   * item is not a property of observable, but it is a property of the value that the observable returns. The sub-properties of value, if 
   * observables won't be resolved, however, and will be treated as further nested values. If the observable throws an error, undefined will be returned and the error logged.
   * 
   * The value can be a generator function that will be executed at resolve time to get the value at the point of time resolve was called, e.g.
   * () => someValue is a generator function that will return someValue when resolve is called
   * 
   * @param proxies this map allows you to 'proxy' property names. For example if the query path 
   * was item.id but the item does not have id, but it does have a property called sequence. If you want to map
   * id to sequence, you can pass in a proxy id: sequence. Now, when you pass in item.id, id will be resolved to sequence
   * and the value will be returned to the client.
   * The proxy can be defined anywhere in the query path as each key in the query path is checked and resolved against the proxy
   */
  register(key: string, value: any, proxies?: ProxyProperties) {
    this.resolvable[key] = value;
    
    if (proxies) {
      this.proxies[key] = proxies;
    }
  }

  /**
   * Remove the resolvable value specified by the given key
   * @param key the key to remove from the resolver
   */
  remove(key: string) {
    if (key in this.resolvable) {
      delete this.resolvable[key];
    }

    if (key in this.proxies) {
      delete this.proxies[key];
    }
  }

  private _convertValue(value: any) {
    if (value) {
      const converter = _converters[value.constructor.name];

      if (converter != undefined) {
        return converter.convert(value);
      } else {
        return value;
      }
    } else {
      return value;
    }
  }

  /**
   * Creates a nested observable which is a ResolvedProperty that resolves the observable before proceeding
   * if the value is an observable
   * @param value the value to resolve
   */
  private createNestedObservable(value: Observable<any>, queryArray: string[]): ResolvedProperty {
    return new ResolvedProperty(observer => {
      value.subscribe({
        next: value => {
          observer.next((queryArray.length == 1) ? this._convertValue(value) : this.resolveRecursive(queryArray, value, 1));
          observer.complete();
        },
        error: e => {
          console.error(e);
          observer.next(undefined);
          observer.complete();
        }
      });
    });
  }

  /**
   * Check if the key is proxied and if so, replace it with the true value
   * @param resolveKey the key of the resolvable value
   * @param key the current key in the query string path
   */
  private resolveProxiedKey(resolveKey: string, key: string): string {
    if (resolveKey in this.proxies) {
      const proxies = this.proxies[resolveKey];
      key = (key in proxies) ? proxies[key]:key;
    }

    return key;
  }

  /**
   * Resolve recursively down from the root value (root value, i.e. index 0 should already be resolved)
   * @param queryArray the array containing the query parameters
   * @param value the current value
   * @param currentIndex the currentIndex in the query array
   */
  private resolveRecursive(queryArray: string[], value: any, currentIndex: number): any {
    if (currentIndex == 0) {
      throw new Error('The recursive query resolution should begin at index 1 of the query string')
    }

    const valueType = typeof(value);

    if (currentIndex == queryArray.length - 1 || valueType != 'object') {
      let key = this.resolveProxiedKey(queryArray[0], queryArray[currentIndex]);

      if (valueType != 'object') {
        return undefined; // cannot go any further down if the type is a simple type
      }

      return (key in value) ? this._convertValue(value[key]) : undefined;
    } else {
      const key = this.resolveProxiedKey(queryArray[0], queryArray[currentIndex]);

      return (typeof(value[key]) == 'object' && key in value) ?
        this.resolveRecursive(queryArray, value[key], currentIndex + 1) : undefined;
    }
  }

  /**
   * Create a ResolvedProperty contaning the given value
   * @param value the value to create the resolved property from
   */
  private createProperty(value: any): ResolvedProperty {
    return new ResolvedProperty(observer => {
      observer.next(value);
      observer.complete();
    });
  }

  /**
   * Resolve the retrieved value from the resolvables map
   * @param queryParams the split parameters of the query
   * @param value the value retrieved from resolvables
   * @returns the resolved property promise
   */
  private resolveValue(queryParams: string[], value: any): ResolvedProperty {
    value = (value instanceof Function) ? value() : value;

    if (value instanceof Observable) {
      return this.createNestedObservable(value, queryParams);
    } else {
      if (queryParams.length > 1) {
        return this.createProperty(this.resolveRecursive(queryParams, value, 1));
      } else {
        return this.createProperty(this._convertValue(value));
      }
    }
  }

  /**
   * Resolve the autofill query string
   * @param query the autofill query to resolve
   */
  resolve(query: string): ResolvedProperty {
    const queryParams: string[] = query.split('.');

    if (queryParams.length > 0) {
      const key = queryParams[0];

      if (key in this.resolvable) {
        let value = this.resolvable[key];
        return this.resolveValue(queryParams, value);
      }
    }

    return this.createProperty(undefined);
  }

  /**
   * Constructs an AutofillResolver from the config in autofill/config.ts if not provided
   * or the provided config.
   * Does not set the resolver instance, call setResolver manually
   * @param config the parameter for overriding the config in ./config.ts:Config. If left out, Config is used by default
   */
  static fromConfig(config?: AutofillConfig): AutofillResolver {
    config = (config) ? config : Config;
    const resolver = new AutofillResolver();

    for (let key of Object.keys(config)) {
      const configItem: ConfigItem = config[key];
      let value = configItem.value;

      if (value instanceof Function && configItem.executeValue) {
        value = value();
      }

      if (value == undefined || value == null) {
        throw new Error(`Unresolved AutofillResolver Config dependency ${key}. Ensure the value function does not return undefined and any setup steps are done before calling this method`);
      }

      resolver.register(key, value, (configItem.proxies) ? configItem.proxies : undefined);
    }

    return resolver;
  }
}

/**
 * Get the set resolver instance
 */
export function getResolver(): AutofillResolver {
  return _resolver;
}

/**
 * Set the resolver to use for autofill so that it can be accessed from anywhere using the getResolver method
 * @param resolver the resolver to use for autofill
 */
export function setResolver(resolver: AutofillResolver) {
  _resolver = resolver;
}