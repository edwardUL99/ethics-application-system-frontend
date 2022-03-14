import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';

/**
 * This directive adds the following class labels to an element:
 * d-flex flex-column align-items-center justify-content-center app-height
 */
@Directive({
  selector: '[appCenterBox]'
})
export class CenterBoxDirective implements OnInit, OnChanges {
  @Input() appCenterBox: string;
  @Input() toggle: boolean;

  constructor(private el: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    const element = this.el.nativeElement;
    const classes = ['d-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'app-height'];

    for (let cl of classes) {
      if (this.toggle == undefined || this.toggle) {
        this.renderer.addClass(element, cl);
      } else {
        this.renderer.removeClass(element, cl);
      }
    } 
  }

  ngOnChanges(): void {
    this.ngOnInit();
  }
}
