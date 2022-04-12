import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { AlertComponent } from '../../../../alert/alert.component';
import { UserService } from '../../../../users/user.service';
import { UserContext } from '../../../../users/usercontext';
import { EmailUsernameValidator } from '../../../../validators';
import { QuestionComponent } from '../../../models/components/questioncomponent';
import { QuestionViewComponent } from '../../component/application-view.component';
import { ComponentDisplayContext } from '../../component/displaycontext';

// custom validator to ensure user exists
export function UserExistsValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    const username = control.value;
    const handleError = (e: HttpErrorResponse) => {
      if (e.status == 404) {
        return of({userExists: 'The user does not exist'});
      } else {
        console.log(e);
        return of({userExists: 'An error occurred checking if the user exists'});
      }
    }
    const email = username.includes('@');

    return userService.getUser(username, email)
      .pipe(
        catchError(handleError),
        map((result: any) => {
          if ('userExists' in result) {
            return result;
          } else {
            return null;
          }
        })
      );
  }
}

/**
 * A validator that ensures the user does not request input from themselves
 * @param username the username of the viewing user
 * @returns the validation function
 */
export function OwnUsernameValidator(username: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == username) {
      return {sameUser: true};
    } else {
      return null;
    }
  }
}

// TODO a custom validator for each component should use the following function to determine if form is valid 

/**
 * Determine if input should be requested
 * @param context the context the component is loaded in
 * @param component the component to determine if input should be requested from it
 */
export function shouldRequestInput(context: ComponentDisplayContext, component: QuestionComponent): boolean {
  if (component.requestInput) {
    const id = component.componentId;
    const answerAvailable = id in context.application?.answers && !context.application?.answers[id].empty();
    
    return context.answerRequestEnabled() && !answerAvailable;
  } else {
    return false;
  }
}

/**
 * This component allows the sending of the request for a user to answer the question
 */
@Component({
  selector: 'app-request-component-answer',
  templateUrl: './request-component-answer.component.html',
  styleUrls: ['./request-component-answer.component.css']
})
export class RequestComponentAnswerComponent implements OnInit, OnChanges {
  /**
   * The component being requested
   */
  @Input() component: QuestionViewComponent;
  /**
   * The context the component is being displayed inside
   */
  @Input() context: ComponentDisplayContext;
  /**
   * Determines if input is required to be requested
   */
  requestInput: boolean;
  /**
   * Form for requesting user input
   */
  form: FormGroup;
  /**
   * The username requested
   */
  requestedUsername: string;
  /**
   * Determine if the form should be displayed
   */
  displayForm: boolean;
  /**
   * Display answer confirmation message
   */
  displayConfirmation: boolean;
  /**
   * An alert notifying of the success/error
   */
  @ViewChild('requestAlert')
  requestAlert: AlertComponent;
  /**
   * The last username entered
   */
  private static lastEntered: string = '';
  /**
   * Detects if user has given their confirmation to the manual answer
   */
  private static confirmed: boolean = false;
  /**
   * Determines if in on changes the requestInput value should be updated
   */
  private updateRequest: boolean = true;

  constructor(private fb: FormBuilder, private userService: UserService, 
    private userContext: UserContext) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: new FormControl(RequestComponentAnswerComponent.lastEntered, {
        validators: [Validators.required, EmailUsernameValidator(), OwnUsernameValidator(this.userContext.getUsername())],
        asyncValidators: [UserExistsValidator(this.userService)],
        updateOn: 'blur'
      })
    });
  }

  ngOnChanges() {
    if (this.updateRequest) {
      this.requestInput = shouldRequestInput(this.context, this.component.castComponent());
      this.component.setDisabled(!this.component.castComponent().editable || this.requestInput);
    }
  }

  get username() {
    return this.form.get('username');
  }

  submit() {
    let username: string = this.username.value;
    
    if (username.includes('@')) {
      username = username.substring(0, username.indexOf('@'));
    }

    this.context.onAnswerRequested(this.component.castComponent(), username);
    this.requestedUsername = username;
    RequestComponentAnswerComponent.lastEntered = username;
    this.requestAlert.displayMessage('Answer request added. Make sure to submit the request to send it to the user');
    this.requestAnswer();
  }

  reset() {
    if (this.requestedUsername) {
      this.context.onAnswerRequested(this.component.castComponent(), this.requestedUsername, true);
      this.requestedUsername = undefined;
      this.form.reset();
      this.username.enable();
    }
  }

  fillAnswer(confirmed?: boolean) {
    if (RequestComponentAnswerComponent.confirmed || confirmed) {
      RequestComponentAnswerComponent.confirmed = true;
      this.updateRequest = false;
      this.requestInput = false;
      this.component.setDisabled(false);
    } else {
      this.toggleAnswerConfirmation();
    }
  }

  requestAnswer() {
    this.displayForm = !this.displayForm;

    if (!this.displayForm) {
      this.username.disable();
    } else {
      this.username.setValue(RequestComponentAnswerComponent.lastEntered);
    }
  }

  toggleAnswerConfirmation(explicit?: boolean) {
    if (explicit != undefined) {
      this.displayConfirmation = explicit;
    } else {
      this.displayConfirmation = !this.displayConfirmation;
    }
  }

  static reset() {
    // reset any static content when the application is being destroyed
    this.lastEntered = '';
    this.confirmed = false;
  }
}
