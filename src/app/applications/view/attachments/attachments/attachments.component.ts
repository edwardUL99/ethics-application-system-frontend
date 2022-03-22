import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApplicationDisplayComponent } from '../../application-display/application-display.component';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  /**
   * The parent application display component
   */
  @Input() applicationDisplay: ApplicationDisplayComponent;
  /**
   * The modal for attaching files
   */
  @ViewChild('attachments')
  attachments: AttachmentModalComponent;

  constructor() { }

  ngOnInit(): void {
  }

}
