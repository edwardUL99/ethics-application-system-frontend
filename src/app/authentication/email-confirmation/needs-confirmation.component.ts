import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { throwError as throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { getErrorMessage } from '../../utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-needs-confirmation',
  templateUrl: './needs-confirmation.component.html',
  styleUrls: ['./needs-confirmation.component.css']
})
export class NeedsConfirmationComponent implements OnInit {
  /**
   * An error message
   */
  error: string;
  /**
   * A success message
   */
  message: string;

  constructor(private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  handleError(error: HttpErrorResponse) {
    return throwError(getErrorMessage(error));
  }

  resendConfirmation() {
    this.error = null;
    this.message = null;

    this.route.queryParams.subscribe(params => {
      if (!params.username) {
        this.error = "You need to specify the username of the account that needs confirmation";
      }

      const username = params.username;
      const account = params.account != null;

      this.authService.resendConfirmationEmail(username, account)
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .subscribe(() => {
          this.message = "Confirmation E-mail re-sent";
        },
        e => this.error = e);
    });
  }
}
