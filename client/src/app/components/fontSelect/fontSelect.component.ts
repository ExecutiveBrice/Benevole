import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-font-select',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FontSelectComponent),
    multi: true
  }],
  templateUrl: './fontSelect.component.html',
  styleUrl: './fontSelect.component.scss'
})
export class FontSelectComponent implements ControlValueAccessor {
  @Input({ required: true }) fonts: string[] = [];
  @Input() id = '';
  @Input() label = 'Police';
  @Input() set selectedFont(font: string | null | undefined) {
    this.value = font ?? '';
  }
  @Output() fontChange = new EventEmitter<string>();

  value = '';
  isOpen = false;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  toggle(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  choose(font: string): void {
    this.value = font;
    this.isOpen = false;
    this.onChange(font);
    this.onTouched();
    this.fontChange.emit(font);
  }

  @HostListener('focusout')
  closeWhenFocusLeaves(): void {
    queueMicrotask(() => {
      if (!this.elementRef.nativeElement.contains(document.activeElement)) {
        this.isOpen = false;
        this.onTouched();
      }
    });
  }

  @HostListener('keydown.escape')
  closeOnEscape(): void {
    this.isOpen = false;
  }
}
