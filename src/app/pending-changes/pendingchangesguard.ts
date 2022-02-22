import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Directive, HostListener, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * The base class for components that should be warned against navigation 
 */
@Directive()
export abstract class CanDeactivateComponent {
  /**
   * If this method returns true, the component can be navigated away from without warning
   */
  abstract canDeactivate(): boolean | Observable<boolean>;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent) {
    if (!this.canDeactivate()) {
      $event.returnValue = true;
      return true;
    }
  }
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<CanDeactivateComponent> {
  canDeactivate(component: CanDeactivateComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return component.canDeactivate() ?
    true :
    confirm('You are about to leave the current page with unsaved changes. Confirm this navigation');
  }
}