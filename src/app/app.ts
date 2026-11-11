import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hub } from 'aws-amplify/utils';

import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  constructor() {
    // Drop the cached user whenever the session changes, including sign-outs
    // that do not go through the logout button (for example an expired session).
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'signedOut') {
        this.authService.clearCache();
      }
    });
    inject(DestroyRef).onDestroy(stop);
  }
}
