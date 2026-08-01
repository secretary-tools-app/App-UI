import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { AtaService, AuthService } from '../../../core/services';
import { AtaResponse, TipoAta } from '../../../core/models';
import { FilterChipsComponent } from '../../../features/tarefas/filter-chips/filter-chips.component';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';
import { FabComponent } from '../../../shared/components/fab/fab.component';

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

@Component({
  selector: 'app-ata-list',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzSkeletonModule,
    FilterChipsComponent,
    PageHeadComponent,
    FabComponent,
  ],
  template: `
    <app-page-head [eyebrow]="auth.alaTitle()" titulo="Atas"></app-page-head>

    <div
      class="month-nav"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd($event)"
    >
      <button nz-button nzType="text" nzShape="circle" (click)="mesAnterior()" aria-label="Mês anterior">
        <span nz-icon nzType="left"></span>
      </button>
      <span class="month-nav__label" [class.month-nav__label--animating]="animating()">{{ mesFormatado() }}</span>
      <button nz-button nzType="text" nzShape="circle" (click)="proximoMes()" aria-label="Próximo mês">
        <span nz-icon nzType="right"></span>
      </button>
    </div>

    <app-filter-chips
      [tipos]="filtroTipos"
      [filtroAtivo]="filtroAtivoStr()"
      (selecionar)="filtrar($event)"
    ></app-filter-chips>

    <div class="list" [class.list--switching]="animating()">
      @if (loading()) {
        <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 4 }"></nz-skeleton>
      } @else if (atasFiltradas().length === 0) {
        <div class="empty-state">
          <span nz-icon nzType="file-text" class="empty-state__icon"></span>
          <p class="empty-state__text">Nenhuma ata neste mês.</p>
          <button type="button" class="empty-state__cta" (click)="nova()">
            <span nz-icon nzType="plus"></span>
            Nova ata
          </button>
        </div>
      } @else {
        @for (ata of atasFiltradas(); track ata.id; let i = $index) {
          <button
            type="button"
            class="ata-card"
            [class.ata-card--sacramental]="ata.tipo === 'sacramental'"
            [class.ata-card--batismo]="ata.tipo === 'batismo'"
            [style.--stagger]="i"
            (click)="abrir(ata)"
          >
            <span class="ata-card__date">
              <span class="ata-card__weekday">{{ diaSemana(ata.data) }}</span>
              <span class="ata-card__day">{{ dia(ata.data) }}</span>
            </span>
            <div class="ata-card__meta">
              <span class="ata-card__label">
                <span class="ata-card__dot" [class.ata-card__dot--sacramental]="ata.tipo === 'sacramental'" [class.ata-card__dot--batismo]="ata.tipo === 'batismo'"></span>
                {{ ata.tipo === 'sacramental' ? 'Sacramental' : 'Batismo' }}
              </span>
              <span class="ata-card__status" [class.ata-card__status--rascunho]="ata.status === 'rascunho'">{{ statusLabel(ata.status) }}</span>
            </div>
            <span nz-icon nzType="right" class="ata-card__arrow"></span>
          </button>
        }
      }
    </div>

    <app-fab (clicar)="nova()" ariaLabel="Nova ata"></app-fab>
  `,
  styles: [`
    .month-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 4px 16px 10px;
      touch-action: pan-y;
      user-select: none;
    }
    .month-nav .anticon { font-size: 16px; }
    .month-nav [disabled] { opacity: 0.3; }
    .month-nav__label {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      color: var(--ink);
      min-width: 180px;
      text-align: center;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .month-nav__label--animating {
      animation: swipeFade 0.25s ease;
    }

    @keyframes swipeFade {
      0% { opacity: 0.4; transform: scale(0.96); }
      100% { opacity: 1; transform: scale(1); }
    }

    .list {
      padding: 0 16px calc(100px + var(--safe-bottom));
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .list--switching {
      animation: listIn 0.25s ease;
    }
    @keyframes listIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: none; }
    }

    .ata-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--paper-raised);
      border: 1px solid var(--line);
      border-left: 3px solid var(--primary);
      border-radius: var(--radius);
      padding: 12px 16px;
      text-align: left;
      font-family: var(--font-body);
      cursor: pointer;
      animation: cardIn 0.3s ease backwards;
      animation-delay: calc(var(--stagger, 0) * 40ms);
      transition: border-color 0.15s, background 0.15s;

      &:active {
        transform: scale(0.99);
        background: var(--paper);
      }
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: none; }
    }
    .ata-card--sacramental {
      border-left-color: var(--accent-sacramental);
    }
    .ata-card--batismo {
      border-left-color: var(--accent-batismo);
    }
    .ata-card__date {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 38px;
      flex: none;
    }
    .ata-card__weekday {
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-soft);
      margin-bottom: 1px;
    }
    .ata-card__day {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }
    .ata-card__meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }
    .ata-card__label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
    }
    .ata-card__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
    }
    .ata-card__dot--sacramental { background: var(--accent-sacramental); }
    .ata-card__dot--batismo { background: var(--accent-batismo); }
    .ata-card__status {
      align-self: flex-start;
      padding: 3px 10px;
      border-radius: 12px;
      background: rgba(76, 122, 93, 0.12);
      color: var(--success);
      font-size: 11px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .ata-card__status--rascunho {
      background: rgba(156, 107, 48, 0.12);
      color: var(--accent-sacramental);
    }
    .ata-card__arrow {
      font-size: 12px;
      color: var(--ink-soft);
      flex: none;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 36px 16px;
      text-align: center;
    }
    .empty-state__icon {
      font-size: 38px;
      color: var(--primary);
      opacity: 0.4;
      margin-bottom: 4px;
    }
    .empty-state__text {
      font-size: 14px;
      color: var(--ink-soft);
      margin: 0;
    }
    .empty-state__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      padding: 9px 20px;
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
  `],
})
export class AtaListComponent implements OnInit {
  atas = signal<AtaResponse[]>([]);
  loading = signal(true);
  filtroTipo = signal<TipoAta | null>(null);
  currentDate = signal(new Date());
  animating = signal(false);

