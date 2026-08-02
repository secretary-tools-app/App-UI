import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { TagListInputComponent } from '../../../shared/components/tag-list-input/tag-list-input.component';
import { ChamadoListInputComponent } from '../../../shared/components/chamado-list-input/chamado-list-input.component';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';
import { AtaService, SacramentalService, DiscursantesService, ConfiguracoesService, HinosService } from '../../../core/services';
import { AtaResponse, SacramentalData, UnidadeData, Hino, ChamadoItem } from '../../../core/models';
import { ActionBarService } from '../../../shared/components/action-bar/action-bar.service';

@Component({
  selector: 'app-sacramental-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzAutocompleteModule,
    NzSkeletonModule,
    SectionCardComponent,
    TagListInputComponent,
    ChamadoListInputComponent,
    PageHeadComponent,
  ],
  template: `
    <app-page-head modo="row" tipo="sacramental" eyebrow="Ata Sacramental" [titulo]="dataFormatada()"></app-page-head>

    @if (loadingInicial()) {
      <div class="loading-box">
        <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 8 }"></nz-skeleton>
      </div>
    } @else {
      <form [formGroup]="form" class="form">
        <app-section-card index="01" title="Saudações e boas-vindas" subtitle="Quem preside, dirige e a presença reconhecida" accent="sacramental">
          <div class="field">
            <label class="field-label">Presidida por</label>
            <input nz-input formControlName="presidido" [nzAutocomplete]="autoPresidido" (input)="filtrarLideranca('presidido')" />
          </div>
          <nz-autocomplete #autoPresidido>
            @for (n of presididoOptions(); track n) {
              <nz-auto-option [nzValue]="n">{{ n }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Dirigida por</label>
            <input nz-input formControlName="dirigido" [nzAutocomplete]="autoDirigido" (input)="filtrarLideranca('dirigido')" />
          </div>
          <nz-autocomplete #autoDirigido>
            @for (n of dirigidoOptions(); track n) {
              <nz-auto-option [nzValue]="n">{{ n }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Reconhecemos a presença de</label>
            <app-tag-list-input formControlName="reconhecemosPresenca" placeholder="Nome do visitante..."></app-tag-list-input>
          </div>
        </app-section-card>

        <app-section-card index="02" title="Anúncios" accent="sacramental">
          <app-tag-list-input formControlName="anuncios" placeholder="Novo anúncio..." [multiline]="true"></app-tag-list-input>
        </app-section-card>

        <app-section-card index="03" title="Abertura" subtitle="Recepção, música e oração inicial" accent="sacramental">
          <div class="field">
            <label class="field-label">Recepcionista</label>
            <input nz-input formControlName="recepcionistas" />
          </div>
          <div class="field">
            <label class="field-label">Pianista</label>
            <input nz-input formControlName="pianista" />
          </div>
          <div class="field">
            <label class="field-label">Regente de música</label>
            <input nz-input formControlName="regenteMusica" />
          </div>
          <div class="field">
            <label class="field-label">Hino de abertura</label>
            <input nz-input formControlName="hinoAbertura" placeholder="nº ou nome" [nzAutocomplete]="autoHinoAbertura" (input)="buscarHino('abertura')" />
          </div>
          <nz-autocomplete #autoHinoAbertura>
            @for (h of hinosAbertura(); track h.numero) {
              <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Oração de abertura</label>
            <input nz-input formControlName="oracaoAbertura" />
          </div>
        </app-section-card>

        <app-section-card index="04" title="Assuntos da ala" subtitle="Desobrigações, apoios, confirmações e ordenações" accent="sacramental">
          <div>
            <label class="field-label">Desobrigações</label>
            <app-chamado-list-input formControlName="desobrigacoes"></app-chamado-list-input>
          </div>
          <div>
            <label class="field-label">Apoios / novos chamados</label>
            <app-chamado-list-input formControlName="apoios"></app-chamado-list-input>
          </div>
          <div>
            <label class="field-label">Confirmações de batismo</label>
            <app-tag-list-input formControlName="confirmacoesBatismo" placeholder="Nome do confirmado"></app-tag-list-input>
          </div>
          <div>
            <label class="field-label">Apoio a membros novos</label>
            <app-tag-list-input formControlName="apoioMembros" placeholder="Nome do membro"></app-tag-list-input>
          </div>
          <div>
            <label class="field-label">Bênção de crianças</label>
            <app-tag-list-input formControlName="bencaoCriancas" placeholder="Nome da criança"></app-tag-list-input>
          </div>
          <div>
            <label class="field-label">Ordenações de sacerdócio</label>
            <app-chamado-list-input formControlName="ordenacoes"></app-chamado-list-input>
          </div>
        </app-section-card>

        <app-section-card index="05" title="Sacramento" accent="sacramental">
          <div class="field">
            <label class="field-label">Hino sacramental</label>
            <input nz-input formControlName="hinoSacramental" placeholder="nº ou nome" [nzAutocomplete]="autoHinoSacramento" (input)="buscarHino('sacramento')" />
          </div>
          <nz-autocomplete #autoHinoSacramento>
            @for (h of hinosSacramento(); track h.numero) {
              <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
            }
          </nz-autocomplete>
        </app-section-card>

        @if (primeiroDomingo()) {
          <app-section-card index="06" title="Testemunhos" subtitle="Irmãos que prestaram testemunho" accent="sacramental">
            <div class="field">
              <label class="field-label">Testemunhos prestados</label>
              <app-tag-list-input formControlName="testemunhos" placeholder="Nome de quem testemunhou"></app-tag-list-input>
            </div>
          </app-section-card>
        } @else {
          <app-section-card index="06" title="Discursantes" subtitle="Oradores e hino intermediário" accent="sacramental">
          <div class="field">
            <label class="field-label">Primeiro discursante</label>
            <input nz-input formControlName="discursante1" [nzAutocomplete]="auto1" (input)="filtrar(1)" />
          </div>
          <nz-autocomplete #auto1>
            @for (n of sugestoesFiltradas1(); track n) {
              <nz-auto-option [nzValue]="n">{{ n }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Tema</label>
            <input nz-input formControlName="tema1" placeholder="opcional" />
          </div>
          <div class="field">
            <label class="field-label">Observações</label>
            <input nz-input formControlName="obs1" placeholder="opcional" />
          </div>

          <div class="field">
            <label class="field-label">Segundo discursante</label>
            <input nz-input formControlName="discursante2" [nzAutocomplete]="auto2" (input)="filtrar(2)" />
          </div>
          <nz-autocomplete #auto2>
            @for (n of sugestoesFiltradas2(); track n) {
              <nz-auto-option [nzValue]="n">{{ n }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Tema</label>
            <input nz-input formControlName="tema2" placeholder="opcional" />
          </div>
          <div class="field">
            <label class="field-label">Observações</label>
            <input nz-input formControlName="obs2" placeholder="opcional" />
          </div>

          <div class="field">
            <label class="field-label">Hino intermediário</label>
            <input nz-input formControlName="hinoIntermediario" placeholder="nº ou nome" [nzAutocomplete]="autoHinoIntermediario" (input)="buscarHino('intermediario')" />
          </div>
          <nz-autocomplete #autoHinoIntermediario>
            @for (h of hinosIntermediario(); track h.numero) {
              <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
            }
          </nz-autocomplete>
        </app-section-card>
        }

        <app-section-card index="07" title="Encerramento" subtitle="Hino e oração final" accent="sacramental">
          @if (!primeiroDomingo()) {
          <div class="field">
            <label class="field-label">Último discursante</label>
            <input nz-input formControlName="ultimoDiscursante" [nzAutocomplete]="auto3" (input)="filtrar(3)" />
          </div>
          <nz-autocomplete #auto3>
            @for (n of sugestoesFiltradas3(); track n) {
              <nz-auto-option [nzValue]="n">{{ n }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Tema</label>
            <input nz-input formControlName="temaUltimo" placeholder="opcional" />
          </div>
          <div class="field">
            <label class="field-label">Observações</label>
            <input nz-input formControlName="obsUltimo" placeholder="opcional" />
          </div>
          }
          <div class="field">
            <label class="field-label">Hino de encerramento</label>
            <input nz-input formControlName="hinoEncerramento" placeholder="nº ou nome" [nzAutocomplete]="autoHinoEncerramento" (input)="buscarHino('encerramento')" />
          </div>
          <nz-autocomplete #autoHinoEncerramento>
            @for (h of hinosEncerramento(); track h.numero) {
              <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
            }
          </nz-autocomplete>
          <div class="field">
            <label class="field-label">Oração de encerramento</label>
            <input nz-input formControlName="oracaoEncerramento" />
          </div>
          <div class="field">
            <label class="field-label">Outras observações</label>
            <textarea nz-input formControlName="outros" rows="3"></textarea>
          </div>
        </app-section-card>
      </form>
    }
  `,
  styles: [
    `
      .loading-box {
        padding: 20px;
      }

      .form {
        padding: 14px 20px 100px;
      }
      .field-label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ink-soft);
        margin-bottom: 6px;
      }
      .field + .field {
        margin-top: 10px;
      }
      @media (min-width: 768px) {
        .field + .field {
          margin-top: 0;
        }
      }
    `,
  ],
})
export class SacramentalFormComponent implements OnInit, OnDestroy {
  ataId!: number;
  ata = signal<AtaResponse | null>(null);
  isEditing = signal(false);
  loadingInicial = signal(true);
  saving = signal(false);

