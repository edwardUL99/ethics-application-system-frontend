import { Component, forwardRef, ViewChild, AfterViewInit, Input, Output, EventEmitter, OnChanges, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SignaturePadComponent } from '@almothafar/angular-signature-pad';

@Component({
  selector: 'signature-field',
  templateUrl: './signature-field.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignatureFieldComponent),
      multi: true
    }
  ]
})
export class SignatureFieldComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  /**
   * The signature pad component
   */
  @ViewChild(SignaturePadComponent)
  signaturePad: SignaturePadComponent;
  /**
   * The recorded signature
   */
  private _signature: any;
  /**
   * The input options
   */
  @Input() options = {};
  /**
   * Determines if the component is disabled
   */
  @Input('inputDisabled') disabled: boolean;
  /**
   * An event emitted when the signature is entered
   */
  @Output() signatureEntered: EventEmitter<string> = new EventEmitter<string>();
  /**
   * An event for when the signature drawing started
   */
  @Output() drawStarted: EventEmitter<any> = new EventEmitter<any>();
  /**
   * The function to register changes
   */
  propagateChange: Function = null;
  /**
   * The parent DIV
   */
  @ViewChild('parent')
  parent: ElementRef;
  /**
   * Notifies the parent of width changes
   */
  @Output() widthChanges: EventEmitter<number> = new EventEmitter<number>();

  ngOnChanges() {
    if (this.signaturePad) {
      if (this.disabled) {
        this.signaturePad.off();
      } else {
        this.signaturePad.on();
      }
    }
  }

  get signature() {
    return this._signature;
  }

  set signature(value: any) {
    this._signature = value;
    this.propagateChange(this.signature);
  }

  writeValue(obj: any): void {
    if (obj) {
      this._signature = obj;
      this.signaturePad.fromDataURL(this.signature);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn
  }

  registerOnTouched(fn: any): void {
    // no-op
  }

  ngAfterViewInit() {
    //this.signaturePad.clear();
  }

  drawStart(event) {
    this.drawStarted.emit(event);
  }

  drawComplete() {
    this.signature = this.signaturePad.toDataURL('image/png', 1);
    this.signatureEntered.emit(this.signature);
  }

  clear() {
    this.signaturePad.clear();
    this.signature = '';
  }

  private calculateParentWidth(width: number, maxWidth: number) {
    const offsetWidth = this.parent.nativeElement.offsetWidth;
    let fillWidth: number; 

    if (offsetWidth > width && (!maxWidth || offsetWidth < maxWidth)) {
      fillWidth = offsetWidth;
    } else if (offsetWidth >= maxWidth) {
      this.widthChanges.emit(maxWidth);
    } else {
      this.widthChanges.emit(fillWidth);
    }

    const parentWidth = this.parent.nativeElement.parentElement.offsetWidth;

    if (parentWidth < fillWidth) {
      fillWidth = parentWidth;
      this.widthChanges.emit(fillWidth);
    }

    return (fillWidth) ? fillWidth : width;
  }

  resize(width: number, height: number, maxWidth?: number) {
    const fillWidth = (this.parent) ? this.calculateParentWidth(width, maxWidth) : width;

    this.signaturePad.set('canvasWidth', fillWidth);
    this.signaturePad.set('canvasHeight', height);
    this.signaturePad.set('dotSize', 1);
    this.signaturePad.clear();
    
    if (this.signature) {
      this.signaturePad.redrawCanvas();
      this.signaturePad.fromDataURL(this.signature);
    }
  }
}