  readonly filtroTipos: { valor: string; rotulo: string; acento?: 'sacramental' | 'batismo' }[] = [
    { valor: 'Todos', rotulo: 'Todos' },
    { valor: 'sacramental', rotulo: 'Sacramental', acento: 'sacramental' },
    { valor: 'batismo', rotulo: 'Batismo', acento: 'batismo' },
  ];

  filtroAtivoStr = computed(() => this.filtroTipo() ?? 'Todos');

  private touchStartX = 0;
  private touchStartY = 0;

  atasFiltradas = computed(() => {
    let list = this.atas();
    const tipo = this.filtroTipo();
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    list = list.filter((a) => {
      const [ay, am] = a.data.split('-').map(Number);
      return ay === year && am - 1 === month;
    });

    if (tipo) {
      list = list.filter((a) => a.tipo === tipo);
    }

    return list.sort((a, b) => a.data.localeCompare(b.data));
  });

  constructor(
    private ataService: AtaService,
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.ataService.getAll().subscribe({
      next: (list) => {
        this.atas.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  mesFormatado(): string {
    const d = this.currentDate();
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  private navegar(d: Date): void {
    this.animating.set(true);
    this.currentDate.set(d);
    setTimeout(() => this.animating.set(false), 260);
  }

  mesAnterior(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.navegar(d);
  }

  proximoMes(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.navegar(d);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchMove(e: TouchEvent): void {
    const dx = e.touches[0].clientX - this.touchStartX;
    const dy = e.touches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        this.proximoMes();
      } else {
        this.mesAnterior();
      }
    }
  }

  dia(data: string): string {
    return data.split('-')[2].replace(/^0/, '');
  }

  diaSemana(data: string): string {
    const [y, m, d] = data.split('-').map(Number);
    return DIAS[new Date(y, m - 1, d).getDay()];
  }

  statusLabel(status: string): string {
    return status === 'rascunho' ? 'rascunho' : 'concluída';
  }

  filtrar(valor: string): void {
    this.filtroTipo.set(valor === 'Todos' ? null : (valor as TipoAta));
  }

  abrir(ata: AtaResponse): void {
    this.router.navigate(['/atas', ata.id, 'preview']);
  }

  nova(): void {
    this.router.navigate(['/atas/nova']);
  }
}
