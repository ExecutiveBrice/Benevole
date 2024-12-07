import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddBenComponent } from './modalAddBen.component';

describe('ModalAddBenComponent', () => {
  let component: ModalAddBenComponent;
  let fixture: ComponentFixture<ModalAddBenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAddBenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAddBenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
