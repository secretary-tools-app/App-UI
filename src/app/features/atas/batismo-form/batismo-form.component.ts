import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { PageHeadComponent } from '../../../shared/components/page-head/page-head.component';
import { AtaService, BatismoService } from '../../../core/services';
import { AtaResponse, BatismoData } from '../../../core/models';
import { ActionBarService } from '../../../shared/components/action-bar/action-bar.service';

@Component({
  selector: 'app-batismo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSkeletonModule,
    SectionCardComponent,
    PageHeadComponent,
  ],
  template: `
    <app-page-head modo="row" tipo="batismo" eyebrow="Ata de Batismo" [titulo]="dataFormatada()"></app-page-head>

    @if (loadingInicial()) {
      <div class="loading-box">
        <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 6 }"></nz-skeleton>
      </div>
    } @else {
      <form [formGroup]="form" class="form">
        <app-section-card index="01" title="Condução do serviço" accent="batismo">
          <div class="field">
            <label class="field-label">Dedicado a</label>
            <input nz-input formControlName="dedicado" placeholder="opcional" />
          </div>
          <div class="field">
            <label class="field-label">Presidido por</label>
            <input nz-input formControlName="presidido" />
          </div>
          <div class="field">
            <label class="field-label">Dirigido por</label>
            <input nz-input formControlName="dirigido" />
          </div>
        </app-section-card>

        <app-section-card index="02" title="Batizados" subtitle="Quem foi batizado e por quem" accent="batismo">
          <div formArrayName="batizados" class="batizados-list">
            @for (grupo of batizados.controls; track $index) {
              <div [formGroupName]="$index" class="batizado-row">
                <div class="field">
                  <label class="field-label">Nome</label>
                  <input nz-input formControlName="nome" />
                </div>
                <div class="field">
                  <label class="field-label">Batizado por</label>
                  <input nz-input formControlName="batizador" />
                </div>
                <button nz-button nzType="text" nzDanger type="button" (click)="removerBatizado($index)" aria-label="Remover">
                  <span nz-icon nzType="delete"></span>
                </button>
              </div>
            }
          </div>
          <button nz-button nzType="dashed" nzBlock type="button" (click)="adicionarBatizado()">
            <span nz-icon nzType="plus"></span> Adicionar batizado
          </button>
        </app-section-card>

        <app-section-card index="03" title="Testemunhas" accent="batismo">
          <div class="field">
            <label class="field-label">Primeira testemunha</label>
            <input nz-input formControlName="testemunha1" />
          </div>
          <div class="field">
            <label class="field-label">Segunda testemunha</label>
            <input nz-input formControlName="testemunha2" />
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
      .batizados-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
      }
      .batizado-row {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 8px;
        align-items: start;
        background: var(--accent-batismo-soft);
        padding: 10px;
        border-radius: var(--radius);
      }
    `,
  ],
})
export class BatismoFormComponent implements OnInit, OnDestroy {
  ataId!: number;
  ata = signal<AtaResponse | null>(null);
  isEditing = signal(false);
  loadingInicial = signal(true);
  saving = signal(false);

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ataService = inject(AtaService);
  private batismoService = inject(BatismoService);
  private msg = inject(NzMessageService);
  private actionBar = inject(ActionBarService);
  private subs: Subscription[] = [];

  form: FormGroup = this.fb.group({
    dedicado: [''],
    presidido: [''],
    dirigido: [''],
    batizados: this.fb.array([]),
    testemunha1: [''],
    testemunha2: [''],
  });

  get batizados(): FormArray {
    return this.form.get('batizados') as FormArray;
  }

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
      bat: this.batismoService.getByAtaId(this.ataId).pipe(catchError(() => of(null))),
    }).subscribe(({ ata, bat }) => {
      this.ata.set(ata);

      if (bat && (bat.id || bat.ataId)) {
        this.isEditing.set(true);
        this.form.patchValue({
          dedicado: bat.dedicado,
          presidido: bat.presidido,
          dirigido: bat.dirigido,
          testemunha1: bat.testemunha1,
          testemunha2: bat.testemunha2,
        });
        for (const b of bat.batizados ?? []) {
          this.batizados.push(this.fb.group({ nome: [b.nome], batizador: [b.batizador ?? ''] }));
        }
      }
      if (this.batizados.length === 0) this.adicionarBatizado();

      this.loadingInicial.set(false);
    });
  }

  adicionarBatizado(): void {
    this.batizados.push(this.fb.group({ nome: ['', Validators.required], batizador: [''] }));
  }

  removerBatizado(index: number): void {
    this.batizados.removeAt(index);
  }

  dataFormatada(): string {
    const d = this.ata()?.data;
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  salvar(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload: BatismoData = {
      ataId: this.ataId,
      dedicado: raw.dedicado,
      presidido: raw.presidido,
      dirigido: raw.dirigido,
      testemunha1: raw.testemunha1,
      testemunha2: raw.testemunha2,
      batizados: (raw.batizados as { nome: string; batizador: string }[]).filter((b) => b.nome?.trim()),
    };

    const req$ = this.isEditing()
      ? this.batismoService.update(this.ataId, payload)
      : this.batismoService.create(payload);

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
