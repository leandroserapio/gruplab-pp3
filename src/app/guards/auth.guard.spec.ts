import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';

import { AuthService } from '../services/auth';
import { authGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  let authenticated: boolean;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/mis-aulas' } as RouterStateSnapshot;

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: async () => authenticated } },
      ],
    });
  });

  const run = (guard: CanActivateFn) =>
    TestBed.runInInjectionContext(() => guard(route, state));

  it('authGuard allows authenticated users', async () => {
    authenticated = true;
    expect(await run(authGuard)).toBe(true);
  });

  it('authGuard redirects guests to /login with returnUrl', async () => {
    const result = await run(authGuard);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as never)).toBe('/login?returnUrl=%2Fmis-aulas');
  });

  it('guestGuard allows guests', async () => {
    expect(await run(guestGuard)).toBe(true);
  });

  it('guestGuard redirects authenticated users to /mis-aulas', async () => {
    authenticated = true;
    const result = await run(guestGuard);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as never)).toBe('/mis-aulas');
  });
});
