import { Directive, ElementRef, Input, Renderer2, OnChanges } from '@angular/core';

/**
 * This is a directive that allows the user to inject a tooltip into the element
 */
@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnChanges {
  /**
   * The tooltip text
   */
  @Input('appTooltip') tooltipText: string;
  /**
   * The tooltip position
   */
  @Input() tooltipPosition: string = 'top';

  constructor(private el: ElementRef,
    private renderer: Renderer2) {}

  ngOnChanges(): void {
    const element = this.el.nativeElement as HTMLElement;
    this.renderer.setAttribute(element, 'data-bs-toggle', 'tooltip');
    this.renderer.setAttribute(element, 'title', this.tooltipText);
    this.renderer.setAttribute(element, 'data-bs-placement', this.tooltipPosition);
  }
}
