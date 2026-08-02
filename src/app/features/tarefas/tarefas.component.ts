import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FilterChipsComponent } from './filter-chips/filter-chips.component';
import { TaskItemComponent } from './task-item/task-item.component';
import { TaskBottomSheetComponent } from './task-bottom-sheet/task-bottom-sheet.component';
import { TarefaService } from '../../core/services/tarefa.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { AuthService } from '../../core/services/auth.service';
import { TarefaResponse, UsuarioResponse } from '../../core/models';
import { PageHeadComponent } from '../../shared/components/page-head/page-head.component';
import { FabComponent } from '../../shared/components/fab/fab.component';

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzModalModule,
    FilterChipsComponent,
    TaskItemComponent,
    TaskBottomSheetComponent,
    PageHeadComponent,
    FabComponent,
  ],
  template: `
    <div class="page">
      <app-page-head [eyebrow]="auth.alaTitle()" titulo="Tarefas"></app-page-head>

      <app-filter-chips
        [pessoas]="nomesDisponiveis()"
        [filtroAtivo]="filtroAtivo()"
        (selecionar)="filtroAtivo.set($event)"
      />

      <div class="content">
        @if (loading()) {
          <div class="section">
            <div class="section__empty">Carregando...</div>
          </div>
        } @else {
          <div class="section">
            <div class="section__header">
              <span class="section__label">A FAZER</span>
              <span class="section__badge">{{ tarefasAFazer().length }}</span>
            </div>
            @if (tarefasAFazer().length === 0) {
              <div class="empty-state">
                <span nz-icon nzType="check-circle" nzTheme="outline" class="empty-state__icon"></span>
                <p class="empty-state__text">Nenhuma tarefa pendente</p>
                <button class="empty-state__cta" (click)="abrirSheet()">
                  <span nz-icon nzType="plus" nzTheme="outline"></span>
                  Nova tarefa
                </button>
              </div>
            } @else {
              @for (tarefa of tarefasAFazer(); track tarefa.id) {
                <app-task-item
                  [tarefa]="tarefa"
                  (toggle)="toggleConclusao($event)"
                  (editar)="abrirSheet($event)"
                  (excluir)="excluirTarefa($event)"
                />
              }
            }
          </div>

          <div class="section">
            <button class="section__header section__header--collapsible" (click)="concluidasExpanded.set(!concluidasExpanded())">
              <span class="section__label">CONCLUÍDAS</span>
              <span class="section__badge">{{ tarefasConcluidas().length }}</span>
              <span
                nz-icon
                [nzType]="concluidasExpanded() ? 'up' : 'down'"
                nzTheme="outline"
                class="section__chevron"
              ></span>
            </button>
            @if (concluidasExpanded()) {
              @if (tarefasConcluidas().length === 0) {
                <div class="empty-state empty-state--muted">
                  <p class="empty-state__text">Nada concluído ainda esta semana</p>
                </div>
              } @else {
                @for (tarefa of tarefasConcluidas(); track tarefa.id) {
                  <app-task-item
                    [tarefa]="tarefa"
                    (toggle)="toggleConclusao($event)"
                  />
                }
              }
            }
          </div>
        }
      </div>
    </div>

    <app-fab (clicar)="abrirSheet()" ariaLabel="Nova tarefa"></app-fab>

    @if (showSheet()) {
      <app-task-bottom-sheet
        [tarefaEdicao]="editingTarefa()"
        [nomes]="nomesDisponiveis()"
        (salvar)="onSalvar($event)"
        (fechar)="fecharSheet()"
      />
    }
  `,
  styles: [`
    :host { display: block; }

    .page {
      padding-bottom: calc(var(--bottom-nav-h) + 32px);
    }

    .content {
      padding: 0 16px;
    }

    @media (min-width: 768px) {
      .content {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0 20px;
        align-items: start;
      }
    }

    .section {
      margin-bottom: 20px;
    }

    .section__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .section__header--collapsible {
      width: 100%;
      border: none;
      background: none;
      padding: 8px 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .section__label {
      font-family: var(--font-body);
      font-size: 11.5px;
      font-weight: 700;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .section__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--gray-100);
      font-family: var(--font-body);
      font-size: 11.5px;
      font-weight: 600;
      color: var(--ink-soft);
    }

    .section__chevron {
      margin-left: auto;
      font-size: 13px;
      color: var(--ink-soft);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 28px 16px;
      text-align: center;
    }

    .empty-state__icon {
      font-size: 36px;
      color: var(--success);
      opacity: 0.55;
      margin-bottom: 4px;
    }

    .empty-state__text {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink-soft);
      margin: 0;
    }

    .empty-state__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      padding: 8px 18px;
      border: none;
      border-radius: var(--radius);
      background: var(--primary);
      color: #fff;
      font-family: var(--font-body);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .empty-state__cta:active { opacity: 0.85; }
    .empty-state__cta .anticon { font-size: 14px; }

    .empty-state--muted { padding: 16px 16px; }
  `],
})
export class TarefasComponent implements OnInit {
  private tarefaSvc = inject(TarefaService);
  private usuariosSvc = inject(UsuariosService);
  private modal = inject(NzModalService);
  readonly auth = inject(AuthService);

