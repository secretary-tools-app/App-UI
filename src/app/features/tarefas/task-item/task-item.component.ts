import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TarefaResponse } from '../../../core/models';

const PERSON_COLORS: Record<string, string> = {};
const PALETTE = [
  { fg: 'var(--task-purple)', soft: 'var(--task-purple-50)' },
  { fg: 'var(--task-teal)', soft: 'var(--task-teal-50)' },
  { fg: 'var(--task-terracotta)', soft: 'var(--task-terracotta-50)' },
  { fg: 'var(--task-rose)', soft: 'var(--task-rose-50)' },
  { fg: 'var(--task-amber)', soft: 'var(--task-amber-50)' },
];

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, NzIconModule, DatePipe],
  template: `
    <div class="task-row" [class.task-row--done]="tarefa().concluida">
      <button
        class="task-check"
        [class.task-check--done]="tarefa().concluida"
        (click)="toggle.emit(tarefa())"
      >
        @if (tarefa().concluida) {
          <span nz-icon nzType="check-circle" nzTheme="fill" class="task-check__icon task-check__icon--done"></span>
        } @else {
          <span class="task-check__circle"></span>
        }
      </button>

      <div class="task-body">
        <span class="task-titulo" [class.task-titulo--done]="tarefa().concluida">
          {{ tarefa().titulo }}
        </span>
        <div class="task-meta">
          @if (tarefa().responsavel) {
            <span
              class="task-tag"
              [style.background]="corPessoa(tarefa().responsavel!).soft"
              [style.color]="corPessoa(tarefa().responsavel!).fg"
            >
              {{ tarefa().responsavel }}
            </span>
          }
          @if (tarefa().dataPrevista) {
            <span class="task-date">
              <span nz-icon nzType="calendar" nzTheme="outline" class="task-date__icon"></span>
              {{ tarefa().dataPrevista | date:'dd/MM' }}
            </span>
          }
          @if (tarefa().concluida && tarefa().concluidaEm) {
            <span class="task-done-meta">
              · concluído {{ formatarConclusao(tarefa().concluidaEm!) }}
            </span>
          }
        </div>
      </div>

      @if (!tarefa().concluida) {
        <div class="task-kebab">
          <button class="kebab-btn" (click)="toggleMenu()">
            <span nz-icon nzType="more" nzTheme="outline"></span>
          </button>
          @if (menuAberto()) {
            <div class="kebab-menu" (click)="$event.stopPropagation()">
              <button class="kebab-menu__item" (click)="editar.emit(tarefa()); menuAberto.set(false)">
                <span nz-icon nzType="edit" nzTheme="outline"></span>
                Editar
              </button>
              <button class="kebab-menu__item kebab-menu__item--danger" (click)="confirmarExclusao()">
                <span nz-icon nzType="delete" nzTheme="outline"></span>
                Excluir
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .task-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      min-height: 44px;
      position: relative;
    }

    .task-row--done { opacity: 0.6; }

    .task-check {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border: none;
      background: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1px;
      -webkit-tap-highlight-color: transparent;
    }

    .task-check__circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--line);
      background: var(--paper-raised);
      display: block;
      transition: border-color 0.15s;
    }

    .task-check:active .task-check__circle {
      border-color: var(--primary);
    }

    .task-check__icon {
      font-size: 22px;
    }

    .task-check__icon--done {
      color: var(--success);
    }

    .task-body {
      flex: 1;
      min-width: 0;
    }

    .task-titulo {
      font-family: var(--font-body);
      font-size: 14.5px;
      font-weight: 500;
      color: var(--ink);
      line-height: 1.35;
      display: block;
    }

    .task-titulo--done {
      text-decoration: line-through;
      color: var(--ink-soft);
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .task-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: 6px;
      line-height: 1.3;
    }

    .task-date {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: var(--ink-soft);
    }

    .task-date__icon { font-size: 12px; }

    .task-done-meta {
      font-size: 11.5px;
      color: var(--ink-soft);
      font-style: italic;
    }

    .task-kebab {
      position: relative;
      flex-shrink: 0;
    }

    .kebab-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--ink-soft);
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s;
    }

    .kebab-btn:active { background: var(--paper); }
    .kebab-btn .anticon { font-size: 19px; }

    .kebab-menu {
      position: absolute;
      right: 0;
      top: 46px;
      background: var(--paper-raised);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: 0 4px 16px rgba(0,0,0,0.10);
      z-index: 10;
      min-width: 130px;
      overflow: hidden;
    }

    .kebab-menu__item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 11px 14px;
      border: none;
      background: none;
      font-family: var(--font-body);
      font-size: 13.5px;
      color: var(--ink);
      cursor: pointer;
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }

    .kebab-menu__item:active { background: var(--paper); }
    .kebab-menu__item .anticon { font-size: 15px; color: var(--ink-soft); }

    .kebab-menu__item--danger { color: var(--danger); }
    .kebab-menu__item--danger .anticon { color: var(--danger); }
  `],
})
export class TaskItemComponent {
  tarefa = input.required<TarefaResponse>();
  toggle = output<TarefaResponse>();
  editar = output<TarefaResponse>();
  excluir = output<number>();

  menuAberto = signal(false);

  private static colorCache: Record<string, { fg: string; soft: string }> = {};
  private static nextIndex = 0;

  corPessoa(nome: string): { fg: string; soft: string } {
    if (!TaskItemComponent.colorCache[nome]) {
      TaskItemComponent.colorCache[nome] = PALETTE[TaskItemComponent.nextIndex % PALETTE.length];
      TaskItemComponent.nextIndex++;
    }
    return TaskItemComponent.colorCache[nome];
  }

  toggleMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  confirmarExclusao(): void {
    this.menuAberto.set(false);
    this.excluir.emit(this.tarefa().id);
  }

  formatarConclusao(data: string): string {
    try {
      const d = new Date(data);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMin / 60);
      const diffDias = Math.floor(diffHrs / 24);

      if (diffMin < 1) return 'agora';
      if (diffMin < 60) return `há ${diffMin}min`;
      if (diffHrs < 24) return `há ${diffHrs}h`;
      if (diffDias === 1) return 'ontem';
      return `há ${diffDias}d`;
    } catch {
      return '';
    }
  }
}
