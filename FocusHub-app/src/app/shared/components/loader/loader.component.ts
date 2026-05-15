import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-overlay" role="status" aria-live="polite" aria-busy="true">
      <div class="loader-card">
        <div class="spinner" aria-hidden="true"></div>
        <div class="loader-text">{{ label }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .loader-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        background: var(--shadow-color);
        backdrop-filter: blur(2px);
      }

      .loader-card {
        background: var(--primary-bg);
        color: var(--text-color);
        border-radius: 14px;
        padding: 18px 22px;
        box-shadow: 0 8px 24px var(--shadow-color);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
      }

      .spinner {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 3px solid var(--secondary-bg);
        border-top-color: var(--accent-color);
        animation: spin 0.9s linear infinite;
      }

      .loader-text {
        font-weight: 600;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderComponent {
  @Input() label: string = 'Cargando...';
}
