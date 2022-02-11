/**
 * This file is used for managing the dynamically loaded component refs
 */

import { ComponentRef, Injectable } from '@angular/core';
import { ComponentType } from '../../models/components/applicationcomponent';
import { ApplicationViewComponent } from './application-view.component';
import { ComponentHostDirective } from './component-host.directive';
import { registeredComponents } from './registered.components';

/**
 * The mapping of host component ID to the list of component references loaded for that host
 */
type HostsMapping = {
  [key: string]: ComponentRef<ApplicationViewComponent>[];
}

/**
 * This class is used to load, store and return the component ref. It allows for the creation and subsequent
 * destruction of all sub components
 */
@Injectable()
export class DynamicComponentLoader {
  /**
   * The mapping of the loader
   */
  private mapping: HostsMapping = {}

  /**
   * Register the component reference 
   * @param hostId the host ID to register it to
   * @param componentRef the created component reference
   */
  private register(hostId: string, componentRef: ComponentRef<ApplicationViewComponent>) {
    if (!(hostId in this.mapping)) {
      this.mapping[hostId] = [];
    }

    this.mapping[hostId].push(componentRef);
  }

  /**
   * Remove the component ref from the registered components
   * @param hostId the host ID to remove the component from
   * @param componentRef the reference of the component to remove
   */
  private unregister(hostId: string, componentRef: ComponentRef<ApplicationViewComponent>) {
    if (hostId in this.mapping) {
      const refs = this.mapping[hostId];
      const index = refs.indexOf(componentRef, 0);
      if (index > -1) {
        refs.splice(index, 1);
      }

      if (refs.length == 0) {
        delete this.mapping[hostId];
      }
    }
  }

  /**
   * Register and load the component into the provided host
   * @param componentHost the host to register and load the component into
   * @param componentType the type of component to load
   */
  loadComponent(componentHost: ComponentHostDirective, componentType: ComponentType): ComponentRef<ApplicationViewComponent> {
    const componentRef = componentHost.viewContainerRef.createComponent<ApplicationViewComponent>(registeredComponents.getComponent(componentType));
    this.register(componentHost.hostId, componentRef);

    return componentRef;
  }

  // TODO the view holding the template (i.e. all the components), should implement OnDestroy and call destroyComponents()

  /**
   * Destroy the components loaded by the host with the given ID
   * @param hostId the ID of the host to destroy the components of
   */
  destroyComponents(hostId: string): void;
  /**
   * Destroy all the components loaded by all component hosts
   */
  destroyComponents(): void;
  /**
   * Destroy the loaded components for the given host ID
   * @param hostId the ID of the host. If not present, all components are removed
   */
  destroyComponents(hostId?: string): void {
    if (hostId) {
      if (hostId in this.mapping) {
        const toRemove: ComponentRef<ApplicationViewComponent>[] = [];
        
        for (let ref of this.mapping[hostId]) {
          ref.destroy();
          toRemove.push(ref);
        }

        toRemove.forEach(ref => this.unregister(hostId, ref));
      }
    } else {
      Object.keys(this.mapping).forEach(this.destroyComponents);
    }
  }
}