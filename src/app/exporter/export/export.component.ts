import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from '../../alert/alert.component';
import { AuthorizationService } from '../../users/authorization.service';
import { UserContext } from '../../users/usercontext';
import { ExporterService } from '../exporter.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {
  /**
   * An error to display on load
   */
  loadError: string;
  /**
   * An alert for export messages
   */
  @ViewChild('exportAlert')
  exportAlert: AlertComponent;
  /**
   * The form for single exports
   */
  singleForm: FormGroup;
  /**
   * The form for range exports
   */
  rangeForm: FormGroup;

  constructor(private userContext: UserContext, 
    private authorizationService: AuthorizationService,
    private exportService: ExporterService,
    private fb: FormBuilder) {
    
    this.singleForm = this.fb.group({
      id: this.fb.control('', Validators.required)
    });

    this.rangeForm = this.fb.group({
      start: this.fb.control('', Validators.required),
      end: this.fb.control('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }
  
  private loadUser() {
    this.userContext.getUser()
      .subscribe({
        next: user => this.authorizationService.authorizeUserPermissions(user, ['EXPORT_APPLICATIONS'], true)
          .subscribe({
            next: response => {
              if (!response) {
                this.loadError = 'You are not authorized to export applications'
              }
            },
            error: e => this.loadError = e
          })
      });
  }

  private exportInProgress() {
    this.exportAlert.alertType = 'alert-info';
    this.exportAlert.message = 'Export in progress. Please wait...';
    this.exportAlert.show();
  }

  private exportSuccess() {
    this.exportAlert.displayMessage('The export was successfully requested. You will receive an e-mail with instructions to download'
      + ' the exported applications when the task is completed', false, false);
  }

  private exportFailed() {
    this.exportAlert.displayMessage('There were no applications to export', true);
  }

  singleExport() {
    this.exportAlert.hide();
    const id = this.singleForm.get('id').value;

    if (id) {
      this.exportInProgress();
      this.exportService.singleExport(id)
        .subscribe({
          next: response => {
            if (response) {
              this.exportSuccess();
            } else {
              this.exportFailed();
            }
          },
          error: e => this.exportAlert.displayMessage(e, true)
        });
    }
  }

  rangeExport() {
    this.exportAlert.hide();
    const start = this.rangeForm.get('start').value;
    const end = this.rangeForm.get('end').value;

    if (start && end) {
      this.exportInProgress();
      this.exportService.rangeExport(start, end)
        .subscribe({
          next: response => {
            if (response) {
              this.exportSuccess();
            } else {
              this.exportFailed();
            }
          },
          error: e => this.exportAlert.displayMessage(e, true)
        });
    }
  }
}
