import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

/** Scales the event title to the largest size that fits its header. */
@Directive({
  selector: '[appFitHeaderTitle]',
  standalone: true
})
export class FitHeaderTitleDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() appFitHeaderTitle = '';
  @Input() appFitHeaderTitleFont?: string;

  private readonly minimumFontSize = 12;
  private readonly maximumFontSize = 96;
  private frameId?: number;
  private resizeObserver?: ResizeObserver;
  private fontLoadingListener = () => this.scheduleFit();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const title = this.elementRef.nativeElement;
    const container = title.parentElement;

    if (container && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleFit());
      this.resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', this.fontLoadingListener);
    }

    document.fonts?.addEventListener('loadingdone', this.fontLoadingListener);
    document.fonts?.ready.then(() => this.scheduleFit());
    this.scheduleFit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appFitHeaderTitle'] || changes['appFitHeaderTitleFont']) {
      this.scheduleFit();
    }
  }

  ngOnDestroy(): void {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.fontLoadingListener);
    document.fonts?.removeEventListener('loadingdone', this.fontLoadingListener);
  }

  private scheduleFit(): void {
    if (!this.elementRef.nativeElement.isConnected) {
      return;
    }

    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameId = requestAnimationFrame(() => {
      this.frameId = undefined;
      this.fitTitle();
    });
  }

  private fitTitle(): void {
    const title = this.elementRef.nativeElement;
    const container = title.parentElement;
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      return;
    }

    let low = this.minimumFontSize;
    let high = this.maximumFontSize;

    while (high - low > 0.5) {
      const candidate = (low + high) / 2;
      title.style.fontSize = `${candidate}px`;

      if (title.scrollWidth <= container.clientWidth && title.scrollHeight <= container.clientHeight) {
        low = candidate;
      } else {
        high = candidate;
      }
    }

    title.style.fontSize = `${Math.floor(low)}px`;
  }
}
