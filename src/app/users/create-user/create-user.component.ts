import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { throwError as _throw } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { JWTStore } from '../../authentication/jwtstore';
import { getErrorMessage } from '../../utils';
import { CreateUpdateUserRequest } from '../createupdateuserrequest';
import { UserService } from '../user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  /**
   * The username of the user being created
   */
  username: string;
  /**
   * The form behind this component
   */
  form: FormGroup;
  /**
   * An error message
   */
  error: string;

  constructor(private userService: UserService,
    private router: Router,
    private jwtStore: JWTStore,
    private fb: FormBuilder) {
      this.form = this.fb.group({
        name: ['', Validators.required],
        department: ['', Validators.required]
      });
    }

  ngOnInit() {
    if (this.jwtStore.isTokenValid()) {
      this.username = this.jwtStore.getUsername();

      if (!this.username) {
        this.router.navigate(['logout']);
      }

      this.userService.getUser(this.username)
        .pipe(
          catchError(e => {
            if (e.status != 404) {
              return _throw('Unknown Error Occurred')
            } else {
              return _throw('OK');
            }
          })
        )
        .subscribe(() => this.router.navigate['user-redirect'],
        e => {
          if (e != 'OK') {
            this.error = e;
          }
        });
    } else {
      this.router.navigate(['logout']);
    }
  }

  create() {
    this.error = null;
    const val = this.form.value;

    if (val.name && val.department) {
      const name: string = val.name;
      const department: string = val.department;

      const request: CreateUpdateUserRequest = new CreateUpdateUserRequest(this.username, name, department);
      this.userService.createUpdateUser(request, false)
        .pipe(
          retry(3),
          catchError(e => _throw(getErrorMessage(e)))
        )
        .subscribe(() => this.router.navigate(['user-redirect']),
        e => this.error = e);
    }
  }
}
