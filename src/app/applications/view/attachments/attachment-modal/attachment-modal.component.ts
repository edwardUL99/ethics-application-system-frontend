import { ChangeDetectorRef, Component, ElementRef, Input, OnInit,  ViewChild } from '@angular/core';
import { Observer } from 'rxjs';
import { AlertComponent } from '../../../../alert/alert.component';
import { UploadFileRequest } from '../../../../files/requests/uploadfilerequest';
import { ApplicationService } from '../../../application.service';
import { Application } from '../../../models/applications/application';
import { ApplicationStatus } from '../../../models/applications/applicationstatus';
import { AttachedFile } from '../../../models/applications/attachedfile';
import { ApplicationDisplayComponent } from '../../application-display/application-display.component';
import { environment } from '../../../../../environments/environment';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';

@Component({
  selector: 'app-attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.css']
})
export class AttachmentModalComponent implements OnInit {
  /**
   * The modal ID
   */
  @Input() id: string;
  /**
   * The application display component hosting the modal
   */
  @Input() applicationDisplay: ApplicationDisplayComponent;
  /**
   * The application to display attachments for
   */
  @Input() application: Application;
  /**
   * The upload progress alert to notify of file upload
   */
  @ViewChild('uploadProgress')
  uploadProgress: AlertComponent;
  /**
   * The file upload input
   */
  @ViewChild('fileUpload')
  fileUpload: ElementRef;
  /**
   * The supported file types
   */
  private supportedFileTypes: string = environment.supportedFileTypes;

  constructor(private applicationService: ApplicationService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  private displayUploaded(uploading?: boolean, message?: string, error?: boolean) {
    if (uploading) {
      this.uploadProgress.alertType = 'alert-primary';
      this.uploadProgress.message = message;
      this.uploadProgress.show();
    } else {
      this.uploadProgress.alertType = (error) ? 'alert-danger' : 'alert-success';
      this.uploadProgress.message = message;
      this.uploadProgress.show();

      if (!error) {
        setTimeout(() => this.uploadProgress.hide(), 2000);
      }
    }
  }

  checkStatus(status: string): boolean {
    return resolveStatus(this.application.status) == ApplicationStatus[status];
  }

  getFileFormatsMessage() {
    if (this.supportedFileTypes == '*') {
      return 'All file types are supported';
    } else {
      const splits = this.supportedFileTypes.split(',');
      const joined = splits.join(', ');

      return 'The file types: ' + joined + ' are supported';
    }
  }

  getFileAccept() {
    return this.supportedFileTypes;
  }

  private hideUploaded() {
    this.uploadProgress.hide();
  }

  private attach(request: UploadFileRequest | File, save?: boolean, subscriber?: Partial<Observer<Application>>) {
    if (save) {
      // need's to be saved before attaching file
      this.applicationDisplay.saveAndUpdateDisplay(e => {
        if (!e) {
          this.attach(request, false, subscriber);
        } else {
          if (subscriber) {
            subscriber.error(e);
          } else {
            this.displayUploaded(false, e, true);
          }
        }
      });
    } else {
      if (!subscriber) {
        subscriber = {
          next: () => {
            this.displayUploaded(false, 'File attached successfully');
            this.cd.detectChanges();
          },
          error: e => this.displayUploaded(false, e, true)
        };
      } 

      this.applicationService.attachFile(this.application, request)
        .subscribe(subscriber);
    }
  }

  attachFile(event: any) {
    const file: File = event.target.files[0];
    this.displayUploaded(true, 'Uploading file, please wait...');

    this.attach(file, this.applicationDisplay.newApplication);
  }

  attachFileCallback(observer: Partial<Observer<Application>>) {
    const fileInput = document.createElement('input');
    fileInput.classList.add('d-none');
    fileInput.type = 'file';
    fileInput.accept = this.getFileAccept();
    fileInput.onchange = (e: any) => {
      const file: File = e.target.files[0];
      const request = new UploadFileRequest(file.name, file, this.application.applicationId);
      
      this.attach(request, this.applicationDisplay.newApplication, observer);
      fileInput.remove();
    };

    fileInput.click();
  }

  downloadFile(file: AttachedFile) {
    this.displayUploaded(true, 'Downloading file, please wait...');
    this.applicationService.downloadAttachedFile(file)
      .subscribe({
        next: downloaded => {
          this.hideUploaded();
          downloaded.save();
        },
        error: e => this.displayUploaded(false, e, true)
      });
  }

  deleteFile(file: AttachedFile) {
    this.applicationService.deleteAttachedFile(this.application, file)
      .subscribe({
        next: () => this.displayUploaded(false, 'Attachment deleted successfully'),
        error: e => this.displayUploaded(false, e, true)
      });
  }
}
