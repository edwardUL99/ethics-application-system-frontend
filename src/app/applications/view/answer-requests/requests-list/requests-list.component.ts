import { Component, Input, OnInit } from '@angular/core';
import { UserContext } from '../../../../users/usercontext';
import { AnswerRequestService } from '../../../answer-request.service';
import { AnswerRequestResponse } from '../../../models/requests/answer-requests/responses';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.css']
})
export class RequestsListComponent implements OnInit {
  /**
   * The loaded requests
   */
  @Input() requests: AnswerRequestResponse[];
  /**
   * An error that occurred loading the requests
   */
  loadError: string;

  constructor(private userContext: UserContext, 
    private requestService: AnswerRequestService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests() {
    this.requestService.getRequests(this.userContext.getUsername())
      .subscribe({
        next: response => this.requests = response,
        error: e => this.loadError = e
      });
  }
}
