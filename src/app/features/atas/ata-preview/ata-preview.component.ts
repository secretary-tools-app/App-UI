import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { AtaService, SacramentalService, BatismoService, ConfiguracoesService, AuthService } from '../../../core/services';
import { AtaResponse, SacramentalData, BatismoData, UnidadeData, TemplateResponse, ChamadoItem } from '../../../core/models';
import { ActionBarService } from '../../../shared/components/action-bar/action-bar.service';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';
import { TagListInputComponent } from '../../../shared/components/tag-list-input/tag-list-input.component';

type ModoVisualizacao = 'simples' | 'completo';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const contentFade = trigger('contentFade', [
  transition('simples <=> completo', [
    style({ opacity: 0, transform: 'translateY(4px)' }),
    animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes[0];
  return partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1];
}

@Component({
  selector: 'app-ata-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSkeletonModule, NzModalModule, NzMessageModule, PageHeadComponent, BottomSheetComponent, TagListInputComponent],
  animations: [contentFade],
  template: `
    <app-page-head modo="row" titulo="Visualizar">
      <span pageHeadLeft>
        <button type="button" class="page-head__btn" (click)="alternarTelaCheia()" [attr.aria-label]="telaCheia() ? 'Sair da tela cheia' : 'Tela cheia'">
          <span nz-icon [nzType]="telaCheia() ? 'fullscreen-exit' : 'fullscreen'"></span>
        </button>
      </span>
      <span pageHeadActions>
        <button type="button" class="page-head__btn" (click)="opcoesVisible.set(true)" aria-label="Opções de visualização">
          <span nz-icon nzType="more"></span>
        </button>
      </span>
    </app-page-head>

    @if (loading()) {
      <div class="loading-box"><nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 10 }"></nz-skeleton></div>
    } @else {
      <article class="doc" [class.doc--cheia]="telaCheia()" [class.doc--sacramental]="ata()?.tipo === 'sacramental'" [class.doc--batismo]="ata()?.tipo === 'batismo'" [style.--doc-font-size]="fontSize() + 'px'">
        <div class="doc__content" [@contentFade]="modo()">
          <section class="doc__header">
            <span class="doc__status" [class.doc__status--rascunho]="ata()?.status === 'rascunho'">{{ statusLabel() }}</span>
            <p class="doc__ala-name">Ata {{ ata()?.tipo === 'sacramental' ? 'Sacramental' : 'de Batismo' }} - {{ alaTitulo() }} | {{ dataFormatada() }}</p>
            @if (unidade()?.horario) {
              <p><strong>Horário:</strong> {{ unidade()?.horario }}</p>
            }
          </section>

        @if (ata()?.tipo === 'sacramental' && sac()) {
          <section class="doc__section">
            <h3>Saudações e boas-vindas</h3>
            @if (modo() === 'completo' && tpl()?.boasVindas) {
              <p class="doc__texto">{{ substituir(tpl()?.boasVindas) }}</p>
            }
            <p><strong>Presidida por:</strong> {{ sac()?.presidido || '—' }}</p>
            <p><strong>Dirigida por:</strong> {{ sac()?.dirigido || '—' }}</p>
            @if ((sac()?.reconhecemosPresenca?.length ?? 0) > 0) {
              <p><strong>Reconhecemos a presença de:</strong></p>
              <ul>
                @for (n of sac()?.reconhecemosPresenca; track n) { <li>{{ n }}</li> }
              </ul>
            }
          </section>

          @if ((sac()?.anuncios?.length ?? 0) > 0) {
            <section class="doc__section">
              <h3>Anúncios</h3>
              <ul>
                @for (a of sac()?.anuncios; track a) { <li>{{ a }}</li> }
              </ul>
            </section>
          }

          <section class="doc__section">
            <h3>Abertura</h3>
            <p><strong>Recepcionista:</strong> {{ sac()?.recepcionistas || '—' }}</p>
            <p><strong>Pianista:</strong> {{ sac()?.pianista || '—' }}</p>
            <p><strong>Regente de Música:</strong> {{ sac()?.regenteMusica || '—' }}</p>
            <p><strong>Hino de Abertura:</strong> {{ sac()?.hinoAbertura || '—' }}</p>
            <p><strong>Oração de Abertura:</strong> {{ sac()?.oracaoAbertura || '—' }}</p>
          </section>

          @if (assuntosDaAla()) {
          <section class="doc__section">
            <h3>Assuntos da ala</h3>
            @if ((sac()?.desobrigacoes?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Desobrigações</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.desobrigacoes ?? [], tpl()?.desobrigacoes, tpl()?.desobrigacoesPlural, 'desobrigacao') }}</p>
              }
              <ul><li *ngFor="let d of sac()?.desobrigacoes">{{ d.nome }}{{ d.chamado ? ' — ' + d.chamado : '' }}</li></ul>
            }
            @if ((sac()?.apoios?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Apoios / novos chamados</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.apoios ?? [], tpl()?.apoios, tpl()?.apoiosPlural, 'apoio') }}</p>
              }
              <ul><li *ngFor="let a of sac()?.apoios">{{ a.nome }}{{ a.chamado ? ' — ' + a.chamado : '' }}</li></ul>
            }
            @if ((sac()?.confirmacoesBatismo?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Confirmações de batismo</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.confirmacoesBatismo ?? [], tpl()?.confirmacoesBatismo, tpl()?.confirmacoesBatismoPlural, 'nomes') }}</p>
              }
              <ul><li *ngFor="let c of sac()?.confirmacoesBatismo">{{ c }}</li></ul>
            }
            @if ((sac()?.apoioMembros?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Apoio a membros novos</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.apoioMembros ?? [], tpl()?.apoioMembroNovo, tpl()?.apoioMembroNovoPlural, 'nomes') }}</p>
              }
              <ul><li *ngFor="let a of sac()?.apoioMembros">{{ a }}</li></ul>
            }
            @if ((sac()?.bencaoCriancas?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Bênção de crianças</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.bencaoCriancas ?? [], tpl()?.bencaoCrianca, tpl()?.bencaoCriancaPlural, 'crianca') }}</p>
              }
              <ul><li *ngFor="let b of sac()?.bencaoCriancas">{{ b }}</li></ul>
            }
            @if ((sac()?.ordenacoes?.length ?? 0) > 0) {
              <h4 class="doc__subtitulo">Ordenações de sacerdócio</h4>
              @if (modo() === 'completo') {
                <p class="doc__texto">{{ montarTexto(sac()?.ordenacoes ?? [], tpl()?.ordenacoes, tpl()?.ordenacoesPlural, 'ordenacao') }}</p>
              }
              <ul><li *ngFor="let o of sac()?.ordenacoes">{{ o.nome }}{{ o.chamado ? ' — ' + o.chamado : '' }}</li></ul>
            }
          </section>
          }

          <section class="doc__section">
            <h3>Sacramento</h3>
            @if (modo() === 'completo' && tpl()?.sacramento) {
              <p class="doc__texto">{{ substituir(tpl()?.sacramento) }}</p>
            }
            <p><strong>Hino Sacramental:</strong> {{ sac()?.hinoSacramental || '—' }}</p>
          </section>

          @if (primeiroDomingo()) {
            <section class="doc__section">
              <h3>Mensagens e Testemunhos</h3>
              @if (modo() === 'completo' && tpl()?.mensagens) {
                <p class="doc__texto">{{ substituir(tpl()?.mensagens) }}</p>
              }
              @if ((sac()?.testemunhos?.length ?? 0) > 0) {
                <p><strong>Testemunhos prestados:</strong></p>
                <ol>
                  @for (t of sac()?.testemunhos; track $index) { <li>{{ t }}</li> }
                </ol>
              }
              <button type="button" class="doc__btn-testemunho" (click)="abrirAdicionarTestemunhos()">
                <span nz-icon nzType="plus"></span>
                Adicionar testemunhos
              </button>
            </section>
          } @else {
            <section class="doc__section">
              <h3>Discursantes</h3>
              @if (modo() === 'completo' && tpl()?.mensagens) {
                <p class="doc__texto">{{ substituir(tpl()?.mensagens) }}</p>
              }
              <p><strong>Primeiro Discursante:</strong> {{ sac()?.discursante1 || '—' }}</p>
              @if (sac()?.tema1) { <p><strong>Tema:</strong> {{ sac()?.tema1 }}</p> }
              <p><strong>Segundo Discursante:</strong> {{ sac()?.discursante2 || '—' }}</p>
              @if (sac()?.tema2) { <p><strong>Tema:</strong> {{ sac()?.tema2 }}</p> }
              <p><strong>Hino Intermediário:</strong> {{ sac()?.hinoIntermediario || '—' }}</p>
            </section>
          }

          <section class="doc__section">
            <h3>Encerramento</h3>
            @if (modo() === 'completo' && tpl()?.encerramento) {
              <p class="doc__texto">{{ substituir(tpl()?.encerramento) }}</p>
            }
            @if (!primeiroDomingo()) {
              <p><strong>Último Discursante:</strong> {{ sac()?.ultimoDiscursante || '—' }}</p>
              @if (sac()?.temaUltimo) { <p><strong>Tema:</strong> {{ sac()?.temaUltimo }}</p> }
            }
            <p><strong>Hino de Encerramento:</strong> {{ sac()?.hinoEncerramento || '—' }}</p>
            <p><strong>Oração de Encerramento:</strong> {{ sac()?.oracaoEncerramento || '—' }}</p>
            @if (sac()?.outros) { <p><strong>Observações:</strong> {{ sac()?.outros }}</p> }
          </section>
        }

        @if (ata()?.tipo === 'batismo' && bat()) {
          <section class="doc__section">
            <h3>Condução do serviço</h3>
            @if (bat()?.dedicado) { <p><strong>Dedicado a:</strong> {{ bat()?.dedicado }}</p> }
            <p><strong>Presidido por:</strong> {{ bat()?.presidido || '—' }}</p>
            <p><strong>Dirigido por:</strong> {{ bat()?.dirigido || '—' }}</p>
          </section>

          <section class="doc__section">
            <h3>Batizados</h3>
            <ul>
              @for (b of bat()?.batizados; track b.nome) {
                <li>{{ b.nome }}{{ b.batizador ? ' — batizado(a) por ' + b.batizador : '' }}</li>
              }
            </ul>
          </section>

          <section class="doc__section">
            <h3>Testemunhas</h3>
            <p>{{ bat()?.testemunha1 || '—' }}</p>
            <p>{{ bat()?.testemunha2 || '—' }}</p>
          </section>
        }

        @if ((ata()?.tipo === 'sacramental' && !sac()) || (ata()?.tipo === 'batismo' && !bat())) {
          <p class="doc__empty">Esta ata ainda não foi preenchida.</p>
        }
        </div>
      </article>
    }

    @if (opcoesVisible()) {
      <app-bottom-sheet
        titulo="Visualização"
        [mostrarAcoes]="false"
        (fechar)="opcoesVisible.set(false)"
      >
        <button class="modo-card" [class.modo-card--ativa]="modo() === 'simples'" (click)="selecionarModo('simples')">
          <span class="modo-card__icon" nz-icon nzType="unordered-list"></span>
          <span class="modo-card__corpo">
            <span class="modo-card__titulo">Simples</span>
            <span class="modo-card__desc">Sem os textos de leitura, apenas os dados da ata.</span>
          </span>
          <span class="modo-card__check" [class.modo-card__check--visivel]="modo() === 'simples'" nz-icon nzType="check"></span>
        </button>
        <button class="modo-card" [class.modo-card--ativa]="modo() === 'completo'" (click)="selecionarModo('completo')">
          <span class="modo-card__icon" nz-icon nzType="file-text"></span>
          <span class="modo-card__corpo">
            <span class="modo-card__titulo">Completo</span>
            <span class="modo-card__desc">Com os textos padrão para leitura e os dados da ata.</span>
          </span>
          <span class="modo-card__check" [class.modo-card__check--visivel]="modo() === 'completo'" nz-icon nzType="check"></span>
        </button>

        <div class="fonte-bloco">
          <p class="fonte-rotulo">Tamanho da fonte</p>
          <div class="fonte-controles">
            <button class="fonte-btn" (click)="diminuirFonte()" aria-label="Diminuir fonte">A−</button>
            <span class="fonte-valor">{{ fontSize() }}px</span>
            <button class="fonte-btn" (click)="aumentarFonte()" aria-label="Aumentar fonte">A+</button>
          </div>
        </div>

        <button class="modo-card modo-card--acao" (click)="gerarPdf()">
          <span class="modo-card__icon" nz-icon nzType="export"></span>
          <span class="modo-card__corpo">
            <span class="modo-card__titulo">Gerar PDF</span>
            <span class="modo-card__desc">Abre a opção de impressão para salvar esta ata em PDF.</span>
          </span>
          <span class="modo-card__seta" nz-icon nzType="right"></span>
        </button>
      </app-bottom-sheet>
    }

    @if (adicionarTestemunhosVisible()) {
      <app-bottom-sheet
        titulo="Adicionar testemunhos"
        subtitulo="Irmãos que prestaram testemunho nesta reunião de jejum"
        [salvando]="salvandoTestemunhos()"
        rotuloSalvar="Salvar"
        [mostrarCancelar]="true"
        rotuloCancelar="Voltar"
        (salvar)="salvarTestemunhos()"
        (fechar)="adicionarTestemunhosVisible.set(false)"
      >
        <app-tag-list-input
          [(ngModel)]="testemunhosDraft"
          placeholder="Nome de quem testemunhou..."
          chipColor="#4c7a5d"
        ></app-tag-list-input>
      </app-bottom-sheet>
    }
  `,
  styles: [
    `
      .loading-box {
        padding: 20px;
      }

      .doc {
        margin: 16px;
        background: var(--paper-raised);
        border: 1px solid var(--line);
        border-top: 4px solid var(--primary);
        border-radius: var(--radius);
        padding: 24px 20px calc(var(--bottom-nav-h) + 24px + var(--safe-bottom));
        animation: docIn 0.3s ease;
      }
      .doc--sacramental { border-top-color: var(--accent-sacramental); }
      .doc--batismo { border-top-color: var(--accent-batismo); }
      @keyframes docIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: none; }
      }
      .doc--cheia {
        padding-bottom: 24px;
      }
      .doc__header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--line);
      }
      .doc__status {
        display: inline-block;
        padding: 3px 12px;
        border-radius: 12px;
        background: rgba(76, 122, 93, 0.12);
        color: var(--success);
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .doc__status--rascunho {
        background: rgba(156, 107, 48, 0.12);
        color: var(--accent-sacramental);
      }
      .doc__ala-name {
        font-family: var(--font-display);
        font-size: calc(var(--doc-font-size, 14px) + 4px);
        font-weight: 700;
        color: var(--ink);
        margin-bottom: 8px;
        line-height: 1.3;
      }
      .doc__header p {
        font-size: calc(var(--doc-font-size, 14px) - 0.5px);
        line-height: 1.5;
        margin: 2px 0;
      }
      .doc__header *,
      .doc__section * {
        transition: font-size 0.15s ease;
      }
      .doc__section {
        margin-bottom: 22px;
      }
      .doc__section h3 {
        font-family: var(--font-display);
        font-size: calc(var(--doc-font-size, 14px) + 1px);
        color: var(--ink);
        border-bottom: 1px solid var(--line);
        padding-bottom: 6px;
        margin-bottom: 10px;
      }
      .doc__section p {
        font-size: var(--doc-font-size, 14px);
        line-height: 1.55;
        margin: 4px 0;
      }
      .doc__texto {
        margin: 0 0 10px !important;
        padding: 10px 12px;
        background: var(--paper);
        border-left: 3px solid var(--primary);
        border-radius: 0 8px 8px 0;
        line-height: 1.6 !important;
      }
      .doc__subtitulo {
        font-size: calc(var(--doc-font-size, 14px) + 1px);
        font-weight: 600;
        color: var(--ink);
        margin: 14px 0 6px;
      }
      .doc__section ul,
      .doc__section ol {
        margin: 4px 0 8px;
        padding-left: 20px;
      }
      .doc__section li {
        font-size: var(--doc-font-size, 14px);
        line-height: 1.5;
      }
      .doc__btn-testemunho {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        padding: 8px 14px;
        border: 1.5px solid var(--line);
        border-radius: 20px;
        background: var(--paper-raised);
        color: var(--primary);
        font-family: var(--font-body);
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .doc__btn-testemunho:active { background: #f0eef6; }
      .doc__empty {
        color: var(--ink-soft);
        text-align: center;
        padding: 20px 0;
      }

      /* ── Bottom sheet de visualização ── */
      .modo-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 14px;
        margin-bottom: 10px;
        background: var(--paper);
        border: 1.5px solid var(--line);
        border-radius: var(--radius);
        cursor: pointer;
        text-align: left;
        -webkit-tap-highlight-color: transparent;
      }
      .modo-card--ativa {
        border-color: var(--primary);
        background: #f4effb;
      }
      .modo-card__icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: var(--paper-raised);
        color: var(--primary);
        font-size: 20px;
      }
      .modo-card__corpo {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .modo-card__titulo {
        font-size: 15px;
        font-weight: 700;
        color: var(--ink);
      }
      .modo-card__desc {
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--ink-soft);
      }
      .modo-card__check {
        color: var(--primary);
        font-size: 18px;
        opacity: 0;
      }
      .modo-card__check--visivel {
        opacity: 1;
      }
      .fonte-bloco {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid var(--line);
      }
      .fonte-rotulo {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--ink-soft);
        margin-bottom: 10px;
        text-align: center;
      }
      .fonte-controles {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }
      .fonte-btn {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid var(--line);
        border-radius: 10px;
        background: var(--paper);
        color: var(--ink);
        font-size: 17px;
        font-weight: 700;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .fonte-btn:active { background: #f0eef6; }
      .fonte-btn:disabled { opacity: 0.45; }
      .fonte-valor {
        min-width: 48px;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        color: var(--ink);
      }
      .modo-card--acao {
        margin-top: 14px;
        margin-bottom: 0;
      }
      .modo-card__seta {
        color: var(--ink-soft);
        font-size: 16px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class AtaPreviewComponent implements OnInit, OnDestroy {
  ataId!: number;
  ata = signal<AtaResponse | null>(null);
  sac = signal<SacramentalData | null>(null);
  bat = signal<BatismoData | null>(null);
  unidade = signal<UnidadeData | null>(null);
  tpl = signal<TemplateResponse | null>(null);
  loading = signal(true);
  telaCheia = signal(false);
  opcoesVisible = signal(false);
  adicionarTestemunhosVisible = signal(false);
  salvandoTestemunhos = signal(false);
  testemunhosDraft: string[] = [];
  modo = signal<ModoVisualizacao>(this.modoSalvo());
  fontSize = signal<number>(this.fontSalvo());

  private readonly MODO_KEY = 'atas_modo_visualizacao';
  private readonly FONTE_KEY = 'atas_fonte_visualizacao';

  private configService = inject(ConfiguracoesService);
  private authService = inject(AuthService);
  private actionBar = inject(ActionBarService);
  private modal = inject(NzModalService);
  private msg = inject(NzMessageService);
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ataService: AtaService,
    private sacramentalService: SacramentalService,
    private batismoService: BatismoService
  ) {}

  ngOnInit(): void {
    this.ataId = Number(this.route.snapshot.paramMap.get('id'));

    this.actionBar.left.set({ label: 'Voltar', icon: 'arrow-left', iconOnly: true });
    this.actionBar.right.set({ label: 'Editar', icon: 'edit' });
    this.actionBar.rightSecondary.set({ label: 'Deletar', icon: 'delete', iconOnly: true });
    this.subs.push(
      this.actionBar.leftClicked$.subscribe(() => this.voltar()),
      this.actionBar.rightClicked$.subscribe(() => this.editar()),
      this.actionBar.rightSecondaryClicked$.subscribe(() => this.deletar()),
    );

    this.configService.getUnidade().subscribe((u) => this.unidade.set(u));

    this.ataService.getById(this.ataId).subscribe((ata) => {
      this.ata.set(ata);

      // Template da ata: Testemunhos (tipo 2) no 1º domingo, Sacramental Padrão (tipo 1) nos demais.
      this.configService.getTemplates().subscribe((res) => {
        if (res && res.length > 0) {
          const alvo = this.primeiroDomingo() ? 2 : 1;
          this.tpl.set(res.find((t) => t.tipoTemplate === alvo) ?? res[0]);
        }
      });

      if (ata.tipo === 'sacramental') {
        this.sacramentalService
          .getByAtaId(this.ataId)
          .pipe(catchError(() => of(null)))
          .subscribe((detail) => {
            this.sac.set(detail);
            this.loading.set(false);
          });
      } else {
        this.batismoService
          .getByAtaId(this.ataId)
          .pipe(catchError(() => of(null)))
          .subscribe((detail) => {
            this.bat.set(detail);
            this.loading.set(false);
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.actionBar.clear();
    this.actionBar.setHidden(false);
  }

  dataFormatada(): string {
    const d = this.ata()?.data;
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  statusLabel(): string {
    return this.ata()?.status === 'rascunho' ? 'Rascunho' : 'Concluída';
  }

  /** Reunião de jejum/testemunhos: primeiro domingo do mês (dia ≤ 7). */
  primeiroDomingo(): boolean {
    const d = this.ata()?.data;
    if (!d) return false;
    const [y, m, day] = d.split('-').map(Number);
    if (!y || !m || !day) return false;
    return new Date(y, m - 1, day).getDay() === 0 && day <= 7;
  }

  /** Assuntos da ala só aparece se houver ao menos um assunto registrado. */
  assuntosDaAla(): boolean {
    const sac = this.sac();
    if (!sac) return false;
    return (sac.desobrigacoes?.length ?? 0) > 0
      || (sac.apoios?.length ?? 0) > 0
      || (sac.confirmacoesBatismo?.length ?? 0) > 0
      || (sac.apoioMembros?.length ?? 0) > 0
      || (sac.bencaoCriancas?.length ?? 0) > 0
      || (sac.ordenacoes?.length ?? 0) > 0;
  }

  alaTitulo(): string {
    return this.unidade()?.nome || this.authService.alaTitle() || 'Ala';
  }

  substituir(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto
      .replaceAll('[ALA]', this.alaNome())
      .replaceAll('[DATA]', this.dataLonga());
  }

  montarTexto(
    itens: ChamadoItem[] | string[],
    singular: string | null | undefined,
    plural: string | null | undefined,
    tipo: 'desobrigacao' | 'apoio' | 'ordenacao' | 'nomes' | 'crianca'
  ): string {
    const n = itens.length;
    if (!n) return '';
    const base = n === 1 ? (singular || plural || '') : (plural || singular || '');
    if (!base) return '';
    let texto = base
      .replaceAll('[ALA]', this.alaNome())
      .replaceAll('[DATA]', this.dataLonga());
    if (n === 1) {
      if (tipo === 'nomes') {
        return texto.replaceAll('[NOME]', String(itens[0]));
      }
      if (tipo === 'crianca') {
        return texto.replaceAll('[NOME DA CRIANÇA]', String(itens[0]));
      }
      const i = itens[0] as ChamadoItem;
      return texto.replaceAll('[NOME]', i.nome).replaceAll('[CHAMADO]', i.chamado);
    }
    const partes = tipo === 'nomes' || tipo === 'crianca'
      ? itens.map((i) => String(i))
      : itens.map((i) => this.clausula(tipo, i as ChamadoItem));
    return texto.replaceAll('[LISTA]', juntar(partes));
  }

  private clausula(tipo: 'desobrigacao' | 'apoio' | 'ordenacao', i: ChamadoItem): string {
    switch (tipo) {
      case 'desobrigacao':
        return `${i.nome} está sendo desobrigado(a) como ${i.chamado}`;
      case 'apoio':
        return `${i.nome} foi chamado(a) para servir como ${i.chamado}`;
      case 'ordenacao':
        return `É proposto que ${i.nome} receba o Sacerdócio de Melquisedeque e seja ordenado(a) como ${i.chamado}`;
    }
  }

  private alaNome(): string {
    const unidade = this.unidade()?.nome?.replace(/^Ala\s+/i, '');
    return this.authService.alaName() || unidade || 'Ala';
  }

  private dataLonga(): string {
    const d = this.ata()?.data;
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const mes = MESES[Number(m) - 1];
    return `${Number(day)} de ${mes} de ${y}`;
  }

  selecionarModo(modo: ModoVisualizacao): void {
    this.modo.set(modo);
    localStorage.setItem(this.MODO_KEY, modo);
    this.opcoesVisible.set(false);
  }

  private modoSalvo(): ModoVisualizacao {
    return localStorage.getItem(this.MODO_KEY) === 'simples' ? 'simples' : 'completo';
  }

  aumentarFonte(): void {
    if (this.fontSize() >= 20) return;
    this.fontSize.update((v) => v + 1);
    localStorage.setItem(this.FONTE_KEY, String(this.fontSize()));
  }

  diminuirFonte(): void {
    if (this.fontSize() <= 12) return;
    this.fontSize.update((v) => v - 1);
    localStorage.setItem(this.FONTE_KEY, String(this.fontSize()));
  }

  private fontSalvo(): number {
    const v = Number(localStorage.getItem(this.FONTE_KEY));
    return v >= 12 && v <= 20 ? v : 14;
  }

  alternarTelaCheia(): void {
    this.telaCheia.update((v) => !v);
    this.actionBar.setHidden(this.telaCheia());
  }

  /**
   * Gera o PDF usando a impressão nativa do navegador — na caixa de
   * impressão o usuário escolhe "Salvar como PDF" como destino.
   * Evita depender de bibliotecas externas (jsPDF/html2canvas).
   */
  gerarPdf(): void {
    this.opcoesVisible.set(false);
    // pequena espera para o bottom sheet terminar de fechar antes de imprimir
    setTimeout(() => window.print(), 250);
  }

  editar(): void {
    const tipo = this.ata()?.tipo;
    if (tipo) this.router.navigate(['/atas', this.ataId, tipo]);
  }

  deletar(): void {
    this.modal.confirm({
      nzTitle: 'Excluir ata?',
      nzContent: 'Essa ação não pode ser desfeita.',
      nzOkText: 'Excluir',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.ataService.delete(this.ataId).subscribe({
          next: () => this.router.navigate(['/atas']),
        });
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/atas']);
  }

  abrirAdicionarTestemunhos(): void {
    this.testemunhosDraft = [...(this.sac()?.testemunhos ?? [])];
    this.adicionarTestemunhosVisible.set(true);
  }

  salvarTestemunhos(): void {
    const sac = this.sac();
    if (!sac) return;
    this.salvandoTestemunhos.set(true);
    const payload: SacramentalData = { ...sac, testemunhos: [...this.testemunhosDraft] };
    this.sacramentalService.update(this.ataId, payload).subscribe({
      next: (atualizado) => {
        this.sac.set(atualizado);
        this.salvandoTestemunhos.set(false);
        this.adicionarTestemunhosVisible.set(false);
        this.msg.success('Testemunhos salvos!');
        this.ataService.getById(this.ataId).subscribe((ata) => this.ata.set(ata));
      },
      error: () => {
        this.salvandoTestemunhos.set(false);
        this.msg.error('Não foi possível salvar os testemunhos.');
      },
    });
  }
}