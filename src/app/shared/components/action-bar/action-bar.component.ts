import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ActionBarService } from './action-bar.service';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <nav class="action-bar">
      <button
        class="action-bar__btn action-bar__btn--left"
        nz-button
        nzType="text"
        (click)="svc.onLeftClick()"
        [disabled]="svc.left()?.disabled"
        [attr.aria-label]="svc.left()?.label"
      >
        @if (svc.left()?.icon) {
          <span nz-icon [nzType]="svc.left()!.icon!"></span>
        }
        @if (!svc.left()?.iconOnly) {
          <span>{{ svc.left()?.label }}</span>
        }
      </button>
      <button
        class="action-bar__btn action-bar__btn--right"
        nz-button
        nzType="primary"
        (click)="svc.onRightClick()"
        [disabled]="svc.right()?.disabled"
        [attr.aria-label]="svc.right()?.label"
      >
        @if (svc.right()?.icon) {
          <span nz-icon [nzType]="svc.right()!.icon!"></span>
        }
        <span>{{ svc.right()?.label }}</span>
      </button>
      @if (svc.rightSecondary()) {
        <button
          class="action-bar__btn action-bar__btn--secondary"
          nz-button
          nzType="text"
          nzDanger
          (click)="svc.onRightSecondaryClick()"
          [disabled]="svc.rightSecondary()!.disabled"
          [attr.aria-label]="svc.rightSecondary()!.label"
        >
          @if (svc.rightSecondary()!.icon) {
            <span nz-icon [nzType]="svc.rightSecondary()!.icon!"></span>
          }
          @if (!svc.rightSecondary()!.iconOnly) {
            <span>{{ svc.rightSecondary()!.label }}</span>
          }
        </button>
      }
    </nav>
  `,
  styles: [`
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: var(--frame-max, 560px);
      height: var(--bottom-nav-h);
      padding: 0 8px;
      padding-bottom: var(--safe-bottom);
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--paper-raised);
      border-top: 1px solid var(--line);
      z-index: 100;
    }

    .action-bar__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 44px;
      border-radius: var(--radius);
      font-size: 15px;
      font-weight: 600;
      transition: opacity 0.15s;
      -webkit-tap-highlight-color: transparent;
    }

    .action-bar__btn--left,
    .action-bar__btn--secondary {
      flex: 0 0 auto;
      min-width: 100px;
      color: var(--ink-soft);
    }

    .action-bar__btn--right {
      flex: 1;
      color: #fff;
    }

    .action-bar__btn[disabled] {
      opacity: 0.45;
      pointer-events: none;
    }
  `],
})
export class ActionBarComponent {
  svc = inject(ActionBarService);
}
