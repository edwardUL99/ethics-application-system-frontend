import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private userContext: UserContext,
    private cache: CacheManager) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionTimeout = params.sessionTimeout;

      const queryParams = (sessionTimeout) ? {
        queryParams: {
          sessionTimeout: true
        }
      } : {};

      this.jwtStore.destroyToken();
      this.userContext.clearContext();
      this.cache.clearCache();
      ApplicationTemplateContext.getInstance().clear();
      this.router.navigate(['login'], queryParams);
    });
  }
}
