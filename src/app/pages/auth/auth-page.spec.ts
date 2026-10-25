import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Hub } from 'aws-amplify/utils';
import { vi } from 'vitest';

import { AuthPage } from './auth-page';

vi.mock('aws-amplify/utils', () => ({ Hub: { listen: vi.fn() } }));

describe('AuthPage', () => {
  let handler: (data: { payload: { event: string } }) => void;
  let stop: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  function setup(queryParams: Record<string, string> = {}, data: Record<string, unknown> = {}) {
    stop = vi.fn();
    vi.mocked(Hub.listen).mockImplementation(((_channel: string, cb: typeof handler) => {
      handler = cb;
      return stop;
    }) as never);
    navigateByUrl = vi.fn();

    TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [
        { provide: Router, useValue: { navigateByUrl } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data,
              queryParamMap: { get: (key: string) => queryParams[key] ?? null },
            },
          },
        },
      ],
    }).overrideComponent(AuthPage, { set: { imports: [], template: '' } });

    return TestBed.createComponent(AuthPage);
  }

  it('defaults to signIn', () => {
    expect(setup().componentInstance.initialState).toBe('signIn');
  });

  it('uses signUp from route data', () => {
    expect(setup({}, { initialState: 'signUp' }).componentInstance.initialState).toBe('signUp');
  });

  it('navigates to a safe returnUrl on signedIn', () => {
    setup({ returnUrl: '/aula/3' });
    handler({ payload: { event: 'signedIn' } });
    expect(navigateByUrl).toHaveBeenCalledWith('/aula/3');
  });

  it.each(['//evil.com', 'https://evil.com', undefined])(
    'falls back to /mis-aulas for unsafe returnUrl %s',
    (returnUrl) => {
      setup(returnUrl ? { returnUrl } : {});
      handler({ payload: { event: 'signedIn' } });
      expect(navigateByUrl).toHaveBeenCalledWith('/mis-aulas');
    },
  );

  it('ignores other auth events', () => {
    setup();
    handler({ payload: { event: 'signedOut' } });
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('unsubscribes from Hub on destroy', () => {
    const fixture = setup();
    fixture.destroy();
    expect(stop).toHaveBeenCalled();
  });
});
