import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConnexionComponent } from './modalConnexion.component';

describe('ModalComponent', () => {
  let component: ModalConnexionComponent;
  let fixture: ComponentFixture<ModalConnexionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConnexionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConnexionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
