import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';

import { InfoComponent } from './info.component';
import { ConfigService, FileService } from '../../services';
import { Evenement } from '../../models';

describe('InfoComponent', () => {
  let fixture: ComponentFixture<InfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoComponent],
      providers: [
        { provide: FileService, useValue: {
          get: (_eventId: number, filename: string) => of(filename === 'affiche.jpeg' ? 'image-base64' : '')
        } },
        { provide: ConfigService, useValue: { getParams: () => EMPTY } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
    fixture.componentRef.setInput('evenement', { id: 1 } as Evenement);
    fixture.detectChanges();
  });

  it('affiche le visuel reçu du serveur', () => {
    const image = fixture.nativeElement.querySelector('img[alt="Affiche"]') as HTMLImageElement;

    expect(image.src).toBe('data:image/jpeg;base64,image-base64');
  });
});
