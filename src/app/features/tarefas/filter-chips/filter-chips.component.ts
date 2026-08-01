import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterChipTipo {
  valor: string;
  rotulo: string;
  acento?: 'sacramental' | 'batismo';
}

const PERSON_COLORS = [
  'var(--task-purple)',
  'var(--task-teal)',
  'var(--task-terracotta)',
  'var(--task-rose)',
  'var(--task-amber)',
];

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chips-scroll">
      @if (tipos().length > 0) {
        @for (tipo of tipos(); track tipo.valor) {
          <button
            type="button"
            class="chip"
            [class.chip--active]="filtroAtivo() === tipo.valor"
            [class.chip--sacramental]="tipo.acento === 'sacramental'"
            [class.chip--batismo]="tipo.acento === 'batismo'"
            (click)="selecionar.emit(tipo.valor)"
          >
            {{ tipo.rotulo }}
          </button>
        }
      } @else {
        <button
          type="button"
          class="chip"
          [class.chip--active]="filtroAtivo() === 'Todos'"
          (click)="selecionar.emit('Todos')"
        >
          Todos
        </button>
        @for (pessoa of pessoas(); track pessoa; let i = $index) {
          <button
            type="button"
            class="chip"
            [class.chip--active]="filtroAtivo() === pessoa"
            (click)="selecionar.emit(pessoa)"
          >
            <span class="chip__dot" [style.background]="corPorIndice(i)"></span>
            {{ pessoa }}
          </button>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .chips-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 14px 16px 12px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .chips-scroll::-webkit-scrollbar { display: none; }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid var(--line);
      background: var(--paper-raised);
      font-family: var(--font-body);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-soft);
      cursor: pointer;
      white-space: nowrap;
      min-height: 40px;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
    }

    .chip--active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .chip--sacramental.chip--active {
      background: var(--accent-sacramental);
      border-color: var(--accent-sacramental);
    }

    .chip--batismo.chip--active {
      background: var(--accent-batismo);
      border-color: var(--accent-batismo);
    }

    .chip--active .chip__dot {
      background: #fff !important;
    }

    .chip__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `],
})
export class FilterChipsComponent {
  pessoas = input<string[]>([]);
  tipos = input<FilterChipTipo[]>([]);
  filtroAtivo = input.required<string>();
  selecionar = output<string>();

  corPorIndice(i: number): string {
    return PERSON_COLORS[i % PERSON_COLORS.length];
  }
}
