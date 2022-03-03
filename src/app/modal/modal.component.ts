import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  /**
   * The modal title
   */
  @Input() title: string;
  /**
   * The message to display in the modal
   */
  @Input() content: string;
  /**
   * If you want a redirect link, display it here
   */
  @Input() redirectLink: string;
  /**
   * If link is displayed, you can set its text here, else just the link is displayed
   */
  @Input() redirectText: string;

  constructor(public activeModal: NgbActiveModal, private router: Router) { }

  ngOnInit(): void {
  }

  redirect() {
    this.activeModal.close();
    this.router.navigate([this.redirectLink]);
  }
}
