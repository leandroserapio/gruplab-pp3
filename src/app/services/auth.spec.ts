import { TestBed } from '@angular/core/testing';
import { fetchUserAttributes, getCurrentUser, signOut } from 'aws-amplify/auth';
import { vi } from 'vitest';

import { AuthService } from './auth';

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated returns true when there is a current user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 'u1' } as never);
    expect(await service.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated returns false when getCurrentUser throws', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('not signed in'));
    expect(await service.isAuthenticated()).toBe(false);
  });

  it('logout clears the cached user', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 'u1' } as never);
    vi.mocked(fetchUserAttributes).mockResolvedValue({ email: 'a@b.com' } as never);
    vi.mocked(signOut).mockResolvedValue(undefined as never);

    expect(await service.getUserId()).toBe('u1');
    expect(await service.getEmail()).toBe('a@b.com');

    await service.logout();
    expect(signOut).toHaveBeenCalled();

    vi.mocked(getCurrentUser).mockRejectedValue(new Error('signed out'));
    await expect(service.getUserId()).rejects.toThrow();
    expect(await service.getEmail()).toBeNull();
  });
});
