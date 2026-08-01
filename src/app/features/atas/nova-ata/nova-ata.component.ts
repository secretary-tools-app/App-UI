import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { switchMap, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AtaService } from '../../../core/services';
import { TipoAta } from '../../../core/models';
import { ActionBarService } from '../../../shared/components/action-bar/action-bar.service';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';

@Component({
  selector: 'app-nova-ata',
  standalone: true,
  imports: [CommonModule, FormsModule, NzDatePickerModule, NzButtonModule, NzIconModule, NzModalModule, PageHeadComponent],
  template: `
    <app-page-head modo="row" titulo="Nova ata"></app-page-head>

    <div class="nova-ata">
      <p class="nova-ata__lead">Qual o tipo de reunião? Escolha e informe a data para começar o preenchimento.</p>

      <div class="tipo-grid">
        <button
          type="button"
          class="tipo-card tipo-card--sacramental"
          [class.tipo-card--active]="tipo() === 'sacramental'"
          (click)="tipoChanged('sacramental')"
        >
          <span class="tipo-card__badge" nz-icon nzType="file-text"></span>
          <span class="tipo-card__title">Sacramental</span>
          <span class="tipo-card__desc">Reunião sacramental de domingo</span>
        </button>

        <button
          type="button"
          class="tipo-card tipo-card--batismo"
          [class.tipo-card--active]="tipo() === 'batismo'"
          (click)="tipoChanged('batismo')"
        >
          <span class="tipo-card__badge" nz-icon nzType="heart"></span>
          <span class="tipo-card__title">Batismo</span>
          <span class="tipo-card__desc">Serviço batismal</span>
        </button>
      </div>

      <label class="nova-ata__label">Data</label>
      <nz-date-picker
        [(ngModel)]="data"
        nzSize="large"
        nzFormat="dd/MM/yyyy"
        [nzInputReadOnly]="true"
        [nzDisabled]="!tipo()"
        [nzDisabledDate]="diaDesabilitado"
        nzPlaceHolder="Selecione o tipo primeiro"
        class="nova-ata__date"
      ></nz-date-picker>

      @if (!tipo()) {
        <p class="nova-ata__hint">Selecione o tipo de reunião acima para escolher a data.</p>
      } @else if (tipo() === 'sacramental' && isSunday() === false) {
        <p class="nova-ata__hint">A reunião sacramental só pode ser em domingos.</p>
      }
    </div>
  `,
  styles: [
    `
      .nova-ata {
        padding: 20px 20px calc(32px + var(--safe-bottom));
      }
      .nova-ata__lead {
        color: var(--ink-soft);
        font-size: 14.5px;
        line-height: 1.5;
        margin: 0 0 20px;
      }

      .tipo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 26px;
      }
      .tipo-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        background: var(--paper-raised);
        border: 1.5px solid var(--line);
        border-radius: var(--radius);
        padding: 18px 14px;
        text-align: left;
        cursor: pointer;
        transition: border-color 0.15s ease, transform 0.1s ease;
        font-family: var(--font-body);

        &:active {
          transform: scale(0.98);
        }
      }
      .tipo-card__badge {
        font-size: 22px;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tipo-card--sacramental .tipo-card__badge {
        color: var(--accent-sacramental);
        background: var(--accent-sacramental-soft);
      }
      .tipo-card--batismo .tipo-card__badge {
        color: var(--accent-batismo);
        background: var(--accent-batismo-soft);
      }
      .tipo-card__title {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 16px;
      }
      .tipo-card__desc {
        font-size: 12.5px;
        color: var(--ink-soft);
        line-height: 1.3;
      }
      .tipo-card--active.tipo-card--sacramental {
        border-color: var(--accent-sacramental);
        box-shadow: 0 0 0 1px var(--accent-sacramental);
      }
      .tipo-card--active.tipo-card--batismo {
        border-color: var(--accent-batismo);
        box-shadow: 0 0 0 1px var(--accent-batismo);
      }

      .nova-ata__label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-soft);
        margin-bottom: 6px;
      }
      .nova-ata__date {
        width: 100%;
      }
      .nova-ata__date.nz-disabled {
        opacity: 0.45;
        pointer-events: none;
      }
      .nova-ata__hint {
        font-size: 12.5px;
        color: var(--warning, var(--accent-sacramental));
        margin: 10px 2px 0;
      }
    `,
  ],
})
export class NovaAtaComponent implements OnInit, OnDestroy {
  tipo = signal<TipoAta>('sacramental');
  data: Date | null = null;
  loading = signal(false);

  private actionBar = inject(ActionBarService);
  private modal = inject(NzModalService);
  private subs: Subscription[] = [];

  constructor(private ataService: AtaService, private router: Router, private msg: NzMessageService) {
    this.data = this.proximoDia(0);
  }

  ngOnInit(): void {
    this.actionBar.left.set({ label: 'Voltar', icon: 'arrow-left' });
    this.actionBar.right.set({ label: 'Continuar', icon: 'check' });
    this.subs.push(
      this.actionBar.leftClicked$.subscribe(() => this.voltar()),
      this.actionBar.rightClicked$.subscribe(() => this.continuar()),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.actionBar.clear();
  }

  tipoChanged(tipo: TipoAta): void {
    this.tipo.set(tipo);
    this.data = tipo === 'sacramental' ? this.proximoDia(0) : this.proximoDia(6);
  }

  diaDesabilitado = (d: Date): boolean => {
    if (this.tipo() === 'sacramental') {
      return d.getDay() !== 0;
    }
    return false;
  };

  isSunday(): boolean | null {
    if (!this.data) return null;
    return this.data.getDay() === 0;
  }

  private proximoDia(diaAlvo: number): Date {
    const hoje = new Date();
    const diff = (diaAlvo - hoje.getDay() + 7) % 7 || 7;
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + diff);
    return d;
  }

  voltar(): void {
    this.router.navigate(['/atas']);
  }

  continuar(): void {
    const tipo = this.tipo();
    if (!tipo || !this.data) return;

    this.loading.set(true);
    const dataStr = this.toIsoDate(this.data);

    this.ataService.getByDataTipo(dataStr, tipo).pipe(
      catchError(() => of(null)),
      switchMap((existente) => {
        if (existente) {
          this.loading.set(false);
          this.confirmarEdicao(existente.id, tipo);
          return of(null);
        }
        return this.ataService.create({ tipo, data: dataStr });
      }),
      catchError(() => {
        this.loading.set(false);
        this.msg.error('Não foi possível criar a ata. Tente novamente.');
        return of(null);
      }),
    ).subscribe((ata) => {
      if (ata) {
        this.loading.set(false);
        this.router.navigate(['/atas', ata.id, tipo]);
      }
    });
  }

  private confirmarEdicao(ataId: number, tipo: TipoAta): void {
    this.modal.confirm({
      nzTitle: 'Ata já existe',
      nzContent: 'Já existe uma ata para esta data. Deseja editar?',
      nzOkText: 'Editar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.router.navigate(['/atas', ataId, tipo]),
    });
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
