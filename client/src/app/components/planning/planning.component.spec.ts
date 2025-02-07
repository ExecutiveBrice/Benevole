import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningComponent } from './planning.component';

describe('ModalComponent', () => {
  let component: PlanningComponent;
  let fixture: ComponentFixture<PlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
