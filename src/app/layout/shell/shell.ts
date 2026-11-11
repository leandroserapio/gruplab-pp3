import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand" (click)="irInicio()" title="Ir a Mis aulas">
          <div class="brand-logo">GL</div>
          <div class="brand-text">
            <span class="brand-name">GrupLab</span>
            <span class="brand-tag">Espacio colaborativo</span>
          </div>
        </div>

        <div class="topbar-actions">
          <button class="btn-nav-link" (click)="irInicio()">📚 Mis aulas</button>
          @if (userEmail()) {
            <span class="user-pill">
              <span class="user-dot"></span>
              {{ userEmail() }}
            </span>
          }
          <button class="btn-logout" (click)="logout()">Cerrar sesión</button>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: #f8fafc;
      }

      .topbar-inner {
        max-width: 1360px;
        margin: 0 auto;
        padding: 0.75rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        user-select: none;
      }

      .brand-logo {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
        color: #ffffff;
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }

      .brand-name {
        font-family: var(--font-display);
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #ffffff;
      }

      .brand-tag {
        font-size: 0.7rem;
        color: #94a3b8;
        font-weight: 500;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .btn-nav-link {
        background: rgba(255, 255, 255, 0.07);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 0.42rem 0.85rem;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
      }

      .btn-nav-link:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.22);
      }

      .user-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 0.78rem;
        color: #cbd5e1;
        font-weight: 500;
      }

      .user-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }

      .btn-logout {
        background: rgba(239, 68, 68, 0.14);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
        padding: 0.42rem 0.9rem;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
      }

      .btn-logout:hover {
        background: #ef4444;
        color: #ffffff;
        border-color: #ef4444;
      }

      .app-main {
        min-height: calc(100vh - 64px);
      }
    `,
  ],
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userEmail = signal<string | null>(null);

  constructor() {
    this.authService
      .getEmail()
      .then((email) => this.userEmail.set(email))
      .catch(() => this.userEmail.set(null));
  }

  irInicio() {
    void this.router.navigate(['/mis-aulas']);
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