  sugestoes = signal<string[]>([]);
  sugestoesFiltradas1 = signal<string[]>([]);
  sugestoesFiltradas2 = signal<string[]>([]);
  sugestoesFiltradas3 = signal<string[]>([]);

  hinosAbertura = signal<Hino[]>([]);
  hinosSacramento = signal<Hino[]>([]);
  hinosIntermediario = signal<Hino[]>([]);
  hinosEncerramento = signal<Hino[]>([]);

  lideranca = signal<string[]>([]);
  presididoOptions = signal<string[]>([]);
  dirigidoOptions = signal<string[]>([]);

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ataService = inject(AtaService);
  private sacramentalService = inject(SacramentalService);
  private discursantesService = inject(DiscursantesService);
  private configService = inject(ConfiguracoesService);
  private hinosService = inject(HinosService);
  private msg = inject(NzMessageService);
  private actionBar = inject(ActionBarService);
  private subs: Subscription[] = [];

  form = this.fb.group({
    presidido: [''],
    dirigido: [''],
    reconhecemosPresenca: [[] as string[]],
    anuncios: [[] as string[]],
    recepcionistas: [''],
    pianista: [''],
    regenteMusica: [''],
    hinoAbertura: [''],
    oracaoAbertura: [''],
    desobrigacoes: [[] as ChamadoItem[]],
    apoios: [[] as ChamadoItem[]],
    confirmacoesBatismo: [[] as string[]],
    apoioMembros: [[] as string[]],
    bencaoCriancas: [[] as string[]],
    testemunhos: [[] as string[]],
    ordenacoes: [[] as ChamadoItem[]],
    hinoSacramental: [''],
    discursante1: [''],
    tema1: [''],
    obs1: [''],
    discursante2: [''],
    tema2: [''],
    obs2: [''],
    hinoIntermediario: [''],
    ultimoDiscursante: [''],
    temaUltimo: [''],
    obsUltimo: [''],
    hinoEncerramento: [''],
    oracaoEncerramento: [''],
    outros: [''],
  });

