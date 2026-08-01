import { Component, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { TarefaResponse } from '../../../core/models';

@Component({
  selector: 'app-task-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomSheetComponent],
  template: `
    <app-bottom-sheet
      [titulo]="tarefaEdicao() ? 'Editar tarefa' : 'Nova tarefa'"
      [rotuloSalvar]="tarefaEdicao() ? 'Salvar' : 'Criar tarefa'"
      [desabilitado]="!titulo.trim()"
      (salvar)="onSalvar()"
      (fechar)="fechar.emit()"
    >
      <div class="field">
        <label class="field-label">Título</label>
        <input
          class="field-input"
          type="text"
          [(ngModel)]="titulo"
          placeholder="Ex: Preparar ata dominical"
          autofocus
        />
      </div>

      <div class="field">
        <label class="field-label">Responsável</label>
        <div class="responsavel-list">
          <button
            class="resp-chip"
            [class.resp-chip--active]="responsavel === ''"
            (click)="responsavel = ''"
          >
            Nenhum
          </button>
          @for (nome of nomes(); track nome) {
            <button
              class="resp-chip"
              [class.resp-chip--active]="responsavel === nome"
              (click)="responsavel = nome"
            >
              {{ nome }}
            </button>
          }
        </div>
      </div>

      <div class="field">
        <label class="field-label">Data (opcional)</label>
        <input
          class="field-input"
          type="date"
          [(ngModel)]="dataPrevista"
        />
      </div>
    </app-bottom-sheet>
  `,
  styles: [`
    :host { display: block; }

    .field-label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-bottom: 6px;
    }

    .field-input {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid var(--line);
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--ink);
      background: var(--paper);
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
      -webkit-appearance: none;
    }

    .field-input:focus {
      border-color: var(--primary);
    }

    .field-input::placeholder {
      color: var(--ink-soft);
      opacity: 0.6;
    }

    .responsavel-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .resp-chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1.5px solid var(--line);
      background: var(--paper-raised);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.12s;
      -webkit-tap-highlight-color: transparent;
    }

    .resp-chip--active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
  `],
})
export class TaskBottomSheetComponent implements OnInit, OnChanges {
  tarefaEdicao = input<TarefaResponse | null>(null);
  nomes = input.required<string[]>();
  salvar = output<{ titulo: string; responsavel: string; dataPrevista: string }>();
  fechar = output<void>();

  titulo = '';
  responsavel = '';
  dataPrevista = '';

  onSalvar(): void {
    this.salvar.emit({
      titulo: this.titulo.trim(),
      responsavel: this.responsavel,
      dataPrevista: this.dataPrevista,
    });
  }

  ngOnInit(): void {
    this.preencherCampos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tarefaEdicao']) {
      this.preencherCampos();
    }
  }

  private preencherCampos(): void {
    const t = this.tarefaEdicao();
    if (t) {
      this.titulo = t.titulo;
      this.responsavel = t.responsavel || '';
      this.dataPrevista = t.dataPrevista || '';
    } else {
      this.titulo = '';
      this.responsavel = '';
      this.dataPrevista = '';
    }
  }
}
