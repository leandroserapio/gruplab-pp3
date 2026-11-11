import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth';
import { Shell } from './shell';

describe('Shell', () => {
  async function setup(email: string | null = 'ana@example.com') {
    const logout = vi.fn().mockResolvedValue(undefined);
    const getEmail = vi.fn().mockResolvedValue(email);
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([]), { provide: AuthService, useValue: { logout, getEmail } }],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, logout, navigate };
  }

  it('logs out and navigates to /login when clicking the logout button', async () => {
    const { fixture, logout, navigate } = await setup();

    fixture.nativeElement.querySelector('.btn-logout').click();
    await fixture.whenStable();

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('shows the signed-in user email', async () => {
    const { fixture } = await setup('ana@example.com');

    expect(fixture.nativeElement.querySelector('.user-pill').textContent).toContain(
      'ana@example.com',
    );
  });

  it('navigates to /mis-aulas when clicking the nav button', async () => {
    const { fixture, navigate } = await setup();

    fixture.nativeElement.querySelector('.btn-nav-link').click();

    expect(navigate).toHaveBeenCalledWith(['/mis-aulas']);
  });
});
