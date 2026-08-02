import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { DiscursantesService, HinosService } from '../../../core/services';
import { AuthService } from '../../../core/services/auth.service';
import { DiscursantesState, DiscursanteSugestao } from '../../../core/models/discursantes.model';
import { Hino } from '../../../core/models/hinos.model';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet.component';

interface SundayData {
  date: string;
  label: string;
  dayNum: number;
  isFirst: boolean;
  state: DiscursantesState | null;
  expanded: boolean;
  saving: boolean;
  loaded: boolean;
  form: {
    discursante1: string;
    discursante2: string;
    discursante3: string;
    tema: string;
    tema1: string;
    tema2: string;
    tema3: string;
    hinoAbertura: string;
    hinoSacramental: string;
    hinoIntermediario: string;
    hinoEncerramento: string;
    oracaoAbertura: string;
    oracaoEncerramento: string;
  };
}

interface MonthGroup {
  year: number;
  month: number;
  label: string;
  sundays: SundayData[];
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzAutocompleteModule,
    NzSkeletonModule,
    NzCollapseModule,
    PageHeadComponent,
    BottomSheetComponent,
  ],
  template: `
    <app-page-head [eyebrow]="auth.alaTitle()" titulo="Planejamento"></app-page-head>

    @if (activeSegment() === 'atas') {
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
    }

    @if (activeSegment() === 'atas') {
      <div class="planning">
        <p class="planning__lead">
          Planeje os discursos e hinos das reuniões sacramentais do mês.
        </p>

        @if (loading()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 6 }"></nz-skeleton>
        } @else {
          @for (s of sundays(); track s.date) {
            <div class="sunday-card" [class.sunday-card--testimony]="s.isFirst" [class.sunday-card--has-data]="hasData(s)">
              <div class="sunday-card__header" (click)="toggleExpand(s)">
                <div class="sunday-card__header-left">
                  <span class="sunday-card__day">{{ s.dayNum }}</span>
                  <div class="sunday-card__meta">
                    <span class="sunday-card__label">{{ s.label }}</span>
                    @if (s.isFirst) {
                      <span class="sunday-card__badge">Jejum e Testemunhos</span>
                    } @else if (hasData(s)) {
                      <span class="sunday-card__badge sunday-card__badge--filled">Preenchido</span>
                    }
                  </div>
                </div>
                <span nz-icon [nzType]="s.expanded ? 'up' : 'down'" class="sunday-card__arrow"></span>
              </div>

              @if (s.expanded) {
                <div class="sunday-card__body">
                  @if (!s.loaded) {
                    <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 3 }"></nz-skeleton>
                  } @else {
                    @if (s.isFirst) {
                      <p class="sunday-card__info">Primeiro domingo do mês — Reunião de Jejum e Testemunhos. Somente hinos.</p>
                    } @else {
                      <div class="form-section">
                        <label class="field-label">Tema da reunião</label>
                        <input nz-input [(ngModel)]="s.form.tema" placeholder="Tema geral (opcional)" />
                      </div>

                      <div class="form-section">
                        <label class="field-label">Discursante 1</label>
                        <input nz-input [(ngModel)]="s.form.discursante1" placeholder="Nome" />
                        <label class="field-sublabel">Tema</label>
                        <input nz-input [(ngModel)]="s.form.tema1" placeholder="Tema (opcional)" />
                      </div>

                      <div class="form-section">
                        <label class="field-label">Discursante 2</label>
                        <input nz-input [(ngModel)]="s.form.discursante2" placeholder="Nome" />
                        <label class="field-sublabel">Tema</label>
                        <input nz-input [(ngModel)]="s.form.tema2" placeholder="Tema (opcional)" />
                      </div>

                      <div class="form-section">
                        <label class="field-label">Discursante 3 (encerramento)</label>
                        <input nz-input [(ngModel)]="s.form.discursante3" placeholder="Nome" />
                        <label class="field-sublabel">Tema</label>
                        <input nz-input [(ngModel)]="s.form.tema3" placeholder="Tema (opcional)" />
                      </div>
                    }

                      <div class="hinos-section">
                        <label class="field-label">Hinos</label>
                        <div class="hino-field">
                          <input nz-input [(ngModel)]="s.form.hinoAbertura" placeholder="Hino de abertura — nº ou nome" [nzAutocomplete]="autoHinoAbertura" (input)="buscarHino('abertura', s.form.hinoAbertura)" />
                        </div>
                        <div class="hino-field">
                          <input nz-input [(ngModel)]="s.form.hinoSacramental" placeholder="Hino sacramental — nº ou nome" [nzAutocomplete]="autoHinoSacramento" (input)="buscarHino('sacramento', s.form.hinoSacramental)" />
                        </div>
                        <div class="hino-field">
                          <input nz-input [(ngModel)]="s.form.hinoIntermediario" placeholder="Hino intermediário — nº ou nome" [nzAutocomplete]="autoHinoIntermediario" (input)="buscarHino('intermediario', s.form.hinoIntermediario)" />
                        </div>
                        <div class="hino-field">
                          <input nz-input [(ngModel)]="s.form.hinoEncerramento" placeholder="Hino de encerramento — nº ou nome" [nzAutocomplete]="autoHinoEncerramento" (input)="buscarHino('encerramento', s.form.hinoEncerramento)" />
                        </div>
                      </div>

                      <nz-autocomplete #autoHinoAbertura>
                        @for (h of hinosAbertura(); track h.numero) {
                          <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
                        }
                      </nz-autocomplete>
                      <nz-autocomplete #autoHinoSacramento>
                        @for (h of hinosSacramento(); track h.numero) {
                          <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
                        }
                      </nz-autocomplete>
                      <nz-autocomplete #autoHinoIntermediario>
                        @for (h of hinosIntermediario(); track h.numero) {
                          <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
                        }
                      </nz-autocomplete>
                      <nz-autocomplete #autoHinoEncerramento>
                        @for (h of hinosEncerramento(); track h.numero) {
                          <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
                        }
                      </nz-autocomplete>

                      <button
                        nz-button
                        nzType="primary"
                        nzBlock
                        [nzLoading]="s.saving"
                        (click)="salvar(s)"
                      >
                        Salvar
                      </button>
                  }
                </div>
              }
            </div>
          }
        }
      </div>
    }

    <!-- ═══ DISCURSANTES ═══ -->
    @if (activeSegment() === 'discursantes') {
      <div class="list-view">
        <p class="list-view__lead">
          Discursantes dos últimos 3 meses e próximos 3 meses.
        </p>
        @if (loadingLists()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 8 }"></nz-skeleton>
        } @else {
          @for (m of discursantesData(); track m.year + '-' + m.month) {
            <div class="month-section" [id]="'month-' + m.year + '-' + m.month" [class.month-section--current]="isCurrentMonth(m)">
              <div class="month-section__header">
                <span class="month-section__title">{{ m.label }}</span>
                <span class="month-section__count">{{ m.sundays.length }} domingo{{ m.sundays.length > 1 ? 's' : '' }}</span>
              </div>
              @for (s of m.sundays; track s.date) {
                @if (!s.isFirst) {
                <div class="list-row">
                  <div class="list-row__day">
                    <span class="list-row__daynum">{{ s.dayNum }}</span>
                    <span class="list-row__weekday">{{ s.label }}</span>
                  </div>
                  <div class="list-row__content">
                    @if (s.state) {
                      @if (s.state.discursante1) {
                        <div class="list-row__speaker">
                          <span class="speaker-pos">1º</span>
                          <div class="speaker-info">
                            <span class="speaker-name">{{ s.state.discursante1 }}</span>
                            @if (s.state.tema1) {
                              <span class="speaker-theme">{{ s.state.tema1 }}</span>
                            }
                          </div>
                        </div>
                      }
                      @if (s.state.discursante2) {
                        <div class="list-row__speaker">
                          <span class="speaker-pos">2º</span>
                          <div class="speaker-info">
                            <span class="speaker-name">{{ s.state.discursante2 }}</span>
                            @if (s.state.tema2) {
                              <span class="speaker-theme">{{ s.state.tema2 }}</span>
                            }
                          </div>
                        </div>
                      }
                      @if (s.state.discursante3) {
                        <div class="list-row__speaker">
                          <span class="speaker-pos speaker-pos--last">3º</span>
                          <div class="speaker-info">
                            <span class="speaker-name">{{ s.state.discursante3 }}</span>
                            @if (s.state.tema3) {
                              <span class="speaker-theme">{{ s.state.tema3 }}</span>
                            }
                          </div>
                        </div>
                      }
                    } @else {
                      <span class="list-row__empty">Sem dados</span>
                    }
                    @if (isFuture(s.date)) {
                      <button class="list-row__edit" (click)="openSheet('discursantes', s)">
                        <span nz-icon [nzType]="s.state?.discursante1 ? 'edit' : 'plus'" nzTheme="outline"></span>
                        {{ s.state?.discursante1 ? 'Editar' : 'Adicionar' }}
                      </button>
                    }
                  </div>
                </div>
                }
              }
            </div>
          }
          @if (discursantesData().length === 0) {
            <div class="list-view__empty">
              <span nz-icon nzType="calendar" nzTheme="outline" class="list-view__empty-icon"></span>
              <p>Nenhum discursante encontrado nos últimos 3 meses.</p>
            </div>
          }
        }
      </div>
    }

    <!-- ═══ HINOS ═══ -->
    @if (activeSegment() === 'hinos') {
      <div class="list-view">
        <p class="list-view__lead">
          Hinos dos últimos 3 meses e próximos 3 meses.
        </p>
        @if (loadingLists()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 8 }"></nz-skeleton>
        } @else {
          @for (m of hinosData(); track m.year + '-' + m.month) {
            <div class="month-section" [id]="'month-' + m.year + '-' + m.month" [class.month-section--current]="isCurrentMonth(m)">
              <div class="month-section__header">
                <span class="month-section__title">{{ m.label }}</span>
                <span class="month-section__count">{{ m.sundays.length }} domingo{{ m.sundays.length > 1 ? 's' : '' }}</span>
              </div>
              @for (s of m.sundays; track s.date) {
                <div class="list-row">
                  <div class="list-row__day">
                    <span class="list-row__daynum">{{ s.dayNum }}</span>
                    <span class="list-row__weekday">{{ s.label }}</span>
                  </div>
                  <div class="list-row__content">
                    @if (s.state) {
                      @if (s.state.hinoAbertura) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--abertura">Abertura</span>
                          <span class="hino-name">{{ s.state.hinoAbertura }}</span>
                        </div>
                      }
                      @if (s.state.hinoSacramental) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--sacramento">Sacramento</span>
                          <span class="hino-name">{{ s.state.hinoSacramental }}</span>
                        </div>
                      }
                      @if (s.state.hinoIntermediario) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--intermediario">Intermediário</span>
                          <span class="hino-name">{{ s.state.hinoIntermediario }}</span>
                        </div>
                      }
                      @if (s.state.hinoEncerramento) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--encerramento">Encerramento</span>
                          <span class="hino-name">{{ s.state.hinoEncerramento }}</span>
                        </div>
                      }
                    } @else {
                      <span class="list-row__empty">Sem dados</span>
                    }
                    @if (isFuture(s.date)) {
                      <button class="list-row__edit" (click)="openSheet('hinos', s)">
                        <span nz-icon [nzType]="s.state?.hinoAbertura ? 'edit' : 'plus'" nzTheme="outline"></span>
                        {{ s.state?.hinoAbertura ? 'Editar' : 'Adicionar' }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @if (hinosData().length === 0) {
            <div class="list-view__empty">
              <span nz-icon nzType="music" nzTheme="outline" class="list-view__empty-icon"></span>
              <p>Nenhum hino encontrado nos últimos 3 meses.</p>
            </div>
          }
        }
      </div>
    }

    <!-- ═══ ORAÇÕES ═══ -->
    @if (activeSegment() === 'oracoes') {
      <div class="list-view">
        <p class="list-view__lead">
          Orações dos últimos 3 meses e próximos 3 meses.
        </p>
        @if (loadingLists()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 8 }"></nz-skeleton>
        } @else {
          @for (m of oracoesData(); track m.year + '-' + m.month) {
            <div class="month-section" [id]="'month-' + m.year + '-' + m.month" [class.month-section--current]="isCurrentMonth(m)">
              <div class="month-section__header">
                <span class="month-section__title">{{ m.label }}</span>
                <span class="month-section__count">{{ m.sundays.length }} domingo{{ m.sundays.length > 1 ? 's' : '' }}</span>
              </div>
              @for (s of m.sundays; track s.date) {
                <div class="list-row">
                  <div class="list-row__day">
                    <span class="list-row__daynum">{{ s.dayNum }}</span>
                    <span class="list-row__weekday">{{ s.label }}</span>
                  </div>
                  <div class="list-row__content">
                    @if (s.state) {
                      @if (s.state.oracaoAbertura) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--abertura">Abertura</span>
                          <span class="hino-name">{{ s.state.oracaoAbertura }}</span>
                        </div>
                      }
                      @if (s.state.oracaoEncerramento) {
                        <div class="list-row__hino">
                          <span class="hino-badge hino-badge--encerramento">Encerramento</span>
                          <span class="hino-name">{{ s.state.oracaoEncerramento }}</span>
                        </div>
                      }
                    } @else {
                      <span class="list-row__empty">Sem dados</span>
                    }
                    @if (isFuture(s.date)) {
                      <button class="list-row__edit" (click)="openSheet('oracoes', s)">
                        <span nz-icon [nzType]="s.state?.oracaoAbertura ? 'edit' : 'plus'" nzTheme="outline"></span>
                        {{ s.state?.oracaoAbertura ? 'Editar' : 'Adicionar' }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @if (oracoesData().length === 0) {
            <div class="list-view__empty">
              <span nz-icon nzType="calendar" nzTheme="outline" class="list-view__empty-icon"></span>
              <p>Nenhuma oração encontrada nos últimos 3 meses.</p>
            </div>
          }
        }
      </div>
    }

    <!-- ═══ Bottom Sheet: Discursantes ═══ -->
    @if (sheetOpen() && sheetType() === 'discursantes') {
      <app-bottom-sheet
        [titulo]="editingSunday()?.state?.discursante1 ? 'Editar discursantes' : 'Adicionar discursantes'"
        [subtitulo]="editingSunday() ? (editingSunday()!.label + ' — ' + editingSunday()!.dayNum) : ''"
        [salvando]="savingSheet()"
        (salvar)="saveSheet()"
        (fechar)="closeSheet()"
      >
        <div class="sheet__fields">
          <div class="field">
            <label class="field-label">1º Discursante</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.discursante1" placeholder="Nome" [nzAutocomplete]="autoDisc1Sheet" (input)="buscarDiscursanteSheet(1, sheetForm.discursante1)" />
            <label class="field-sublabel">Tema</label>
            <input class="field-input field-input--sm" type="text" [(ngModel)]="sheetForm.tema1" placeholder="Tema (opcional)" />
          </div>
          <div class="field">
            <label class="field-label">2º Discursante</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.discursante2" placeholder="Nome" [nzAutocomplete]="autoDisc2Sheet" (input)="buscarDiscursanteSheet(2, sheetForm.discursante2)" />
            <label class="field-sublabel">Tema</label>
            <input class="field-input field-input--sm" type="text" [(ngModel)]="sheetForm.tema2" placeholder="Tema (opcional)" />
          </div>
          <div class="field">
            <label class="field-label">3º Discursante (encerramento)</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.discursante3" placeholder="Nome" [nzAutocomplete]="autoDisc3Sheet" (input)="buscarDiscursanteSheet(3, sheetForm.discursante3)" />
            <label class="field-sublabel">Tema</label>
            <input class="field-input field-input--sm" type="text" [(ngModel)]="sheetForm.tema3" placeholder="Tema (opcional)" />
          </div>
        </div>

        <nz-autocomplete #autoDisc1Sheet>
          @for (s of sugestoesFiltradas1(); track s.nome) {
            <nz-auto-option [nzValue]="s.nome">
              {{ s.nome }} — <span style="font-size:11px;color:var(--primary)">{{ s.posicao }}</span>
              @if (s.ultimaData) {
                <span style="font-size:11px;color:var(--ink-soft);margin-left:4px">{{ formatarData(s.ultimaData) }}</span>
              }
            </nz-auto-option>
          }
        </nz-autocomplete>
        <nz-autocomplete #autoDisc2Sheet>
          @for (s of sugestoesFiltradas2(); track s.nome) {
            <nz-auto-option [nzValue]="s.nome">
              {{ s.nome }} — <span style="font-size:11px;color:var(--primary)">{{ s.posicao }}</span>
              @if (s.ultimaData) {
                <span style="font-size:11px;color:var(--ink-soft);margin-left:4px">{{ formatarData(s.ultimaData) }}</span>
              }
            </nz-auto-option>
          }
        </nz-autocomplete>
        <nz-autocomplete #autoDisc3Sheet>
          @for (s of sugestoesFiltradas3(); track s.nome) {
            <nz-auto-option [nzValue]="s.nome">
              {{ s.nome }} — <span style="font-size:11px;color:var(--primary)">{{ s.posicao }}</span>
              @if (s.ultimaData) {
                <span style="font-size:11px;color:var(--ink-soft);margin-left:4px">{{ formatarData(s.ultimaData) }}</span>
              }
            </nz-auto-option>
          }
        </nz-autocomplete>
      </app-bottom-sheet>
    }

    <!-- ═══ Bottom Sheet: Hinos ═══ -->
    @if (sheetOpen() && sheetType() === 'hinos') {
      <app-bottom-sheet
        [titulo]="editingSunday()?.state?.hinoAbertura ? 'Editar hinos' : 'Adicionar hinos'"
        [subtitulo]="editingSunday() ? (editingSunday()!.label + ' — ' + editingSunday()!.dayNum) : ''"
        [salvando]="savingSheet()"
        (salvar)="saveSheet()"
        (fechar)="closeSheet()"
      >
        <div class="sheet__fields">
          <div class="field">
            <label class="field-label">Hino de abertura</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.hinoAbertura" placeholder="Nº ou nome" [nzAutocomplete]="autoHinoAberturaSheet" (input)="buscarHinoSheet('abertura', sheetForm.hinoAbertura)" />
          </div>
          <div class="field">
            <label class="field-label">Hino sacramental</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.hinoSacramental" placeholder="Nº ou nome" [nzAutocomplete]="autoHinoSacramentoSheet" (input)="buscarHinoSheet('sacramento', sheetForm.hinoSacramental)" />
          </div>
          <div class="field">
            <label class="field-label">Hino intermediário</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.hinoIntermediario" placeholder="Nº ou nome" [nzAutocomplete]="autoHinoIntermediarioSheet" (input)="buscarHinoSheet('intermediario', sheetForm.hinoIntermediario)" />
          </div>
          <div class="field">
            <label class="field-label">Hino de encerramento</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.hinoEncerramento" placeholder="Nº ou nome" [nzAutocomplete]="autoHinoEncerramentoSheet" (input)="buscarHinoSheet('encerramento', sheetForm.hinoEncerramento)" />
          </div>
        </div>

        <nz-autocomplete #autoHinoAberturaSheet>
          @for (h of hinosSearchAbertura(); track h.numero) {
            <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
          }
        </nz-autocomplete>
        <nz-autocomplete #autoHinoSacramentoSheet>
          @for (h of hinosSearchSacramento(); track h.numero) {
            <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
          }
        </nz-autocomplete>
        <nz-autocomplete #autoHinoIntermediarioSheet>
          @for (h of hinosSearchIntermediario(); track h.numero) {
            <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
          }
        </nz-autocomplete>
        <nz-autocomplete #autoHinoEncerramentoSheet>
          @for (h of hinosSearchEncerramento(); track h.numero) {
            <nz-auto-option [nzValue]="h.numero + ' — ' + h.nome">{{ h.numero }} — {{ h.nome }}</nz-auto-option>
          }
        </nz-autocomplete>
      </app-bottom-sheet>
    }

    <!-- ═══ Bottom Sheet: Orações ═══ -->
    @if (sheetOpen() && sheetType() === 'oracoes') {
      <app-bottom-sheet
        [titulo]="editingSunday()?.state?.oracaoAbertura ? 'Editar orações' : 'Adicionar orações'"
        [subtitulo]="editingSunday() ? (editingSunday()!.label + ' — ' + editingSunday()!.dayNum) : ''"
        [salvando]="savingSheet()"
        (salvar)="saveSheet()"
        (fechar)="closeSheet()"
      >
        <div class="sheet__fields">
          <div class="field">
            <label class="field-label">Oração de abertura</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.oracaoAbertura" placeholder="Nome" />
          </div>
          <div class="field">
            <label class="field-label">Oração de encerramento</label>
            <input class="field-input" type="text" [(ngModel)]="sheetForm.oracaoEncerramento" placeholder="Nome" />
          </div>
        </div>
      </app-bottom-sheet>
    }

    <!-- ═══ Segment (fixed above bottom nav) ═══ -->
    <div class="segment-bar">
      <div class="segment">
        <button class="segment__btn" [class.segment__btn--active]="activeSegment() === 'atas'" (click)="setSegment('atas')">Atas</button>
        <button class="segment__btn" [class.segment__btn--active]="activeSegment() === 'discursantes'" (click)="setSegment('discursantes')">Discursantes</button>
        <button class="segment__btn" [class.segment__btn--active]="activeSegment() === 'hinos'" (click)="setSegment('hinos')">Hinos</button>
        <button class="segment__btn" [class.segment__btn--active]="activeSegment() === 'oracoes'" (click)="setSegment('oracoes')">Orações</button>
        <span class="segment__indicator" [style.left]="segmentLeft()"></span>
      </div>
    </div>
  `,
  styles: [`
    .month-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 14px 16px 10px;
      touch-action: pan-y;
      user-select: none;
    }
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

    /* ── Segment selector (fixed above bottom nav) ── */
    .segment-bar {
      position: fixed;
      bottom: var(--bottom-nav-h);
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: var(--frame-max, 560px);
      padding: 0 16px 6px;
      padding-bottom: calc(6px + var(--safe-bottom));
      background: var(--paper);
      z-index: 99;
    }
    .segment {
      display: flex;
      position: relative;
      margin: 0 16px 6px;
      background: var(--gray-100, #f0f0f0);
      border-radius: 10px;
      padding: 3px;
    }
    .segment__btn {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft);
      padding: 8px 0;
      cursor: pointer;
      border-radius: 8px;
      transition: color 0.2s;
      z-index: 1;
      position: relative;
      -webkit-tap-highlight-color: transparent;
    }
    .segment__btn--active {
      color: var(--ink);
    }
    .segment__indicator {
      position: absolute;
      top: 3px;
      bottom: 3px;
      width: calc(100% / 4 - 2px);
      background: var(--paper);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }

    /* ── Atas tab (existing planning) ── */
    .planning {
      padding: 0 16px calc(72px + var(--safe-bottom));
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 768px) {
      .planning {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        align-items: start;
      }
      .sunday-card {
        margin-bottom: 0;
      }
    }
    .planning__lead {
      color: var(--ink-soft);
      font-size: 13.5px;
      line-height: 1.5;
      margin: 0 0 16px;
    }

    .sunday-card {
      background: var(--paper-raised);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      margin-bottom: 10px;
      overflow: hidden;
      transition: border-color 0.15s;
    }
    .sunday-card--has-data {
      border-left: 3px solid var(--accent-sacramental);
    }
    .sunday-card--testimony {
      border-left: 3px solid var(--ink-soft);
      opacity: 0.7;
    }

    .sunday-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      cursor: pointer;
      user-select: none;
    }
    .sunday-card__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sunday-card__day {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      color: var(--ink);
      width: 36px;
      text-align: center;
    }
    .sunday-card__meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sunday-card__label {
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
    }
    .sunday-card__badge {
      font-size: 11px;
      font-weight: 500;
      color: var(--ink-soft);
    }
    .sunday-card__badge--filled {
      color: var(--accent-sacramental);
    }
    .sunday-card__arrow {
      font-size: 12px;
      color: var(--ink-soft);
    }

    .sunday-card__body {
      padding: 0 16px 16px;
      border-top: 1px solid var(--line);
    }
    .sunday-card__info {
      font-size: 13px;
      color: var(--ink-soft);
      padding: 12px 0 4px;
      font-style: italic;
    }

    .form-section {
      margin-top: 14px;
    }
    .field-label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-bottom: 5px;
    }
    .field-sublabel {
      display: block;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--ink-soft);
      margin: 8px 0 4px;
      opacity: 0.7;
    }

    .hinos-section {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed var(--line);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .hinos-section .field-label {
      margin-bottom: 2px;
    }

    /* ── Discursantes / Hinos list tabs ── */
    .list-view {
      padding: 0 16px calc(72px + var(--safe-bottom));
    }
    .list-view__lead {
      color: var(--ink-soft);
      font-size: 13.5px;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .list-view__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 16px;
      color: var(--ink-soft);
    }
    .list-view__empty-icon {
      font-size: 36px;
      margin-bottom: 12px;
      color: var(--primary);
      opacity: 0.45;
    }
    .list-view__empty p {
      font-size: 13.5px;
      text-align: center;
      margin: 0;
    }

    .month-section {
      margin-bottom: 20px;
    }
    .month-section--current {
      border-left: 3px solid var(--primary);
      padding-left: 10px;
      margin-left: -13px;
    }
    .month-section__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0 8px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 8px;
    }
    .month-section__title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
    }
    .month-section__count {
      font-size: 12px;
      color: var(--ink-soft);
    }

    .list-row {
      display: flex;
      gap: 12px;
      padding: 10px 12px;
      background: var(--paper-raised);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      margin-bottom: 6px;
    }
    .list-row__day {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
      flex-shrink: 0;
    }
    .list-row__daynum {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.1;
    }
    .list-row__weekday {
      font-size: 10px;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .list-row__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .list-row__empty {
      font-size: 12.5px;
      color: var(--ink-soft);
      font-style: italic;
      padding: 2px 0;
    }

    .list-row__speaker {
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }
    .speaker-pos {
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-50, #e8f0fe);
      padding: 2px 5px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 2px;
      line-height: 1;
    }
    .speaker-pos--last {
      color: var(--task-purple, #7c3aed);
      background: var(--task-purple-50, #f0e6ff);
    }
    .speaker-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .speaker-name {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .speaker-theme {
      font-size: 12px;
      color: var(--ink-soft);
    }

    .list-row__hino {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hino-badge {
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .hino-badge--abertura {
      background: var(--primary-50, #e8f0fe);
      color: var(--primary);
    }
    .hino-badge--sacramento {
      background: var(--accent-sacramental-50, #fef3e8);
      color: var(--accent-sacramental);
    }
    .hino-badge--intermediario {
      background: var(--task-teal-50, #e6f7f5);
      color: var(--task-teal, #0d9488);
    }
    .hino-badge--encerramento {
      background: var(--task-purple-50, #f0e6ff);
      color: var(--task-purple, #7c3aed);
    }
    .hino-name {
      font-size: 13px;
      color: var(--ink);
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Edit button on list rows ── */
    .list-row__edit {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      padding: 5px 10px;
      border: 1px dashed var(--primary);
      border-radius: 8px;
      background: transparent;
      color: var(--primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .list-row__edit:active {
      background: var(--primary-50, #e8f0fe);
    }
    .list-row__edit .anticon {
      font-size: 12px;
    }

    /* ── Bottom Sheet ── */
    .sheet__fields {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .field-label {
      display: block;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-bottom: 6px;
    }
    .field-sublabel {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: var(--ink-soft);
      margin: 8px 0 4px;
      opacity: 0.7;
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
    .field-input--sm {
      font-size: 13px;
      padding: 8px 10px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(100%); }
      to { transform: translateX(-50%) translateY(0); }
    }
  `],
})
export class PlanningComponent implements OnInit, AfterViewInit {
  currentDate = signal(new Date());
  sundays = signal<SundayData[]>([]);
  loading = signal(true);
  sugestoes = signal<string[]>([]);
  animating = signal(false);

