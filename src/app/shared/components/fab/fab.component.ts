import { Component, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Botão de ação flutuante, posicionado acima da barra de navegação.
 */
@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [NzIconModule],
  template: `
    <button type="button" class="fab" (click)="clicar.emit()" [attr.aria-label]="ariaLabel()">
      <span nz-icon [nzType]="icone()"></span>
    </button>
  `,
  styles: [
    `
      .fab {
        position: fixed;
        right: max(calc(50% - var(--frame-max, 560px) / 2 + 24px), 24px);
        bottom: calc(24px + var(--bottom-nav-h) + var(--safe-bottom));
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: var(--primary);
        color: #fff;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(91, 33, 182, 0.35);
        cursor: pointer;
        z-index: 50;
        transition: background 0.15s, transform 0.1s;
        -webkit-tap-highlight-color: transparent;
        animation: fabIn 0.3s ease backwards;

        &:active {
          transform: scale(0.93);
          background: var(--primary-hover);
        }
      }

      @keyframes fabIn {
        from { opacity: 0; transform: scale(0.7); }
        to { opacity: 1; transform: scale(1); }
      }
    `,
  ],
})
export class FabComponent {
  icone = input<string>('plus');
  ariaLabel = input<string>('Criar');
  clicar = output();
}
