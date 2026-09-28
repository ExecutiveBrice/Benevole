import { TestBed } from '@angular/core/testing';
import { DernierEvenementService } from './dernier-evenement.service';

describe('DernierEvenementService', () => {
  let service: DernierEvenementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DernierEvenementService);
    localStorage.removeItem('benevole.last-viewed-event-id');
  });

  afterEach(() => localStorage.removeItem('benevole.last-viewed-event-id'));

  it('stores and returns the most recently viewed event id', () => {
    service.save(42);

    expect(service.get()).toBe(42);
  });

  it('does not return an invalid stored event id', () => {
    localStorage.setItem('benevole.last-viewed-event-id', 'not-an-event-id');

    expect(service.get()).toBeNull();
  });
});
