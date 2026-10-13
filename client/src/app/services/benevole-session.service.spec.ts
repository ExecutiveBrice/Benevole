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

  it('restores the volunteer after reopening the application with a new session', () => {
    service.saveEmail('alice@example.test');

    expect(localStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
    sessionStorage.removeItem('benevoleEmail');
    TestBed.resetTestingModule();
    const reopenedService = TestBed.inject(BenevoleSessionService);
    expect(reopenedService.getEmail()).toBe('alice@example.test');
    expect(localStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
  });

  it('migrates the former session storage value to persistent storage', () => {
    sessionStorage.setItem('benevoleEmail', '"alice@example.test"');

    expect(service.getEmail()).toBe('alice@example.test');
    expect(localStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
    expect(sessionStorage.getItem('benevoleEmail')).toBeNull();
  });

  it('uses the persistent identity when an older tab still has a session value', () => {
    localStorage.setItem('benevoleEmail', '"alice@example.test"');
    sessionStorage.setItem('benevoleEmail', '"bob@example.test"');

    expect(service.getEmail()).toBe('alice@example.test');
  });

  it('removes both stored identities on explicit logout', () => {
    service.saveEmail('alice@example.test');
    sessionStorage.setItem('benevoleEmail', '"alice@example.test"');

    service.clear();

    expect(localStorage.getItem('benevoleEmail')).toBeNull();
    expect(sessionStorage.getItem('benevoleEmail')).toBeNull();
    expect(service.getEmail()).toBeNull();
  });

  it('recovers the session identity when the persistent value is malformed', () => {
    localStorage.setItem('benevoleEmail', 'invalid-json');
    sessionStorage.setItem('benevoleEmail', '"alice@example.test"');

    expect(service.getEmail()).toBe('alice@example.test');
    expect(localStorage.getItem('benevoleEmail')).toBe('"alice@example.test"');
  });
});
