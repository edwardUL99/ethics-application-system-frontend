import { Injectable, Injector, Type } from '@angular/core';

/**
 * This class holds an injector reference to manually inject properties. It bootstraps itself to
 * a singleton instance on creation by angular, so it does not have to be injected itself, just accessed
 * with InjectorService.getInstance()
 */
@Injectable()
export class InjectorService {
  /**
   * The InjectorService singleton instance
   */
  private static instance: InjectorService;

  /**
   * Construct and boostrap the singleton instance
   * @param injector the injector to use for injecting
   */
  constructor(private injector: Injector) {
    InjectorService.instance = this;
  }

  /**
   * Retrieve the bootstrapped injector service instance
   */
  static getInstance(): InjectorService {
    return this.instance;
  }

  /**
   * Retrieve the instance of type T and return it
   * @param type the type of the object to inject
   * @returns the injected object, or undefined if not injectable
   */
  inject<T>(type: Type<T>): T {
    return this.injector.get(type, undefined);
  }
}