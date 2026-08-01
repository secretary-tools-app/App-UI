import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ChamadoItem } from '../../../core/models';

/**
 * Lista de itens com dois campos: nome e chamado/cargo (apoios e
 * desobrigações). Implementa ControlValueAccessor para `formControlName`.
 */
@Component({
  selector: 'app-chamado-list-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule, NzButtonModule, NzIconModule, NzTagModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChamadoListInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="chamado-list">
      @for (item of value; track $index) {
        <nz-tag class="chamado-list__chip" [nzColor]="chipColor" (nzOnClose)="remove($index, $event)" [nzMode]="'closeable'">
          {{ item.nome }}{{ item.chamado ? ' — ' + item.chamado : '' }}
        </nz-tag>
      }
    </div>

    <div class="chamado-list__entry">
      <input
        nz-input
        class="chamado-list__nome"
        placeholder="Nome"
        [(ngModel)]="draftNome"
        [disabled]="disabled"
        (keydown.enter)="add(); $event.preventDefault()"
      />
      <input
        nz-input
        class="chamado-list__chamado"
        placeholder="Chamado"
        [(ngModel)]="draftChamado"
        [disabled]="disabled"
        (keydown.enter)="add(); $event.preventDefault()"
      />
      <button nz-button nzType="default" type="button" (click)="add()" [disabled]="disabled || !draftNome.trim()">
        <span nz-icon nzType="plus"></span>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .chamado-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
        &:empty {
          margin-bottom: 0;
        }
      }
      .chamado-list__chip {
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 8px;
      }
      .chamado-list__entry {
        display: flex;
        gap: 8px;
      }
      .chamado-list__nome {
        flex: 1.2;
      }
      .chamado-list__chamado {
        flex: 1.4;
      }
    `,
  ],
})
export class ChamadoListInputComponent implements ControlValueAccessor {
  @Input() chipColor: string | undefined = undefined;

  value: ChamadoItem[] = [];
  draftNome = '';
  draftChamado = '';
  disabled = false;

  private onChange: (val: ChamadoItem[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: ChamadoItem[] | null): void {
    this.value = val ?? [];
  }
  registerOnChange(fn: (val: ChamadoItem[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  add(): void {
    const nome = this.draftNome.trim();
    if (!nome) return;
    this.value = [...this.value, { nome, chamado: this.draftChamado.trim() }];
    this.draftNome = '';
    this.draftChamado = '';
    this.onChange(this.value);
    this.onTouched();
  }

  remove(index: number, e?: Event): void {
    e?.preventDefault();
    this.value = this.value.filter((_, i) => i !== index);
    this.onChange(this.value);
    this.onTouched();
  }
}
