import { Injector, Type } from '@angular/core';

/**
 * This class holds an injector reference to manually inject properties. It should be initialised in the app module
 */
export class InjectorService {
  /**
   * The InjectorService singleton instance
   */
  private static instance: InjectorService;

  /**
   * Construct and boostrap the singleton instance
   * @param injector the injector to use for injecting
   */
  private constructor(private injector: Injector) {
    InjectorService.instance = this;
  }

  /**
   * Initialise the instance with the given injector
   * @param injector the inkector to initialise the instance with
   */
  static initialise(injector: Injector) {
    this.instance = new InjectorService(injector);
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