/**
 * This file holds types used in the autofill package
 */

import { Observable } from "rxjs";

/**
 * The type of the object that is used for storing the objects to resolve
 */
export type ResolveMap = {
  [key: string]: any;
}

/**
 * A type used to specify properties that are proxyable
 */
export type ProxyProperties = {
  [key: string]: string
}

/**
 * Type of the mapping for proxies
 */
export type ProxyMapping = {
  [key: string]: ProxyProperties
}

/**
 * This class represents a property that has been resolved from the resolver.
 */
export class ResolvedProperty extends Observable<any> {
  /**
   * Retrieve the value and pass it into the subscriber function
   * @param subscriber the subscriber function to pass the retrieved value into
   */
  retrieveValue(subscriber: (value: any) => void) {
    this.subscribe(value => subscriber(value));
  }
}

/**
 * The shape of an individual config item
 */
export interface ConfigItem {
  /**
   * The value is a generator function that takes no arguments and returns the value to register or a static variable.
   * Note that if it is not a function, the value will be constant at time of registration. If the value needs to be different
   * at different points of time in runtime, use a generator
   */
  value: any;
  /**
   * Optional proxies to specify proxied IDs
   */
  proxies?: ProxyProperties
  /**
   * If the value is a generator function and this value is true, the function will be executed at construction time 
   * rather than resolve time
   */
  executeValue?: boolean;
}

/**
 * The shape of the AutofillConfig
 */
export type AutofillConfig = {
  [key: string]: ConfigItem
}