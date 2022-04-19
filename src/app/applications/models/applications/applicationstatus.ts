/**
 * This enum represents an application status
 */
export enum ApplicationStatus {
  /**
   * The status associated with a draft application
   */
  DRAFT = "Draft",
  /**
   * The status associated with an application that has been submitted
   */
  SUBMITTED = "Submitted",
  /**
   * The status associated with an application that has been referred back to the applicant but re-submitted 
   * to the committee
   */
  RESUBMITTED = "Re-submitted",
  /**
   * The status associated with an application that is currently being reviewed
   */
  REVIEW = "In Review",
  /**
   * The status associated with an application that has been finished review
   * but needs a decision made on it by the chair/administrator
   */
  REVIEWED = "Reviewed",
  /**
   * The status associated with an application that has been referred to the applicant
   * to review certain fields
   */
  REFERRED = "Referred to Applicant",
  /**
   * The status associated with an application that has been reviewed
   */
  APPROVED = "Approved",
  /**
   * The status associated with an application that has been rejected
   */
  REJECTED = "Rejected"
}

/**
 * A mapping of status to its description
 */
type StatusDescriptionMappings = {
  [key in ApplicationStatus]?: string
};

export const StatusDescpriptions: StatusDescriptionMappings = {};

StatusDescpriptions[ApplicationStatus.DRAFT] = 'The application is being edited by the applicant before submission';
StatusDescpriptions[ApplicationStatus.SUBMITTED] = 'The application has been submitted to the ethics committee for review';
StatusDescpriptions[ApplicationStatus.REVIEW] = 'The application is currently under review by the ethics committee';
StatusDescpriptions[ApplicationStatus.REVIEWED] = 'The application has been reviewed by the ethics committee and is awaiting an outcome decision';
StatusDescpriptions[ApplicationStatus.REFERRED] = 'The application has been referred back to the applicant for more information';
StatusDescpriptions[ApplicationStatus.RESUBMITTED] = 'The application that was previously referred has been re-submitted to the ethics committee';
StatusDescpriptions[ApplicationStatus.REJECTED] = 'The application has been rejected by the ethics committee';
StatusDescpriptions[ApplicationStatus.APPROVED] = 'The application has been accepted by the ethics committee';