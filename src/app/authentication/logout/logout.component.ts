import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationTemplateContext } from '../../applications/applicationtemplatecontext';
import { CacheManager } from '../../caching/cachemanager';
import { UserContext } from '../../users/usercontext';
import { JWTStore } from '../jwtstore';

/**
 * This component is used to logout the user
 */
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private jwtStore: JWTStore,
    private router: Router,
    private userContext: UserContext,
    private cache: CacheManager) { }

  ngOnInit() {
    this.jwtStore.destroyToken();
    this.userContext.clearContext();
    this.cache.clearCache();
    ApplicationTemplateContext.getInstance().clear();
    this.router.navigate(['login'], {
      queryParamsHandling: 'merge'
    });
  }
}