  ngOnInit(): void {
    this.ataId = Number(this.route.snapshot.paramMap.get('id'));

    this.actionBar.left.set({ label: 'Voltar', icon: 'arrow-left' });
    this.actionBar.right.set({ label: 'Salvar', icon: 'save' });
    this.subs.push(
      this.actionBar.leftClicked$.subscribe(() => this.voltar()),
      this.actionBar.rightClicked$.subscribe(() => this.salvar()),
    );

    forkJoin({
      ata: this.ataService.getById(this.ataId),
      sac: this.sacramentalService.getByAtaId(this.ataId).pipe(catchError(() => of(null))),
      recentes: this.discursantesService.getRecentes().pipe(catchError(() => of([]))),
    }).subscribe(({ ata, sac, recentes }) => {
      this.ata.set(ata);

      if (sac && (sac.id || sac.ataId)) {
        this.isEditing.set(true);
        this.form.patchValue(sac as any);
      }

      const nomes = new Set<string>();
      for (const r of recentes) {
        if (r.discursante1) nomes.add(r.discursante1);
        if (r.discursante2) nomes.add(r.discursante2);
        if (r.ultimoDiscursante) nomes.add(r.ultimoDiscursante);
      }
      this.sugestoes.set([...nomes]);

      this.loadingInicial.set(false);

      this.configService.getUnidade().subscribe((unidade) => {
        if (unidade) {
          const nomes = [
            unidade.bispo,
            unidade.primeiroConselheiro,
            unidade.segundoConselheiro,
          ].filter((n): n is string => !!n && n.trim().length > 0);
          this.lideranca.set(nomes);
          this.presididoOptions.set(nomes);
          this.dirigidoOptions.set(nomes);

          if (!this.isEditing()) {
            this.form.patchValue({
              recepcionistas: unidade.recepcionista ?? '',
              pianista: unidade.pianista ?? '',
              regenteMusica: unidade.regenteMusica ?? '',
              presidido: unidade.bispo ?? '',
              dirigido: this.dirigidoRodizio(unidade, this.ata()?.data ?? ''),
            });
          }
        }
      });
    });
  }

