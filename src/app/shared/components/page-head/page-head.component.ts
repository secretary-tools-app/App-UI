import { Component, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Cabeçalho de página. Dois modos:
 * - column (padrão): título centralizado, usado nas telas de lista.
 * - row: título à esquerda (ou centralizado quando há botão voltar),
 *   com slot para ações à esquerda/direita.
 * O acento visual (sacramental/batismo) é controlado por `tipo`.
 */
@Component({
  selector: 'app-page-head',
  standalone: true,
  imports: [NzIconModule],
  template: `
    <header class="page-head" [class.page-head--row]="modo() === 'row'">
      @if (modo() === 'row') {
        @if (exibirVoltar()) {
          <button type="button" class="page-head__btn" (click)="voltar.emit()" aria-label="Voltar">
            <span nz-icon nzType="arrow-left"></span>
          </button>
        } @else {
          <ng-content select="[pageHeadLeft]"></ng-content>
        }
      }

      <div class="page-head__title">
        <span class="page-head__eyebrow">
          @if (tipo()) {
            <span class="tipo-dot" [class]="'tipo-dot--' + tipo()"></span>
          }
          {{ eyebrow() }}
        </span>
        <h1>{{ titulo() }}</h1>
      </div>

      <ng-content select="[pageHeadActions]"></ng-content>
    </header>
  `,
  styles: [
    `
      .page-head {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: calc(10px + var(--safe-top)) 8px 10px;
        position: sticky;
        top: 0;
        background: var(--paper);
        z-index: 10;
        border-bottom: 1px solid var(--line);
      }
      .page-head--row {
        flex-direction: row;
        align-items: center;
        gap: 6px;
        padding: calc(10px + var(--safe-top)) 20px 10px;
      }
      .page-head__title {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 0;
      }
      .page-head--row .page-head__title {
        align-items: flex-start;
      }
      .page-head__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--primary);
      }
      .page-head--sacramental .page-head__eyebrow {
        color: var(--accent-sacramental);
      }
      .page-head--batismo .page-head__eyebrow {
        color: var(--accent-batismo);
      }
      .page-head h1 {
        font-size: 17px;
        line-height: 1.3;
        margin: 2px 0 0;
        text-align: center;
      }
      .page-head--row h1 {
        text-align: left;
      }
      .page-head__btn {
        flex: none;
      }
    `,
  ],
})
export class PageHeadComponent {
  titulo = input.required<string>();
  eyebrow = input<string>('');
  modo = input<'column' | 'row'>('column');
  tipo = input<'sacramental' | 'batismo' | null>(null);
  exibirVoltar = input(false);
  voltar = output();
}
