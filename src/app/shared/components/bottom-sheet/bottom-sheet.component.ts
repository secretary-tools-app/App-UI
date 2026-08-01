import { Component, HostListener, input, output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Bottom sheet padrão da app: overlay + painel deslizante com
 * alça, título (e subtítulo opcional), corpo e rodapé de ações.
 */
@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [NzIconModule],
  template: `
    <div class="sheet-overlay" (click)="fechar.emit()"></div>
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet__handle"></div>

      <div class="sheet__header">
        <div class="sheet__titles">
          <h3 class="sheet__title">{{ titulo() }}</h3>
          @if (subtitulo()) {
            <p class="sheet__subtitle">{{ subtitulo() }}</p>
          }
        </div>
        <ng-content select="[sheetHeaderActions]"></ng-content>
      </div>

      <div class="sheet__body">
        <ng-content></ng-content>
      </div>

      @if (mostrarAcoes()) {
        <div class="sheet__actions">
          @if (mostrarCancelar()) {
            <button type="button" class="sheet__cancel" (click)="fechar.emit()">
              <span nz-icon nzType="close"></span>
              {{ rotuloCancelar() }}
            </button>
          }
          <button type="button" class="sheet__submit" [disabled]="salvando() || desabilitado()" (click)="salvar.emit()">
            <span nz-icon nzType="check"></span>
            {{ rotuloSalvar() }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .sheet-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        z-index: 200;
        animation: sheetFadeIn 0.15s ease;
      }

      .sheet {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: var(--frame-max, 560px);
        max-height: 85vh;
        overflow-y: auto;
        background: var(--paper-raised);
        border-radius: 16px 16px 0 0;
        padding: 12px 20px calc(20px + var(--safe-bottom));
        z-index: 201;
        animation: sheetSlideUp 0.2s ease;
      }

      .sheet__handle {
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background: var(--line);
        margin: 0 auto 14px;
      }

      .sheet__header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }
      .sheet__titles {
        flex: 1;
        min-width: 0;
      }
      .sheet__title {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 600;
        color: var(--ink);
        margin: 0;
      }
      .sheet__subtitle {
        margin: 2px 0 0;
        font-size: 12.5px;
        color: var(--ink-soft);
      }

      .sheet__body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sheet__actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
      }

      .sheet__submit {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 13px;
        border: none;
        border-radius: var(--radius);
        background: var(--primary);
        color: #fff;
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.12s;
        -webkit-tap-highlight-color: transparent;
      }

      .sheet__submit:active { opacity: 0.85; }
      .sheet__submit:disabled { opacity: 0.45; cursor: not-allowed; }
      .sheet__submit .anticon { font-size: 17px; }

      .sheet__cancel {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 13px;
        border: 1.5px solid var(--line);
        border-radius: var(--radius);
        background: var(--paper-raised);
        color: var(--ink);
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.12s;
        -webkit-tap-highlight-color: transparent;
      }

      .sheet__cancel:active { opacity: 0.7; }
      .sheet__cancel .anticon { font-size: 17px; }

      @keyframes sheetFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes sheetSlideUp {
        from { transform: translateX(-50%) translateY(100%); }
        to { transform: translateX(-50%) translateY(0); }
      }
    `,
  ],
})
export class BottomSheetComponent {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  rotuloSalvar = input<string>('Salvar');
  rotuloCancelar = input<string>('Cancelar');
  salvando = input(false);
  desabilitado = input(false);
  mostrarAcoes = input(true);
  mostrarCancelar = input(false);
  salvar = output();
  fechar = output();

  @HostListener('document:keydown.escape')
  fecharPorEscape(): void {
    this.fechar.emit();
  }
}
