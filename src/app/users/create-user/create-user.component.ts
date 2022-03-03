import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
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
    this.username = null;
    this.error = null;

    if (this.jwtStore.isTokenValid()) {
      this.username = this.jwtStore.getUsername();

      if (!this.username) {
        this.router.navigate(['logout'], {
          queryParams: {
            sessionTimeout: true
          }
        });
      }
    } else {
      this.router.navigate(['user-redirect']);
    }
  }

  get name() {
    return this.form.get('name');
  }

  get department() {
    return this.form.get('department');
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
          catchError(e => throwError(() => getErrorMessage(e)))
        )
        .subscribe({
          next: () => {
            this.router.navigate(['user-redirect'])
          },
          error: e => this.error = e
        });
    }
  }
}
