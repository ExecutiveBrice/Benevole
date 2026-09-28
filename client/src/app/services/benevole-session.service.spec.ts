import { TestBed } from '@angular/core/testing';
import { BenevoleSessionService } from './benevole-session.service';

describe('BenevoleSessionService', () => {
  let service: BenevoleSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenevoleSessionService);
    sessionStorage.removeItem('benevoleEmail');
    localStorage.removeItem('benevoleEmail');
  });

  afterEach(() => {
    sessionStorage.removeItem('benevoleEmail');
    localStorage.removeItem('benevoleEmail');
  });

  it('keeps the identified volunteer in session storage', () => {
    service.saveEmail('alice@example.test');

    expect(sessionStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
    expect(service.getEmail()).toBe('alice@example.test');
  });

  it('migrates the former local storage value to session storage', () => {
    localStorage.setItem('benevoleEmail', '"alice@example.test"');

    expect(service.getEmail()).toBe('alice@example.test');
    expect(sessionStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
    expect(localStorage.getItem('benevoleEmail')).toBeNull();
  });
});