  hinosAbertura = signal<Hino[]>([]);
  hinosSacramento = signal<Hino[]>([]);
  hinosIntermediario = signal<Hino[]>([]);
  hinosEncerramento = signal<Hino[]>([]);

  activeSegment = signal<'atas' | 'discursantes' | 'hinos' | 'oracoes'>('atas');
  discursantesData = signal<MonthGroup[]>([]);
  hinosData = signal<MonthGroup[]>([]);
  oracoesData = signal<MonthGroup[]>([]);
  loadingLists = signal(false);

  sheetOpen = signal(false);
  sheetType = signal<'discursantes' | 'hinos' | 'oracoes'>('discursantes');
  editingSunday = signal<SundayData | null>(null);
  sheetForm = {
    discursante1: '',
    discursante2: '',
    discursante3: '',
    tema1: '',
    tema2: '',
    tema3: '',
    hinoAbertura: '',
    hinoSacramental: '',
    hinoIntermediario: '',
    hinoEncerramento: '',
    oracaoAbertura: '',
    oracaoEncerramento: '',
  };
  savingSheet = signal(false);

  hinosSearchAbertura = signal<Hino[]>([]);
  hinosSearchSacramento = signal<Hino[]>([]);
  hinosSearchIntermediario = signal<Hino[]>([]);
  hinosSearchEncerramento = signal<Hino[]>([]);