  tarefas = signal<TarefaResponse[]>([]);
  usuarios = signal<UsuarioResponse[]>([]);
  filtroAtivo = signal('Todos');
  loading = signal(true);
  showSheet = signal(false);
  editingTarefa = signal<TarefaResponse | null>(null);
  concluidasExpanded = signal(false);

  nomesDisponiveis = computed(() => {
    const roles = this.rolesVisiveis();
    const lista = this.usuarios();
    const visiveis = roles.length === 0 ? lista : lista.filter(u => roles.includes(u.role));
    return visiveis
      .map((u) => (u.displayName && u.displayName.trim() ? u.displayName : u.username))
      .filter((n): n is string => !!n && n.trim().length > 0);
  });

  private rolesVisiveis(): string[] {
    const role = this.auth.role();
    if (role === 'bispo') return [];
    if (role === 'conselheiro_1' || role === 'conselheiro_2') {
      return ['conselheiro_1', 'conselheiro_2'];
    }
    if (role === 'secretario') {
      return ['secretario'];
    }
    return [];
  }

  tarefasAFazer = computed(() => {
    const filtro = this.filtroAtivo();
    let lista = this.tarefas().filter(t => !t.concluida);
    if (filtro !== 'Todos') {
      lista = lista.filter(t => t.responsavel === filtro);
    }
    return lista;
  });

  tarefasConcluidas = computed(() => {
    const filtro = this.filtroAtivo();
    let lista = this.tarefas().filter(t => t.concluida);
    if (filtro !== 'Todos') {
      lista = lista.filter(t => t.responsavel === filtro);
    }
    return lista;
  });

  ngOnInit(): void {
    this.carregarTarefas();
    this.carregarPessoas();
  }

  carregarTarefas(): void {
    this.loading.set(true);
    this.tarefaSvc.getAll().subscribe({
      next: (data) => {
        this.tarefas.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  carregarPessoas(): void {
    this.usuariosSvc.getAll().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
    });
  }

  abrirSheet(tarefa?: TarefaResponse): void {
    this.editingTarefa.set(tarefa || null);
    this.showSheet.set(true);
  }

  fecharSheet(): void {
    this.showSheet.set(false);
    this.editingTarefa.set(null);
  }

  onSalvar(dados: { titulo: string; responsavel: string; dataPrevista: string }): void {
    const editando = this.editingTarefa();

    if (editando) {
      this.tarefaSvc.update(editando.id, {
        titulo: dados.titulo,
        responsavel: dados.responsavel || undefined,
        dataPrevista: dados.dataPrevista || undefined,
      }).subscribe({
        next: () => {
          this.fecharSheet();
          this.carregarTarefas();
        },
      });
    } else {
      this.tarefaSvc.create({
        titulo: dados.titulo,
        responsavel: dados.responsavel || undefined,
        dataPrevista: dados.dataPrevista || undefined,
      }).subscribe({
        next: () => {
          this.fecharSheet();
          this.carregarTarefas();
        },
      });
    }
  }

  toggleConclusao(tarefa: TarefaResponse): void {
    this.tarefaSvc.toggle(tarefa.id).subscribe({
      next: () => this.carregarTarefas(),
    });
  }

  excluirTarefa(id: number): void {
    this.modal.confirm({
      nzTitle: 'Excluir tarefa?',
      nzContent: 'Essa ação não pode ser desfeita.',
      nzOkText: 'Excluir',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.tarefaSvc.delete(id).subscribe({
          next: () => this.carregarTarefas(),
        });
      },
    });
  }
}
