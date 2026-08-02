import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
// Adicione FormsModule nesta linha
import { FormsModule } from '@angular/forms';


import { ConfiguracoesService } from '../../core/services/configuracoes.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { AppService } from '../../core/services/app.service';
import { UnidadeData, TemplateResponse, SaveTemplateRequest } from '../../core/models/configuracoes.model';
import { AppInfo } from '../../core/models/app.model';
import { PageHeadComponent } from '../../shared/components/page-head/page-head.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzButtonModule, NzIconModule, FormsModule,
    NzTabsModule, NzInputModule, NzFormModule, NzStatisticModule, NzGridModule, NzModalModule,
    PageHeadComponent,
    BottomSheetComponent,
  ],
  template: `
    <app-page-head [eyebrow]="authService.alaTitle()" titulo="Ajustes">
      <span pageHeadActions>
        <button class="page-head__btn page-head__sobre" (click)="abrirSobre()" aria-label="Sobre o app">
          <span nz-icon nzType="info-circle" nzTheme="outline"></span>
        </button>
        <button class="page-head__btn page-head__profile" (click)="abrirPerfil()" aria-label="Conta">
          <span nz-icon nzType="user" nzTheme="outline"></span>
        </button>
      </span>
    </app-page-head>

    <div class="config-container">
      <nz-tabset nzCentered>
        
        <nz-tab nzTitle="Recursos">
          <div class="tab-content">
            <div class="recursos">
              <div class="recurso-card">
                <button class="recurso-card__head" (click)="toggleRecurso('apoio')">
                  <span class="recurso-card__title">Apoio a Lider</span>
                  <span nz-icon [nzType]="recursoAberto() === 'apoio' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
                </button>
                @if (recursoAberto() === 'apoio') {
                  <div class="recurso-card__body">
                    <p class="recurso-line"><span class="recurso-line__label">E-mail:</span> LMS-BRZ&#64;ChurchofJesusChrist.org</p>
                    <p class="recurso-line"><span class="recurso-line__label">Telefone:</span> 0800-450-0035</p>
                    <p class="recurso-line"><span class="recurso-line__label">WhatsApp e telefone:</span> (11) 3723-3361</p>
                    <p class="recurso-line"><span class="recurso-line__label">Atendimento:</span> segunda a sexta, das 8h às 21h</p>
                    <div class="recurso-actions">
                      <a class="recurso-btn recurso-btn--email" href="mailto:LMS-BRZ@ChurchofJesusChrist.org">
                        <span nz-icon nzType="mail" nzTheme="outline"></span>
                        Enviar e-mail
                      </a>
                      <a class="recurso-btn recurso-btn--call" href="tel:08004500035">
                        <span nz-icon nzType="phone" nzTheme="outline"></span>
                        Ligar
                      </a>
                      <a class="recurso-btn recurso-btn--whats" href="https://wa.me/551137233361?text=Ol%C3%A1%2C%20precisamos%20de%20apoio%20para%20a%20ala." target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                }
              </div>

              <div class="recurso-card">
                <button class="recurso-card__head" (click)="toggleRecurso('secretaria')">
                  <span class="recurso-card__title">Secretaria Utils</span>
                  <span nz-icon [nzType]="recursoAberto() === 'secretaria' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
                </button>
                @if (recursoAberto() === 'secretaria') {
                  <div class="recurso-card__body">
                    <a class="recurso-link" href="https://docs.google.com/spreadsheets/d/16QNENuSP4VRQ5v8e-Xa6D-abu6RBv6qz/edit?gid=286745829#gid=286745829" target="_blank" rel="noopener">
                      Abrir planilha da secretaria
                      <span nz-icon nzType="link" nzTheme="outline"></span>
                    </a>
                  </div>
                }
              </div>

              <div class="recurso-card">
                <button class="recurso-card__head" (click)="toggleRecurso('transmissao')">
                  <span class="recurso-card__title">Link Transmissão</span>
                  <span nz-icon [nzType]="recursoAberto() === 'transmissao' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
                </button>
                @if (recursoAberto() === 'transmissao') {
                  <div class="recurso-card__body">
                    <p class="recurso-hint">Cole o link da transmissão de domingo. O campo é limpo automaticamente na segunda-feira.</p>
                    <input
                      class="recurso-input"
                      type="url"
                      placeholder="https://youtube.com/..."
                      [ngModel]="linkTransmissao"
                      (ngModelChange)="atualizarLinkTransmissao($event)"
                    />
                    <button class="recurso-btn recurso-btn--primary" [disabled]="!linkTransmissao.trim()" (click)="compartilharWhatsApp()">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Compartilhar no WhatsApp
                    </button>
                  </div>
                }
              </div>

              <a class="recurso-card recurso-card--link" href="https://www.churchofjesuschrist.org/study/manual/general-handbook/26-temple-recommends?lang=por&id=title30#title30" target="_blank" rel="noopener">
                <span class="recurso-card__title">Perguntas Entrevista Templo</span>
                <span nz-icon nzType="export" nzTheme="outline" class="recurso-card__chevron"></span>
              </a>
            </div>
          </div>
        </nz-tab>

        <nz-tab nzTitle="Dados da Ala">
          <div class="tab-content">
            <form nz-form [formGroup]="unidadeForm" (ngSubmit)="salvarUnidade()" nzLayout="vertical">
              <nz-form-item>
                <nz-form-label>Nome da Ala</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="nome" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Bispo</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="bispo" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>1º Conselheiro</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="primeiroConselheiro" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>2º Conselheiro</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="segundoConselheiro" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Horário</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="horario" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Recepcionista</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="recepcionista" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Pianista</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="pianista" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Regente de Música</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="regenteMusica" />
                </nz-form-control>
              </nz-form-item>

              <button nz-button nzType="primary" nzBlock [disabled]="unidadeForm.pristine">
                Salvar Unidade
              </button>
            </form>
          </div>
        </nz-tab>

        <nz-tab nzTitle="Template Atas">
          <div class="tab-content" *ngIf="templatesParaEdicao.length === 2">
            <p class="help-text">
              Estes textos aparecem automaticamente em novas atas. Conheça os marcadores
              <button class="help-text__btn" (click)="marcadoresVisible.set(true)" aria-label="Como usar os marcadores">
                <span nz-icon nzType="question-circle"></span>
              </button>
            </p>

            <div class="templates-split">
              @for (tpl of templatesParaEdicao; track tpl.tipoTemplate) {
                <div class="templates-col">
                  <div class="template-col__head">
                    <span class="template-col__dot" [class.template-col__dot--testemunhos]="tpl.tipoTemplate === 2"></span>
                    {{ tpl.tipoTemplate === 1 ? 'Sacramental' : 'Testemunhos' }}
                  </div>

                  @if (tpl.tipoTemplate === 1) {
                  <div class="template-card">
                    <strong>Abertura</strong>
                    <textarea nz-input [(ngModel)]="tpl.boasVindas" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Desobrigações</strong>
                    <textarea nz-input [(ngModel)]="tpl.desobrigacoes" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Desobrigações (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.desobrigacoesPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Apoios / novos chamados</strong>
                    <textarea nz-input [(ngModel)]="tpl.apoios" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Apoios (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.apoiosPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Confirmações de batismo</strong>
                    <textarea nz-input [(ngModel)]="tpl.confirmacoesBatismo" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Confirmações (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.confirmacoesBatismoPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Apoio a membro novo</strong>
                    <textarea nz-input [(ngModel)]="tpl.apoioMembroNovo" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Apoio a membros novos (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.apoioMembroNovoPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Bênção de criança</strong>
                    <textarea nz-input [(ngModel)]="tpl.bencaoCrianca" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Bênção de crianças (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.bencaoCriancaPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Ordenações</strong>
                    <textarea nz-input [(ngModel)]="tpl.ordenacoes" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Ordenações (várias pessoas)</strong>
                    <textarea nz-input [(ngModel)]="tpl.ordenacoesPlural" rows="3"></textarea>
                  </div>

                  <div class="template-card">
                    <strong>Sacramento</strong>
                    <textarea nz-input [(ngModel)]="tpl.sacramento" rows="3"></textarea>
                  </div>
                  }

                  <div class="template-card">
                    <strong>Mensagens</strong>
                    <textarea nz-input [(ngModel)]="tpl.mensagens" rows="3"></textarea>
                  </div>

                  @if (tpl.tipoTemplate === 1) {
                  <div class="template-card">
                    <strong>Link de transmissão (live)</strong>
                    <input nz-input [(ngModel)]="tpl.live" placeholder="https://..." />
                  </div>
                  }

                  <div class="template-card">
                    <strong>Agradecimentos Finais</strong>
                    <textarea nz-input [(ngModel)]="tpl.encerramento" rows="3"></textarea>
                  </div>

                  <button nz-button nzType="primary" nzBlock (click)="salvarTemplate(tpl)">
                    Salvar {{ tpl.tipoTemplate === 1 ? 'Sacramental' : 'Testemunhos' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </nz-tab>

      </nz-tabset>
    </div>

    @if (perfilVisible()) {
      <app-bottom-sheet
        titulo="Sua conta"
        [subtitulo]="authService.role() ?? ''"
        [salvando]="salvandoPerfil()"
        rotuloCancelar="Voltar"
        [mostrarCancelar]="true"
        (salvar)="salvarPerfil()"
        (fechar)="fecharPerfil()"
      >
        <span sheetHeaderActions>
          <button class="sheet__logout" (click)="confirmarSair()" aria-label="Sair da conta">
            <span nz-icon nzType="logout" nzTheme="outline"></span>
            Sair
          </button>
        </span>

        <div class="perfil-info">
          <div class="perfil-row">
            <span class="perfil-label">Usuário</span>
            <span>{{ authService.username() }}</span>
          </div>
          <div class="perfil-row">
            <span class="perfil-label">Ala</span>
            <span>{{ authService.alaTitle() }}</span>
          </div>
        </div>

        <div class="sheet__fields">
          <div class="field">
            <label class="field-label">Primeiro nome</label>
            <input
              class="field-input"
              type="text"
              [(ngModel)]="primeiroNome"
              placeholder="Como seu nome aparece nas tarefas"
            />
          </div>
        </div>
      </app-bottom-sheet>
    }

    @if (marcadoresVisible()) {
      <app-bottom-sheet
        titulo="Como usar os marcadores"
        subtitulo="Coloque-os nos textos padrão; os dados da ata entram automaticamente na visualização."
        [mostrarAcoes]="false"
        (fechar)="marcadoresVisible.set(false)"
      >
        <span sheetHeaderActions>
          <button class="sheet__close" (click)="marcadoresVisible.set(false)" aria-label="Fechar">
            <span nz-icon nzType="close"></span>
          </button>
        </span>

        <div class="marcadores">
          <div class="marcadores__item">
            <code class="marcadores__code">[ALA]</code>
            <p class="marcadores__desc">Nome da ala (ex.: "Ala Criciúma").</p>
          </div>
          <div class="marcadores__item">
            <code class="marcadores__code">[DATA]</code>
            <p class="marcadores__desc">Data da reunião por extenso (ex.: "2 de agosto de 2026").</p>
          </div>
          <div class="marcadores__item">
            <code class="marcadores__code">[NOME]</code>
            <p class="marcadores__desc">Nome da pessoa (discursante, desobrigado, apoiado, ordenado ou batizado).</p>
          </div>
          <div class="marcadores__item">
            <code class="marcadores__code">[CHAMADO]</code>
            <p class="marcadores__desc">Chamado/cargo da pessoa (ex.: "Presidente da Escola Dominical").</p>
          </div>
          <div class="marcadores__item">
            <code class="marcadores__code">[LISTA]</code>
            <p class="marcadores__desc">Lista com o nome de várias pessoas, usada nos textos no plural.</p>
          </div>
          <div class="marcadores__item">
            <code class="marcadores__code">[NOME DA CRIANÇA]</code>
            <p class="marcadores__desc">Nome da criança na bênção de apresentação.</p>
          </div>
        </div>
      </app-bottom-sheet>
    }

    @if (sobreVisible()) {
      <app-bottom-sheet
        titulo="Sobre o app"
        subtitulo="Atas — registro das reuniões da ala"
        [mostrarAcoes]="false"
        (fechar)="fecharSobre()"
      >
        <span sheetHeaderActions>
          <button class="sheet__close" (click)="fecharSobre()" aria-label="Fechar">
            <span nz-icon nzType="close"></span>
          </button>
        </span>

        <div class="sobre">
          <div class="sobre__versao">
            <span nz-icon nzType="file-text" nzTheme="outline"></span>
            Versão {{ appInfo()?.versao || versaoPadrao }}
          </div>

          <p class="sobre__texto">Feito com carinho por Thales Vaz 💜</p>

          <button class="sobre__instalar-btn" (click)="abrirInstalar()">
            <span nz-icon nzType="mobile" nzTheme="outline"></span>
            Como instalar o app na tela inicial
          </button>

          @if (linkWhatsappSuporte(); as link) {
            <a class="recurso-btn recurso-btn--whats" [href]="link" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Mandar mensagem no WhatsApp
            </a>
          } @else if (carregandoAppInfo()) {
            <p class="sobre__hint">Carregando contato...</p>
          } @else {
            <p class="sobre__hint">Não foi possível carregar o contato agora. Tente novamente mais tarde.</p>
          }
        </div>
      </app-bottom-sheet>
    }

    @if (instalarVisible()) {
      <app-bottom-sheet
        titulo="Instalar na tela inicial"
        subtitulo="Assim o app abre direto, como um aplicativo comum — sem precisar acessar pelo navegador toda vez."
        [mostrarAcoes]="false"
        (fechar)="fecharInstalar()"
      >
        <span sheetHeaderActions>
          <button class="sheet__close" (click)="fecharInstalar()" aria-label="Fechar">
            <span nz-icon nzType="close"></span>
          </button>
        </span>

        <div class="recursos">
          <div class="recurso-card">
            <button class="recurso-card__head" (click)="toggleInstalar('android')">
              <span class="recurso-card__title">Android (Google Chrome)</span>
              <span nz-icon [nzType]="instalarAberto() === 'android' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
            </button>
            @if (instalarAberto() === 'android') {
              <div class="recurso-card__body">
                <ol class="instalar-steps">
                  <li>Abra o <strong>Google Chrome</strong> no seu celular.</li>
                  <li>Acesse o endereço do site do app.</li>
                  <li>Toque nos <strong>três pontinhos</strong> (⋮) no canto superior direito da tela.</li>
                  <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>Confirme tocando em <strong>"Instalar"</strong> novamente.</li>
                  <li>Pronto! O ícone do app aparece na tela inicial do celular, como um app baixado da loja.</li>
                </ol>
              </div>
            }
          </div>

          <div class="recurso-card">
            <button class="recurso-card__head" (click)="toggleInstalar('iphone')">
              <span class="recurso-card__title">iPhone (Safari)</span>
              <span nz-icon [nzType]="instalarAberto() === 'iphone' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
            </button>
            @if (instalarAberto() === 'iphone') {
              <div class="recurso-card__body">
                <p class="recurso-hint">⚠️ Só funciona pelo navegador <strong>Safari</strong> — não funciona pelo Chrome no iPhone.</p>
                <ol class="instalar-steps">
                  <li>Abra o <strong>Safari</strong> no iPhone.</li>
                  <li>Acesse o endereço do site do app.</li>
                  <li>Toque no ícone de <strong>compartilhar</strong> (quadrado com uma seta pra cima 📤).</li>
                  <li>Deslize a lista até encontrar <strong>"Adicionar à Tela de Início"</strong> e toque nela.</li>
                  <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
                  <li>Pronto! O ícone aparece na tela inicial do iPhone.</li>
                </ol>
              </div>
            }
          </div>

          <div class="recurso-card">
            <button class="recurso-card__head" (click)="toggleInstalar('computador')">
              <span class="recurso-card__title">Computador (Chrome/Edge)</span>
              <span nz-icon [nzType]="instalarAberto() === 'computador' ? 'up' : 'down'" nzTheme="outline" class="recurso-card__chevron"></span>
            </button>
            @if (instalarAberto() === 'computador') {
              <div class="recurso-card__body">
                <ol class="instalar-steps">
                  <li>Abra o site no <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>.</li>
                  <li>Procure o ícone de instalar (uma tela com uma setinha) do lado direito da barra de endereço.</li>
                  <li>Clique nele e depois em <strong>"Instalar"</strong>.</li>
                  <li>O app abre numa janela própria, com atalho na área de trabalho ou menu iniciar.</li>
                </ol>
              </div>
            }
          </div>
        </div>

        <p class="sobre__hint instalar-footer">É gratuito, não passa pela Play Store nem App Store, e ocupa bem pouco espaço no aparelho.</p>
      </app-bottom-sheet>
    }
  `,
  styles: [`
    .page-head__profile {
      position: absolute;
      top: calc(10px + var(--safe-top));
      right: 14px;
      color: var(--primary);
    }
    .page-head__profile:active {
      background: #f0eef6;
    }
    .page-head__sobre {
      position: absolute;
      top: calc(10px + var(--safe-top));
      left: 14px;
      color: var(--primary);
    }
    .page-head__sobre:active {
      background: #f0eef6;
    }
    .perfil-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px 14px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius);
    }
    .perfil-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--ink);
    }
    .perfil-label {
      width: 72px;
      flex-shrink: 0;
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ink-soft);
    }

    /* ── Bottom Sheet (mesmo padrão do "Editar discursantes") ── */
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
    .sheet__logout {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      padding: 8px 14px;
      border: 1px solid var(--line);
      border-radius: 20px;
      background: var(--paper-raised);
      color: var(--ink-soft);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .sheet__logout:active {
      background: #f7e9e9;
      color: #d64545;
      border-color: #eccccc;
    }
    .sheet__logout .anticon { font-size: 15px; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(100%); }
      to { transform: translateX(-50%) translateY(0); }
    }
    .config-container {
      padding: 16px;
    }
    .tab-content {
      padding: 8px 0 0;
    }
    .help-text {
      color: var(--ink-soft);
      font-size: 13px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .help-text__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: var(--paper-raised);
      color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .help-text__btn .anticon { font-size: 12px; }
    .help-text__btn:active { background: #f0eef6; }
    .sheet__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: var(--paper-raised);
      color: var(--ink-soft);
      cursor: pointer;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .sheet__close:active { background: #f0eef6; }
    .sheet__close .anticon { font-size: 14px; }
    .marcadores {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .marcadores__item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 12px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius);
    }
    .marcadores__code {
      align-self: flex-start;
      padding: 2px 8px;
      border-radius: 6px;
      background: #f0eef6;
      color: var(--primary);
      font-family: var(--font-mono, monospace);
      font-size: 13px;
      font-weight: 600;
    }
    .marcadores__desc {
      margin: 0;
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--ink);
    }
    .template-card {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 16px;
      border-bottom: 1px dashed var(--line);
    }
    .template-card:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .templates-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 24px;
      position: relative;
    }
    .templates-split::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50% - 12px);
      width: 1px;
      background: var(--line);
    }
    .templates-col .template-card {
      margin-bottom: 14px;
      padding-bottom: 14px;
    }
    .template-col__head {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      color: var(--ink);
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--primary);
    }
    .template-col__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-sacramental);
      flex-shrink: 0;
    }
    .template-col__dot--testemunhos {
      background: var(--accent-batismo);
    }
    @media (max-width: 640px) {
      .templates-split {
        grid-template-columns: 1fr;
        gap: 28px 0;
      }
      .templates-split::before {
        display: none;
      }
    }
    .recursos {
      display: flex;
      flex-direction: column;
      background: var(--paper-raised);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .recurso-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 14px;
    }
    .recurso-actions .recurso-btn {
      width: auto;
      margin-top: 0;
      flex-direction: column;
      gap: 5px;
      padding: 10px 4px;
      font-size: 11.5px;
      line-height: 1.2;
      text-align: center;
    }
    .recurso-actions .recurso-btn .anticon,
    .recurso-actions .recurso-btn svg {
      font-size: 18px;
    }
    .recurso-btn--email { background: var(--primary); }
    .recurso-btn--call { background: var(--accent-batismo); }
    .recurso-btn--whats { background: #25d366; }
    .recurso-card {
      display: block;
      border: none;
      border-bottom: 1px solid var(--line);
      border-radius: 0;
      background: none;
    }
    .recurso-card:last-child {
      border-bottom: none;
    }
    .recurso-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      padding: 14px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink);
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }
    .recurso-card__head:active { background: #f0eef6; }
    .recurso-card__title { flex: 1; }
    .recurso-card__chevron { color: var(--ink-soft); font-size: 14px; }
    .recurso-card--link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 14px 16px;
      text-decoration: none;
      color: var(--ink);
      font-size: 14.5px;
      font-weight: 600;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .recurso-card--link:active { background: #f0eef6; }
    .recurso-card__body {
      padding: 0 16px 16px;
      border-top: 1px dashed var(--line);
      background: var(--paper);
    }
    .recurso-line {
      margin: 10px 0 0;
      font-size: 13.5px;
      color: var(--ink);
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .recurso-line__label {
      font-weight: 600;
      color: var(--ink-soft);
      white-space: nowrap;
    }
    .recurso-hint {
      margin: 12px 0 0;
      font-size: 12.5px;
      color: var(--ink-soft);
    }
    .recurso-input {
      width: 100%;
      margin-top: 10px;
      padding: 10px 12px;
      border: 1.5px solid var(--line);
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink);
      background: var(--paper-raised);
      outline: none;
      box-sizing: border-box;
    }
    .recurso-input:focus { border-color: var(--primary); }
    .recurso-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 16px;
      border-radius: var(--radius);
      background: var(--primary);
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
    }
    .recurso-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      margin-top: 12px;
      padding: 12px;
      border: none;
      border-radius: var(--radius);
      background: #25d366;
      color: #fff;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .recurso-btn:active { opacity: 0.85; }
    .recurso-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .sobre {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
      padding: 8px 4px 4px;
    }
    .sobre__versao {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      background: #f0eef6;
      color: var(--primary);
      font-size: 12.5px;
      font-weight: 600;
    }
    .sobre__texto {
      margin: 6px 0 4px;
      font-size: 14.5px;
      font-weight: 600;
      color: var(--ink);
    }
    .sobre__hint {
      margin: 8px 0 0;
      font-size: 12.5px;
      color: var(--ink-soft);
    }
    .sobre .recurso-btn {
      width: 100%;
      max-width: 280px;
    }
    .sobre__instalar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      max-width: 280px;
      margin-top: 2px;
      padding: 12px 16px;
      border: none;
      border-radius: var(--radius);
      background: var(--primary);
      color: #fff;
      font-family: var(--font-body);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .sobre__instalar-btn:active { opacity: 0.85; }
    .sobre__instalar-btn .anticon { font-size: 16px; }
    .instalar-steps {
      margin: 10px 0 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13.5px;
      line-height: 1.5;
      color: var(--ink);
    }
    .instalar-steps li {
      padding-left: 2px;
    }
    .instalar-footer {
      text-align: center;
      margin-top: 14px;
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configService = inject(ConfiguracoesService);
  private usuariosSvc = inject(UsuariosService);
  private appService = inject(AppService);
  readonly authService = inject(AuthService);
  private router = inject(Router);
  private msg = inject(NzMessageService);
  private modal = inject(NzModalService);

  perfilVisible = signal(false);
  salvandoPerfil = signal(false);
  primeiroNome = '';
  marcadoresVisible = signal(false);

  recursoAberto = signal<string | null>(null);
  linkTransmissao = '';
  private readonly TRANS_KEY = 'atas_link_transmissao';

  sobreVisible = signal(false);
  appInfo = signal<AppInfo | null>(null);
  carregandoAppInfo = signal(false);
  readonly versaoPadrao = 'v1.0.1';

  instalarVisible = signal(false);
  instalarAberto = signal<string | null>(null);

  // Templates editáveis: Sacramental (tipo 1) e Testemunhos (tipo 2)
  tplSacramental = signal<TemplateResponse | null>(null);
  tplTestemunhos = signal<TemplateResponse | null>(null);

  get templatesParaEdicao(): TemplateResponse[] {
    return [this.tplSacramental(), this.tplTestemunhos()].filter((t): t is TemplateResponse => !!t);
  }

  private static readonly TEXTO_PADRAO = {
    boasVindas: 'Bom dia irmãos e irmãs! Gostaríamos de fazer todos muito bem vindos a mais uma Reunião Sacramental da ALA [ALA], Estaca Criciúma, neste domingo dia [DATA]. Desejamos que todos se sintam bem entre nós, especialmente aqueles que nos visitam.',
    sacramento: 'Passaremos ao Sacramento, que é a parte mais importante de nossa reunião. Cantaremos como Hino Sacramental [HINO], o Sacramento será abençoado e distribuído a todos.',
    mensagens: 'Agradecemos a todos pela reverência durante o Sacramento. Passaremos agora a parte dos discursantes. Ouviremos primeiro o(a) irmã(o) [NOME]. Depois, ouviremos o(a) irmã(o) [NOME]. Em seguida cantaremos o hino [NOME], em pé, ao sinal do(a) regente.',
    encerramento: 'Agradecemos a presença e participação de todos, especialmente aqueles que contribuíram de alguma forma para que essa reunião acontecesse. E convidamos todos para que estejam aqui no próximo domingo. Ouviremos como último orador o(a) irmã(o) [NOME]. Logo após, cantaremos o hino [NOME], e o(a) irmã(o) [NOME] oferecerá a última oração. Desejamos a todos uma ótima semana e que o Espírito do Senhor os acompanhe.',
    desobrigacoes: '[NOME] está sendo desobrigado(a) como [CHAMADO]. Os que desejarem manifestar agradecimento por seus serviços prestados podem fazê-lo levantando a mão.',
    desobrigacoesPlural: '[LISTA] Os que desejarem manifestar agradecimento por seus serviços prestados podem fazê-lo levantando a mão.',
    apoios: '[NOME] foi chamado(a) para servir como [CHAMADO]. Os que forem a favor, manifestem-se levantando a mão. [Pequena pausa.] Os que se opuserem, se houver, manifestem-se. [Pequena pausa.]',
    apoiosPlural: '[LISTA] Os que forem a favor, manifestem-se levantando a mão. [Pequena pausa.] Os que se opuserem, se houver, manifestem-se. [Pequena pausa.]',
    confirmacoesBatismo: 'O(a) irmã(o) [NOME] foi batizado(a), gostaríamos de convidá-lo(a) para vir até o púlpito para que possamos fazer sua confirmação como membro de A Igreja de Jesus Cristo dos Santos dos Últimos Dias.',
    confirmacoesBatismoPlural: 'Os irmãos [LISTA] foram batizados, gostaríamos de convidá-los para vir até o púlpito para que possamos fazer sua confirmação como membros de A Igreja de Jesus Cristo dos Santos dos Últimos Dias.',
    apoioMembroNovo: 'O(a) irmã(o) [NOME] foi batizado e confirmado membro da igreja, e gostaríamos do apoio de todos os irmãos de plena aceitação como mais novo membro da ala. Todos a favor, manifestem-se.',
    apoioMembroNovoPlural: 'Os irmãos [LISTA] foram batizados e confirmados membros da igreja, e gostaríamos do apoio de todos os irmãos de plena aceitação como novos membros da ala. Todos a favor, manifestem-se.',
    bencaoCrianca: 'Gostaríamos de chamar ao púlpito o irmão [NOME] que irá dar a bênção de apresentação da(o) [NOME DA CRIANÇA].',
    bencaoCriancaPlural: 'Gostaríamos de chamar ao púlpito os irmãos que irão dar a bênção de apresentação das crianças [LISTA].',
    ordenacoes: 'É proposto que [NOME] receba o Sacerdócio de Melquisedeque e seja ordenado(a) como [CHAMADO]. Os que forem a favor, manifestem-se levantando a mão. [Pequena pausa.] Os que se opuserem, se houver, manifestem-se.',
    ordenacoesPlural: '[LISTA] Os que forem a favor, manifestem-se levantando a mão. [Pequena pausa.] Os que se opuserem, se houver, manifestem-se.'
  };

  unidadeForm = this.fb.group({
    nome: [''],
    bispo: [''],
    primeiroConselheiro: [''],
    segundoConselheiro: [''],
    recepcionista: [''],
    pianista: [''],
    regenteMusica: [''],
    horario: ['']
  });

  ngOnInit() {
    this.carregarDados();
    this.carregarLinkTransmissao();
  }

  carregarDados() {
    this.configService.getUnidade().subscribe(res => {
      if (res) this.unidadeForm.patchValue(res);
    });

    this.configService.getTemplates().subscribe({
      next: (res) => {
        const lista = res && res.length > 0 ? res : [];
        this.tplSacramental.set(lista.find((t) => t.tipoTemplate === 1) ?? this.templatePadrao(1));
        this.tplTestemunhos.set(lista.find((t) => t.tipoTemplate === 2) ?? this.templatePadrao(2));
      },
      error: () => {
        this.tplSacramental.set(this.templatePadrao(1));
        this.tplTestemunhos.set(this.templatePadrao(2));
      }
    });
  }

  private templatePadrao(tipo: 1 | 2): TemplateResponse {
    return {
      id: 0,
      alaId: 0,
      tipoTemplate: tipo,
      nome: tipo === 1 ? 'Sacramental Padrão' : 'Testemunhos',
      ...ConfiguracoesComponent.TEXTO_PADRAO,
      mensagens: tipo === 2
        ? 'Agradecemos a todos pela reverência durante o Sacramento. Passaremos agora ao momento de mensagens e testemunhos, dirigido pelo(a) irmã(o) [NOME].'
        : ConfiguracoesComponent.TEXTO_PADRAO.mensagens,
      encerramento: tipo === 2
        ? 'Agradecemos a presença e participação de todos, especialmente aqueles que contribuíram de alguma forma para que essa reunião acontecesse. Que o Espírito do Senhor nos acompanhe nesta semana.'
        : ConfiguracoesComponent.TEXTO_PADRAO.encerramento,
      live: ''
    };
  }
  salvarUnidade() {
    if (this.unidadeForm.valid) {
      const payload = this.unidadeForm.value as UnidadeData;
      this.configService.saveUnidade(payload).subscribe(() => {
        this.msg.success('Dados da ala atualizados!');
        this.unidadeForm.markAsPristine();
      });
    }
  }

  salvarTemplate(tpl: TemplateResponse) {
    const payload: SaveTemplateRequest = {
        tipoTemplate: tpl.tipoTemplate,
        nome: tpl.nome,
        boasVindas: tpl.boasVindas,
        desobrigacoes: tpl.desobrigacoes,
        apoios: tpl.apoios,
        confirmacoesBatismo: tpl.confirmacoesBatismo,
        apoioMembroNovo: tpl.apoioMembroNovo,
        bencaoCrianca: tpl.bencaoCrianca,
        ordenacoes: tpl.ordenacoes,
        desobrigacoesPlural: tpl.desobrigacoesPlural,
        apoiosPlural: tpl.apoiosPlural,
        confirmacoesBatismoPlural: tpl.confirmacoesBatismoPlural,
        apoioMembroNovoPlural: tpl.apoioMembroNovoPlural,
        bencaoCriancaPlural: tpl.bencaoCriancaPlural,
        ordenacoesPlural: tpl.ordenacoesPlural,
        sacramento: tpl.sacramento,
        mensagens: tpl.mensagens,
        live: tpl.live,
        encerramento: tpl.encerramento
    };

    const acao = tpl.id > 0
      ? this.configService.saveTemplate(tpl.id, payload)
      : this.configService.createTemplate(payload);

    acao.subscribe({
      next: (salvo) => {
        if (salvo.tipoTemplate === 2) {
          this.tplTestemunhos.set(salvo);
        } else {
          this.tplSacramental.set(salvo);
        }
        this.msg.success('Textos padrões atualizados!');
      },
      error: () => this.msg.error('Erro ao salvar textos padrões.')
    });
  }

  voltar() {
    this.router.navigate(['/atas']);
  }

  toggleRecurso(key: string): void {
    this.recursoAberto.set(this.recursoAberto() === key ? null : key);
  }

  atualizarLinkTransmissao(link: string): void {
    this.linkTransmissao = link;
    const limpo = link.trim();
    if (limpo) {
      localStorage.setItem(this.TRANS_KEY, JSON.stringify({ link: limpo, savedAt: new Date().toISOString() }));
    } else {
      localStorage.removeItem(this.TRANS_KEY);
    }
  }

  compartilharWhatsApp(): void {
    const link = this.linkTransmissao.trim();
    if (!link) return;
    const texto = `Transmissão da reunião de domingo: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  }

  private carregarLinkTransmissao(): void {
    try {
      const raw = localStorage.getItem(this.TRANS_KEY);
      if (!raw) return;
      const { link, savedAt } = JSON.parse(raw);
      if (this.deveResetarNaSegunda(savedAt)) {
        localStorage.removeItem(this.TRANS_KEY);
        this.linkTransmissao = '';
        return;
      }
      this.linkTransmissao = link ?? '';
    } catch {
      this.linkTransmissao = '';
    }
  }

  private deveResetarNaSegunda(savedAt: string): boolean {
    return this.mondayMs(new Date(savedAt)) < this.mondayMs(new Date());
  }

  private mondayMs(d: Date): number {
    const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const offset = (dia.getDay() + 6) % 7;
    dia.setDate(dia.getDate() - offset);
    return dia.getTime();
  }

  abrirPerfil(): void {
    this.primeiroNome = this.authService.displayName() ?? '';
    this.perfilVisible.set(true);
  }

  fecharPerfil(): void {
    this.perfilVisible.set(false);
  }

  salvarPerfil(): void {
    const nome = this.primeiroNome.trim();
    this.salvandoPerfil.set(true);
    this.usuariosSvc.updateMe({ displayName: nome }).subscribe({
      next: () => {
        this.authService.setDisplayName(nome || null);
        this.salvandoPerfil.set(false);
        this.perfilVisible.set(false);
        this.msg.success('Primeiro nome atualizado!');
      },
      error: () => {
        this.salvandoPerfil.set(false);
        this.msg.error('Não foi possível atualizar.');
      },
    });
  }

  abrirSobre(): void {
    this.sobreVisible.set(true);
    if (this.appInfo() || this.carregandoAppInfo()) return;

    this.carregandoAppInfo.set(true);
    this.appService.getInfo().subscribe({
      next: (info) => {
        this.appInfo.set(info);
        this.carregandoAppInfo.set(false);
      },
      error: () => {
        this.carregandoAppInfo.set(false);
      },
    });
  }

  fecharSobre(): void {
    this.sobreVisible.set(false);
  }

  /** Monta o link do wa.me a partir do telefone vindo da API (autenticada). Nunca hardcoded aqui. */
  linkWhatsappSuporte(): string | null {
    const numero = this.appInfo()?.contatoWhatsapp;
    if (!numero) return null;
    const digitos = numero.replace(/\D/g, '');
    if (!digitos) return null;
    const texto = encodeURIComponent('Olá! Estou usando o app Atas e gostaria de falar com você.');
    return `https://wa.me/${digitos}?text=${texto}`;
  }

  abrirInstalar(): void {
    this.sobreVisible.set(false);
    this.instalarVisible.set(true);
  }

  fecharInstalar(): void {
    this.instalarVisible.set(false);
  }

  toggleInstalar(key: string): void {
    this.instalarAberto.set(this.instalarAberto() === key ? null : key);
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  confirmarSair(): void {
    this.modal.confirm({
      nzTitle: 'Sair da conta?',
      nzContent: 'Você precisará entrar novamente para continuar.',
      nzOkText: 'Sair',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.sair(),
    });
  }
}