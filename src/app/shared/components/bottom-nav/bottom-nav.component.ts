import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NzIconModule],
  template: `
    <nav class="bottom-nav" aria-label="Navegação principal">
      <a class="bottom-nav__item" routerLink="/atas" routerLinkActive="bottom-nav__item--active" [routerLinkActiveOptions]="{ exact: true }" #l1="routerLinkActive">
        <span nz-icon nzType="file-text" [nzTheme]="l1.isActive ? 'fill' : 'outline'"></span>
        <span class="bottom-nav__label">Atas</span>
      </a>
      <a class="bottom-nav__item" routerLink="/atas/planning" routerLinkActive="bottom-nav__item--active" #l2="routerLinkActive">
        <span nz-icon nzType="calendar" [nzTheme]="l2.isActive ? 'fill' : 'outline'"></span>
        <span class="bottom-nav__label">Planejamento</span>
      </a>
      <a class="bottom-nav__item" routerLink="/tarefas" routerLinkActive="bottom-nav__item--active" #l3="routerLinkActive">
        <span nz-icon nzType="check-square" [nzTheme]="l3.isActive ? 'fill' : 'outline'"></span>
        <span class="bottom-nav__label">Tarefas</span>
      </a>
      <a class="bottom-nav__item" routerLink="/configuracoes" routerLinkActive="bottom-nav__item--active" #l4="routerLinkActive">
        <span nz-icon nzType="setting" [nzTheme]="l4.isActive ? 'fill' : 'outline'"></span>
        <span class="bottom-nav__label">Ajustes</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: var(--frame-max, 560px);
      height: var(--bottom-nav-h);
      padding-bottom: var(--safe-bottom);
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: var(--paper-raised);
      border-top: 1px solid var(--line);
      box-shadow: 0 -2px 12px rgba(30, 27, 46, 0.04);
      z-index: 100;
    }

    .bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: var(--ink-soft);
      font-size: 11px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: var(--radius);
      transition: color 0.15s, background 0.15s;
      -webkit-tap-highlight-color: transparent;
      min-height: 48px;
      min-width: 48px;
    }

    .bottom-nav__item--active {
      color: var(--primary);
      background: var(--primary-soft);
    }

    .bottom-nav__item .anticon {
      font-size: 22px;
      line-height: 1;
    }

    .bottom-nav__label {
      line-height: 1;
      letter-spacing: 0.01em;
    }

    @media (min-width: 768px) {
      .bottom-nav__item {
        padding: 8px 22px;
      }
    }
  `],
})
export class BottomNavComponent {}