  dataFormatada(): string {
    const d = this.ata()?.data;
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  /** Reunião de jejum/testemunhos: primeiro domingo do mês (dia ≤ 7). */
  primeiroDomingo(): boolean {
    const d = this.ata()?.data;
    if (!d) return false;
    const [y, m, day] = d.split('-').map(Number);
    if (!y || !m || !day) return false;
    return new Date(y, m - 1, day).getDay() === 0 && day <= 7;
  }

  dirigidoRodizio(unidade: UnidadeData, dataAta: string): string {
    const rotacao = [
      unidade.bispo,
      unidade.primeiroConselheiro,
      unidade.segundoConselheiro,
    ].filter((n): n is string => !!n && n.trim().length > 0);

    if (rotacao.length === 0) return '';

    const referencia = new Date(2024, 0, 7);
    const [y, m, d] = dataAta.split('-').map(Number);
    if (!y || !m || !d) return rotacao[0];

    const data = new Date(y, m - 1, d);
    const semanas = Math.floor((data.getTime() - referencia.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const idx = ((semanas % rotacao.length) + rotacao.length) % rotacao.length;
    return rotacao[idx];
  }

  filtrarLideranca(campo: 'presidido' | 'dirigido'): void {
    const valor = this.form.get(campo)?.value?.toLowerCase() ?? '';
    const filtradas = valor
      ? this.lideranca().filter((n) => n.toLowerCase().includes(valor))
      : this.lideranca();
    if (campo === 'presidido') this.presididoOptions.set(filtradas);
    else this.dirigidoOptions.set(filtradas);
  }

  filtrar(campo: 1 | 2 | 3): void {
    const valor = (
      campo === 1
        ? this.form.controls.discursante1.value
        : campo === 2
        ? this.form.controls.discursante2.value
        : this.form.controls.ultimoDiscursante.value
    )?.toLowerCase() ?? '';

    const filtradas = valor ? this.sugestoes().filter((n) => n.toLowerCase().includes(valor)) : this.sugestoes();

    if (campo === 1) this.sugestoesFiltradas1.set(filtradas);
    if (campo === 2) this.sugestoesFiltradas2.set(filtradas);
    if (campo === 3) this.sugestoesFiltradas3.set(filtradas);
  }

  buscarHino(campo: 'abertura' | 'sacramento' | 'intermediario' | 'encerramento'): void {
    const ctrl = this.form.get(
      campo === 'abertura' ? 'hinoAbertura' :
      campo === 'sacramento' ? 'hinoSacramental' :
      campo === 'intermediario' ? 'hinoIntermediario' :
      'hinoEncerramento'
    );
    const valor = ctrl?.value ?? '';
    this.hinosService.buscar(valor).pipe(
      catchError(() => of([])),
    ).subscribe((hinos) => {
      const signalMap = {
        abertura: this.hinosAbertura,
        sacramento: this.hinosSacramento,
        intermediario: this.hinosIntermediario,
        encerramento: this.hinosEncerramento,
      };
      signalMap[campo].set(hinos);
    });
  }

  salvar(): void {
    this.saving.set(true);
    const payload: SacramentalData = { ataId: this.ataId, ...this.form.getRawValue() };

    const req$ = this.isEditing()
      ? this.sacramentalService.update(this.ataId, payload)
      : this.sacramentalService.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.msg.success('Ata salva com sucesso.');
        this.router.navigate(['/atas', this.ataId, 'preview']);
      },
      error: () => {
        this.saving.set(false);
        this.msg.error('Não foi possível salvar. Tente novamente.');
      },
    });
  }

  verPreview(): void {
    this.router.navigate(['/atas', this.ataId, 'preview']);
  }

  voltar(): void {
    this.router.navigate(['/atas']);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.actionBar.clear();
  }
}
