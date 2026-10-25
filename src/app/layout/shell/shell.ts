import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header
      style="padding: 1rem; background: #222; color: white; display: flex; justify-content: space-between; align-items: center;"
    >
      <h2 style="margin: 0;">GrupLab</h2>
      <button
        (click)="logout()"
        style="padding: 0.5rem 1rem; cursor: pointer; border: none; border-radius: 4px;"
      >
        Cerrar sesión
      </button>
    </header>
    <router-outlet />
  `,
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
