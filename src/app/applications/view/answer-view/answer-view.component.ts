import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Answer, ValueType } from '../../models/applications/answer';
import { QuestionComponent } from '../../models/components/questioncomponent';
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
  @Input() question: QuestionComponent;
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

  constructor() { }

  ngOnInit(): void {
    let rendererImpl = Renderers[this.renderer];

    if (!rendererImpl) {
      rendererImpl = Renderers['same'];
    }

    this.answer = rendererImpl.render(this.answer);
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
    return 'label' in this.question;
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
}
