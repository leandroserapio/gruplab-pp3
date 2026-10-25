import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Hub } from 'aws-amplify/utils';

type AuthInitialState = 'signIn' | 'signUp';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [AmplifyAuthenticatorModule],
  template: `
    <div style="display: flex; justify-content: center; padding: 2rem 1rem;">
      <amplify-authenticator [initialState]="initialState">
        <ng-template amplifySlot="authenticated"></ng-template>
      </amplify-authenticator>
    </div>
  `,
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly initialState: AuthInitialState =
    this.route.snapshot.data['initialState'] === 'signUp' ? 'signUp' : 'signIn';

  constructor() {
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        void this.router.navigateByUrl(this.safeReturnUrl());
      }
    });
    inject(DestroyRef).onDestroy(stop);
  }

  private safeReturnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/mis-aulas';
  }
}
