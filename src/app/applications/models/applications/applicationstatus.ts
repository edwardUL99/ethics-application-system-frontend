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