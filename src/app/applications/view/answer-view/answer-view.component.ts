import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
export class AnswerViewComponent implements OnInit, AfterViewInit {
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
  @ViewChild('imgContainer')
  imgContainer: ElementRef;
  /**
   * The img canvas
   */
  @ViewChild('imgCanvas')
  imgCanvas: ElementRef;
  /**
   * Determines if edit is allowed if the answer has been provided by someone else
   */
  editAllowed: boolean = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    let rendererImpl = Renderers[this.renderer];

    if (!rendererImpl) {
      rendererImpl = Renderers['same'];
    }

    this.answer = rendererImpl.render(this.answer);
    this.questionComponent = this.question.castComponent();

    if (this.answer.user && resolveStatus(this.question.application?.status) == ApplicationStatus.DRAFT) {
      // disable so the user can't change the provided answer
      this.question.setDisabled(true);
      this.editAllowed = false;
      this.question.autosaveContext?.notifyQuestionChange(
        new QuestionChangeEvent(this.question.component.componentId, this.question, true)); // add to the list of autosaved questions
    }
  }

  ngAfterViewInit(): void {
    if (this.answer.valueType == ValueType.IMAGE && this.imgCanvas) {
      this.resize();

      window.onresize = () => {
        this.resize();   
      }
    }
  }

  displayLabel() {
    return 'label' in this.questionComponent;
  }

  private scaleAndDraw(image: any) {
    const canvas = this.imgCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
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

  resize() {
    this.imgCanvas.nativeElement.width = this.imgContainer.nativeElement.offsetWidth
    this.imgCanvas.nativeElement.height = 100;   
    this.drawImage();
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

  allowEdit() {
    if (confirm('Confirm that you want to change the provided answer?')) {
      this.question.setDisabled(false);
      this.editAllowed = true;
    }
  }
}
