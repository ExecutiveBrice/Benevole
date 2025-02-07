import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAccessGestionComponent } from './modalAccessGestion.component';

describe('ModalComponent', () => {
  let component: ModalAccessGestionComponent;
  let fixture: ComponentFixture<ModalAccessGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAccessGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAccessGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
