import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private router: Router) { }

  ngOnInit() {
    this.jwtStore.destroyToken();
    this.router.navigate(['login']);
  }

}
