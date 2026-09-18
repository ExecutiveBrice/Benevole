import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { jwtAuthenticationInterceptor } from './auth.interceptor';

describe('Session JWT', () => {
  let auth: AuthService;
  let http: HttpClient;
  let requests: HttpTestingController;
  let expiration: number;

  function token(tag = 'session'): string {
    return `header.${btoa(JSON.stringify({ sub: tag, exp: expiration })).replace(/=/g, '')}.signature`;
  }

  function login(tag = 'session'): string {
    const jwt = token(tag);
    auth.login('administrateur@example.org', 'mot-de-passe-fictif').subscribe();
    const request = requests.expectOne(`${environment.url}auth/connexion`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ token: jwt, expiresAt: expiration });
    return jwt;
  }

  beforeEach(() => {
    localStorage.removeItem('benevole.jwt');
    localStorage.removeItem('benevole.jwt-expiration');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([jwtAuthenticationInterceptor])), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
    expiration = Math.floor(Date.now() / 1000) + 3600;
  });

  afterEach(() => {
    requests.verify();
    auth.logout();
  });

  it('réutilise la session après reconstruction du service et pour les pages protégées', () => {
    const jwt = login();
    const restoredAuth = new AuthService(http);
    expect(restoredAuth.isAuthenticated()).toBeTrue();
    expect(restoredAuth.authorizationHeader()).toBe(`Bearer ${jwt}`);
    http.get(`${environment.url}administrateurs/moi`).subscribe();
    const request = requests.expectOne(`${environment.url}administrateurs/moi`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${jwt}`);
    request.flush({ global: true });
    requests.expectNone(`${environment.url}auth/connexion`);
  });

  it('supprime la session exactement à son expiration', () => {
    login();
    spyOn(Date, 'now').and.returnValue(expiration * 1000);
    expect(auth.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('benevole.jwt')).toBeNull();
    expect(localStorage.getItem('benevole.jwt-expiration')).toBeNull();
  });

  it('supprime le jeton et son expiration lors de la déconnexion', () => {
    login();
    auth.logout();
    expect(new AuthService(http).isAuthenticated()).toBeFalse();
  });

  it('restaure aussi les jetons précédents sans expiration stockée séparément', () => {
    localStorage.setItem('benevole.jwt', token());
    expect(auth.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('benevole.jwt-expiration')).toBe(String(expiration));
  });

  it('refuse un ancien jeton malformé', () => {
    localStorage.setItem('benevole.jwt', 'pas-un-jwt');
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('déconnecte lorsque le serveur refuse le jeton par un 401', () => {
    login();
    http.get(`${environment.url}administrateurs/moi`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.url}administrateurs/moi`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('conserve la session lorsqu’un accès est interdit par un 403', () => {
    login();
    http.get(`${environment.url}administrateurs`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.url}administrateurs`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it('conserve la session en cas de panne réseau', () => {
    login();
    http.get(`${environment.url}administrateurs/moi`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.url}administrateurs/moi`).error(new ProgressEvent('error'));
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it('ne déconnecte pas sur un 401 provenant d’un autre serveur', () => {
    login();
    http.get('https://example.org/test').subscribe({ error: () => {} });
    const request = requests.expectOne('https://example.org/test');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBeTrue();
  });

  it('ne supprime pas une nouvelle session après un 401 tardif de l’ancienne', () => {
    login('ancienne');
    http.get(`${environment.url}administrateurs/moi`).subscribe({ error: () => {} });
    const oldRequest = requests.expectOne(`${environment.url}administrateurs/moi`);
    const currentJwt = login('nouvelle');
    oldRequest.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.authorizationHeader()).toBe(`Bearer ${currentJwt}`);
  });
});
