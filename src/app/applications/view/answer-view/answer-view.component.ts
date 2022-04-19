import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Answer, ValueType } from '../../models/applications/answer';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { QuestionComponent } from '../../models/components/questioncomponent';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { QuestionChangeEvent, QuestionViewComponent } from '../component/application-view.component';
import { Renderers } from './renderers';

/**
 * This component allows an answer to a question to be viewed
 */
@Component({
  selector: 'app-answer-view',
  templateUrl: './answer-view.component.html',
  styleUrls: ['./answer-view.component.css']
})
export class AnswerViewComponent implements OnChanges {
  /**
   * The answer to render
   */
  @Input() answer: Answer;
  /**
   * The question being answered
   */
  @Input() question: QuestionViewComponent;
  /**
   * The underlying component
   */
  questionComponent: QuestionComponent;
  /**
   * The renderer to use to render the answer
   */
  @Input() renderer: string = 'same';
  /**
   * The container containing the image
   */
  imgContainer: ElementRef;
  /**
   * The img canvas
   */
  @ViewChild('imgCanvas')
  imgCanvas: ElementRef;
  /**
   * The answer parent
   */
  @ViewChild('parent')
  parent: ElementRef;
  /**
   * Width for the canvas
   */
  @Input() canvasWidth: number;
  /**
   * Height for the canvas height
   */
  canvasHeight: number;
  /**
   * Determines if edit is allowed if the answer has been provided by someone else
   */
  editAllowed: boolean = true;
  /**
   * Determines if the question is editable
   */
  editable: boolean = true;
  /**
   * Confirm that you want to edit the already answered question
   */
  confirmEditDisplayed: boolean;
  /**
   * Only notify the autosave notifier once, so use this to record that its been notified
   */
  private autosaveNotified: boolean;
  /**
   * Determines if the answer has been rendered or not
   */
  private rendered: boolean;
  /**
   * Determines if answer placeholder should be displayed
   */
  displayPlaceholder: boolean;

  constructor(private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.question) {
      this.questionComponent = this.question.castComponent();
      this.displayPlaceholder = this.question.context?.viewingUser?.reviewer || this.question?.displayAnswerPlaceholder 
        || (this.question?.parent && this.question.parent?.displayAnswerPlaceholder)
    }

    if (this.answer) {
      this.rendered = !changes.answer;

      if (!this.rendered) {
        let rendererImpl = Renderers[this.renderer];

        if (!rendererImpl) {
          rendererImpl = Renderers['same'];
        }

        this.answer = rendererImpl.render(this.answer);
        this.rendered = true;
      }

      const status = resolveStatus(this.question.application?.status);

      if (this.answer.user && (status == ApplicationStatus.DRAFT || status == ApplicationStatus.REFERRED)) {
        // disable so the user can't change the provided answer
        this.question.setDisabled(true);
        this.editable = false;
        this.editAllowed = this.question?.context?.allowAnswerEdit();

        if (!this.autosaveNotified) {
          this.question.autosaveContext?.notifyQuestionChange(
            new QuestionChangeEvent(this.question.component.componentId, this.question, false)); // add to the list of autosaved questions
          this.autosaveNotified = true;
        }
      }
    }
  }

  @ViewChild('imgContainer')
  set imageContainer(imgContainer: ElementRef) {
    this.imgContainer = imgContainer;
    
    if (this.imgContainer) {
      for (let i = 0; i < 5; i++)
        this.resize(); // first few resizes doesn't get it to its normal position, so use this "hack" to attempt to position it correctly after 5 goes
    }
  }

  displayLabel() {
    return 'label' in this.questionComponent;
  }

  private scaleAndDraw(image: any) {
    const canvas = this.imgCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const wrh = image.width / image.height;
    let newWidth = canvas.width;

    let newHeight = newWidth / wrh;
    
    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = newHeight * wrh;
    }

    let xOffset = newWidth < canvas.width ? ((canvas.width - newWidth) / 2) : 0;
    let yOffset = newHeight < canvas.height ? ((canvas.height - newHeight) / 2) : 0;

    ctx.drawImage(image, xOffset, yOffset, newWidth, newHeight);
  }

  private getMaxWidth() {
    if (this.question?.parent && typeof(this.question?.parent?.maxWidth) === 'function') {
      return this.question.parent.maxWidth();
    }
  }

  resize() {
    if (this.imgContainer) {
      let width = this.imgContainer.nativeElement.offsetWidth;
      let height = this.imgContainer.nativeElement.offsetHeight;
      height = Math.min(height, 50);

      let max = this.getMaxWidth();

      if (this.parent) {
        const parentOffset = this.parent.nativeElement.offsetWidth;

        if (max != -1 && width > max) {
          width = max;
        } else if (width > parentOffset) {
          width = parentOffset;
        }
      }

      this.canvasWidth = width;
      this.canvasHeight = height;
      this.imgCanvas.nativeElement.width = this.canvasWidth;
      this.imgCanvas.nativeElement.height = this.canvasHeight;

      this.drawImage();
    }
  }

  drawImage() {
    if (this.answer.valueType == ValueType.IMAGE && this.imgCanvas) {
      const image = new Image();
      image.onload = () => this.scaleAndDraw(image);
      image.src = this.answer.value;
    }
  }

  splitAnswerOptions(): string[] {
    // if the answer is of ValueType option, it will be displayed here
    if (this.answer.valueType == ValueType.OPTIONS) {
      return this.answer.value.split(',').map(option => (option.includes('=')) ? option.split('=')[1]:option);
    } else {
      return [];
    }
  }

  isValueType(type: string): boolean {
    return this.answer?.valueType == ValueType[type];
  }

  navigateUser(username: string) {
    this.router.navigate(['profile'], {
      queryParams: {
        username: username
      }
    });
  }

  allowEdit(confirmed?: boolean) {
    if (confirmed) {
      this.question.setDisabled(false);
      this.editAllowed = true;
      this.editable = true;
      this.confirmEditDisplayed = false;
    } else {
      this.confirmEditDisplayed = !this.confirmEditDisplayed;
      this.editable = false;
    }
  }
}
