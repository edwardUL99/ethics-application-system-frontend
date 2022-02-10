import { Component, forwardRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor }  from '@angular/forms';
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
export class SignatureFieldComponent implements ControlValueAccessor, AfterViewInit {
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
    @Input() options: Object = {};
    /**
     * An event emitted when the signature is entered
     */
    @Output() signatureEntered: EventEmitter<string> = new EventEmitter<string>();
    /**
     * The function to register changes
     */
    propagateChange: Function = null;
    
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

    drawComplete() {
        console.log('complete')
        this.signature = this.signaturePad.toDataURL('image/jpeg', 0.5);
        this.signatureEntered.emit(this.signature);
    }

    clear() {
        this.signaturePad.clear();
        this.signature = '';
    }
}