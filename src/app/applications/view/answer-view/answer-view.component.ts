import { Component, Input, OnInit } from '@angular/core';
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
export class AnswerViewComponent implements OnInit {
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

  constructor() { }

  ngOnInit(): void {
    let rendererImpl = Renderers[this.renderer];

    if (!rendererImpl) {
      rendererImpl = Renderers['same'];
    }

    this.answer = rendererImpl.render(this.answer);
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
