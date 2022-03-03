import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * This directive adds the following class labels to an element:
 * d-flex flex-column align-items-center justify-content-center app-height
 */
@Directive({
  selector: '[appCenterBox]'
})
export class CenterBoxDirective implements OnInit {
  @Input() appCenterBox: string;

  constructor(private el: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    const element = this.el.nativeElement;
    const classes = ['d-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'app-height'];

    for (let cl of classes) {
      this.renderer.addClass(element, cl);
    }
  }
}
