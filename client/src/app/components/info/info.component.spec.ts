import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InfoComponent } from './info.component';
import { FileService } from '../../services';
import { Evenement } from '../../models';

describe('InfoComponent', () => {
  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoComponent],
      providers: [{
        provide: FileService,
        useValue: { get: () => of('image-base64') }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
    component = fixture.componentInstance;
    component.evenement = { id: 1 } as Evenement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche le visuel reçu du serveur', () => {
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.src).toBe('data:image/jpeg;base64,image-base64');
  });
});