  sugestoesDiscursantes = signal<DiscursanteSugestao[]>([]);
  sugestoesFiltradas1 = signal<DiscursanteSugestao[]>([]);
  sugestoesFiltradas2 = signal<DiscursanteSugestao[]>([]);
  sugestoesFiltradas3 = signal<DiscursanteSugestao[]>([]);

  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    private discursantesService: DiscursantesService,
    private hinosService: HinosService,
    private router: Router,
    private msg: NzMessageService,
    readonly auth: AuthService,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToCurrentMonth(), 300);
  }

  ngOnInit(): void {
    this.discursantesService.getRecentes(180).pipe(
      catchError(() => of([])),
    ).subscribe((recentes) => {
      const nomes = new Set<string>();
      for (const r of recentes) {
        if (r.discursante1) nomes.add(r.discursante1);
        if (r.discursante2) nomes.add(r.discursante2);
        if (r.ultimoDiscursante) nomes.add(r.ultimoDiscursante);
      }
      this.sugestoes.set([...nomes]);
    });

    this.loadMonth();
    this.loadRangeData();

    this.discursantesService.getSugestoes().pipe(
      catchError(() => of([])),
    ).subscribe((s) => this.sugestoesDiscursantes.set(s));
  }

  segmentLeft(): string {
    const map: Record<'atas' | 'discursantes' | 'hinos' | 'oracoes', number> = {
      atas: 0,
      discursantes: 1,
      hinos: 2,
      oracoes: 3,
    };
    const idx = map[this.activeSegment()];
    return `calc(${idx} * (100% / 4) + 2px)`;
  }

  setSegment(seg: 'atas' | 'discursantes' | 'hinos' | 'oracoes'): void {
    this.activeSegment.set(seg);
    if (seg !== 'atas') {
      setTimeout(() => this.scrollToCurrentMonth(), 100);
    }
  }

  scrollToCurrentMonth(): void {
    const now = new Date();
    const id = `month-${now.getFullYear()}-${now.getMonth()}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  isFuture(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) > today;
  }

  isCurrentMonth(m: MonthGroup): boolean {
    const now = new Date();
    return m.year === now.getFullYear() && m.month === now.getMonth();
  }

  openSheet(type: 'discursantes' | 'hinos' | 'oracoes', s: SundayData): void {
    this.sheetType.set(type);
    this.editingSunday.set(s);
    this.sheetForm = {
      discursante1: s.state?.discursante1 ?? '',
      discursante2: s.state?.discursante2 ?? '',
      discursante3: s.state?.discursante3 ?? '',
      tema1: s.state?.tema1 ?? '',
      tema2: s.state?.tema2 ?? '',
      tema3: s.state?.tema3 ?? '',
      hinoAbertura: s.state?.hinoAbertura ?? '',
      hinoSacramental: s.state?.hinoSacramental ?? '',
      hinoIntermediario: s.state?.hinoIntermediario ?? '',
      hinoEncerramento: s.state?.hinoEncerramento ?? '',
      oracaoAbertura: s.state?.oracaoAbertura ?? '',
      oracaoEncerramento: s.state?.oracaoEncerramento ?? '',
    };
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingSunday.set(null);
    this.hinosSearchAbertura.set([]);
    this.hinosSearchSacramento.set([]);
    this.hinosSearchIntermediario.set([]);
    this.hinosSearchEncerramento.set([]);
  }

  buscarHinoSheet(campo: 'abertura' | 'sacramento' | 'intermediario' | 'encerramento', busca: string): void {
    this.hinosService.buscar(busca).pipe(
      catchError(() => of([])),
    ).subscribe((hinos) => {
      const map = {
        abertura: this.hinosSearchAbertura,
        sacramento: this.hinosSearchSacramento,
        intermediario: this.hinosSearchIntermediario,
        encerramento: this.hinosSearchEncerramento,
      };
      map[campo].set(hinos);
    });
  }

  buscarDiscursanteSheet(campo: 1 | 2 | 3, busca: string): void {
    const q = (busca || '').toLowerCase();
    const filtered = q
      ? this.sugestoesDiscursantes().filter(s => s.nome.toLowerCase().includes(q))
      : this.sugestoesDiscursantes();
    const map = { 1: this.sugestoesFiltradas1, 2: this.sugestoesFiltradas2, 3: this.sugestoesFiltradas3 };
    map[campo].set(filtered.slice(0, 8));
  }

  aplicarSugestao(sug: DiscursanteSugestao): void {
    if (sug.posicao === '1º') {
      this.sheetForm.discursante1 = sug.nome;
    } else if (sug.posicao === '2º') {
      this.sheetForm.discursante2 = sug.nome;
    } else {
      this.sheetForm.discursante3 = sug.nome;
    }
  }

  formatarData(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  saveSheet(): void {
    const s = this.editingSunday();
    if (!s) return;
    this.savingSheet.set(true);
    this.discursantesService.salvar({
      date: s.date,
      tema: s.state?.tema ?? null,
      discursante1: this.sheetForm.discursante1 || null,
      discursante2: this.sheetForm.discursante2 || null,
      discursante3: this.sheetForm.discursante3 || null,
      tema1: this.sheetForm.tema1 || null,
      tema2: this.sheetForm.tema2 || null,
      tema3: this.sheetForm.tema3 || null,
      hinoAbertura: this.sheetForm.hinoAbertura || null,
      hinoSacramental: this.sheetForm.hinoSacramental || null,
      hinoIntermediario: this.sheetForm.hinoIntermediario || null,
      hinoEncerramento: this.sheetForm.hinoEncerramento || null,
      oracaoAbertura: this.sheetForm.oracaoAbertura || null,
      oracaoEncerramento: this.sheetForm.oracaoEncerramento || null,
    }).pipe(
      catchError((err) => {
        console.error('[Planning] Erro ao salvar:', err);
        const msg = err?.error?.message || 'Erro ao salvar.';
        this.msg.error(msg);
        return of(null);
      }),
      finalize(() => { this.savingSheet.set(false); }),
    ).subscribe((res) => {
      if (res) {
        s.state = res;
        s.loaded = true;
        this.msg.success('Salvo com sucesso.');
        this.closeSheet();
        this.loadRangeData();
      }
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

  mesAnterior(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.animating.set(true);
    this.currentDate.set(d);
    this.loadMonth();
    setTimeout(() => this.animating.set(false), 260);
  }

  proximoMes(): void {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.animating.set(true);
    this.currentDate.set(d);
    this.loadMonth();
    setTimeout(() => this.animating.set(false), 260);
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

  hasData(s: SundayData): boolean {
    return !!(s.state?.discursante1 || s.state?.discursante2 || s.state?.discursante3);
  }

  buscarHino(campo: 'abertura' | 'sacramento' | 'intermediario' | 'encerramento', busca: string): void {
    this.hinosService.buscar(busca).pipe(
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

  toggleExpand(s: SundayData): void {
    s.expanded = !s.expanded;
    if (s.expanded && !s.loaded && !s.isFirst) {
      this.loadSundayState(s);
    }
  }

  salvar(s: SundayData): void {
    s.saving = true;
    this.discursantesService.salvar({
      date: s.date,
      tema: s.form.tema || null,
      discursante1: s.form.discursante1 || null,
      discursante2: s.form.discursante2 || null,
      discursante3: s.form.discursante3 || null,
      tema1: s.form.tema1 || null,
      tema2: s.form.tema2 || null,
      tema3: s.form.tema3 || null,
      hinoAbertura: s.form.hinoAbertura || null,
      hinoSacramental: s.form.hinoSacramental || null,
      hinoIntermediario: s.form.hinoIntermediario || null,
      hinoEncerramento: s.form.hinoEncerramento || null,
      oracaoAbertura: s.form.oracaoAbertura || null,
      oracaoEncerramento: s.form.oracaoEncerramento || null,
    }).pipe(
      catchError((err) => {
        console.error('[Planning] Erro ao salvar:', err);
        const msg = err?.error?.message || 'Erro ao salvar. Verifique os dados e tente novamente.';
        this.msg.error(msg);
        return of(null);
      }),
      finalize(() => { s.saving = false; }),
    ).subscribe((res) => {
      if (res) {
        s.state = res;
        this.msg.success('Salvo com sucesso.');
        this.loadRangeData();
      }
    });
  }

  private loadMonth(): void {
    this.loading.set(true);
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const sundaysList = this.getSundays(year, month);

    const items: SundayData[] = sundaysList.map((dt, idx) => ({
      date: this.toIsoDate(dt),
      label: this.getSundayLabel(dt),
      dayNum: dt.getDate(),
      isFirst: idx === 0,
      state: null,
      expanded: false,
      saving: false,
      loaded: false,
      form: {
        discursante1: '',
        discursante2: '',
        discursante3: '',
        tema: '',
        tema1: '',
        tema2: '',
        tema3: '',
        hinoAbertura: '',
        hinoSacramental: '',
        hinoIntermediario: '',
        hinoEncerramento: '',
        oracaoAbertura: '',
        oracaoEncerramento: '',
      },
    }));

    this.sundays.set(items);
    this.loading.set(false);
  }

  private loadSundayState(s: SundayData): void {
    this.discursantesService.getState(s.date).pipe(
      catchError(() => of(null)),
    ).subscribe((state) => {
      s.state = state;
      s.loaded = true;
      if (state) {
        s.form.discursante1 = state.discursante1 ?? '';
        s.form.discursante2 = state.discursante2 ?? '';
        s.form.discursante3 = state.discursante3 ?? '';
        s.form.tema = state.tema ?? '';
        s.form.tema1 = state.tema1 ?? '';
        s.form.tema2 = state.tema2 ?? '';
        s.form.tema3 = state.tema3 ?? '';
        s.form.hinoAbertura = state.hinoAbertura ?? '';
        s.form.hinoSacramental = state.hinoSacramental ?? '';
        s.form.hinoIntermediario = state.hinoIntermediario ?? '';
        s.form.hinoEncerramento = state.hinoEncerramento ?? '';
        s.form.oracaoAbertura = state.oracaoAbertura ?? '';
        s.form.oracaoEncerramento = state.oracaoEncerramento ?? '';
      }
    });
  }

  private loadRangeData(): void {
    this.loadingLists.set(true);
    const now = new Date();
    const monthsToFetch: { year: number; month: number }[] = [];

    for (let i = -3; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      monthsToFetch.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    // Get all Sundays for the full range
    const allSundays: { date: string; year: number; month: number; label: string; dayNum: number }[] = [];
    for (const m of monthsToFetch) {
      const sundays = this.getSundays(m.year, m.month);
      for (const dt of sundays) {
        allSundays.push({
          date: this.toIsoDate(dt),
          year: m.year,
          month: m.month,
          label: this.getSundayLabel(dt),
          dayNum: dt.getDate(),
        });
      }
    }

    // Load past months from getRecentes
    const dataMap = new Map<string, DiscursantesState>();
    const pastCutoff = new Date(now);
    pastCutoff.setDate(pastCutoff.getDate() - 90);
    const pastDates = allSundays.filter(s => new Date(s.date) <= now && new Date(s.date) >= pastCutoff);

    // Load future Sundays from getState individually
    const futureDates = allSundays.filter(s => new Date(s.date) > now);

    this.discursantesService.getRecentes(90).pipe(
      catchError(() => of([])),
    ).subscribe((recentes) => {
      for (const r of recentes) {
        if (r.date) {
          dataMap.set(r.date, r);
        }
      }

      // Now load future Sundays
      if (futureDates.length === 0) {
        this.buildLists(allSundays, dataMap);
        this.loadingLists.set(false);
        this.scrollToCurrentMonth();
        return;
      }

      const futureCalls = futureDates.map(sf =>
        this.discursantesService.getState(sf.date).pipe(
          catchError(() => of(null)),
        )
      );

      forkJoin(futureCalls).subscribe((results) => {
        results.forEach((state, idx) => {
          if (state) {
            dataMap.set(futureDates[idx].date, state);
          }
        });
        this.buildLists(allSundays, dataMap);
        this.loadingLists.set(false);
        this.scrollToCurrentMonth();
      });
    });
  }

  private buildLists(
    allSundays: { date: string; year: number; month: number; label: string; dayNum: number }[],
    dataMap: Map<string, DiscursantesState>,
  ): void {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const months = new Map<string, MonthGroup>();

    for (const s of allSundays) {
      const key = `${s.year}-${s.month}`;
      if (!months.has(key)) {
        months.set(key, {
          year: s.year,
          month: s.month,
          label: `${meses[s.month]} ${s.year}`,
          sundays: [],
        });
      }
      const state = dataMap.get(s.date) ?? null;
      months.get(key)!.sundays.push({
        date: s.date,
        label: s.label,
        dayNum: s.dayNum,
        isFirst: months.get(key)!.sundays.length === 0,
        state,
        expanded: false,
        saving: false,
        loaded: true,
        form: {
          discursante1: state?.discursante1 ?? '',
          discursante2: state?.discursante2 ?? '',
          discursante3: state?.discursante3 ?? '',
          tema: state?.tema ?? '',
          tema1: state?.tema1 ?? '',
          tema2: state?.tema2 ?? '',
          tema3: state?.tema3 ?? '',
          hinoAbertura: state?.hinoAbertura ?? '',
          hinoSacramental: state?.hinoSacramental ?? '',
          hinoIntermediario: state?.hinoIntermediario ?? '',
          hinoEncerramento: state?.hinoEncerramento ?? '',
          oracaoAbertura: state?.oracaoAbertura ?? '',
          oracaoEncerramento: state?.oracaoEncerramento ?? '',
        },
      });
    }

    // Filter out Sundays with no data for past months, keep all for current/future
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;

    const discursantesResult: MonthGroup[] = [];
    const hinosResult: MonthGroup[] = [];
    const oracoesResult: MonthGroup[] = [];

    // Collect months, then sort: future first, current middle, past last
    const allGroups: { key: string; group: MonthGroup }[] = [];
    for (const [key, group] of months) {
      const isCurrentOrFuture = key >= currentKey;
      const dGroup = { ...group, sundays: group.sundays.filter(s => isCurrentOrFuture || s.state) };
      const hGroup = { ...group, sundays: group.sundays.filter(s => isCurrentOrFuture || s.state) };

      if (dGroup.sundays.length > 0 || hGroup.sundays.length > 0) {
        allGroups.push({ key, group: dGroup });
      }
      if (hGroup.sundays.length > 0 && dGroup.sundays.length === 0) {
        // rare: hinos has data but discursantes doesn't
      }
    }

    // Sort: pure chronological ascending (past → current → future), current month highlighted
    allGroups.sort((a, b) => {
      const toNum = (key: string) => {
        const [y, m] = key.split('-').map(Number);
        return y * 12 + m;
      };
      return toNum(a.key) - toNum(b.key);
    });

    for (const { key, group } of allGroups) {
      const isCurrentOrFuture = key >= currentKey;
      discursantesResult.push({ ...group, sundays: group.sundays.filter(s => isCurrentOrFuture || s.state) });
      hinosResult.push({ ...group, sundays: group.sundays.filter(s => isCurrentOrFuture || s.state) });
      oracoesResult.push({ ...group, sundays: group.sundays.filter(s => isCurrentOrFuture || s.state) });
    }

    this.discursantesData.set(discursantesResult);
    this.hinosData.set(hinosResult);
    this.oracoesData.set(oracoesResult);
  }

  private getSundays(year: number, month: number): Date[] {
    const sundays: Date[] = [];
    const d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (d.getDay() === 0) {
        sundays.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return sundays;
  }

  private getSundayLabel(d: Date): string {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return `${weekdays[d.getDay()]}`;
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  voltar(): void {
    this.router.navigate(['/atas']);
  }
}
