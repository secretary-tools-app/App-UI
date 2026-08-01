import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { SwUpdate } from '@angular/service-worker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { ActionBarComponent } from './shared/components/action-bar/action-bar.component';
import { ActionBarService } from './shared/components/action-bar/action-bar.service';

const routeAnimations = trigger('routeAnimations', [
  transition('* => detail', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(32px)' }),
      animate('260ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
    ], { optional: true }),
  ]),
  transition('detail => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-32px)' }),
      animate('260ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
    ], { optional: true }),
  ]),
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, ActionBarComponent],
  animations: [routeAnimations],
  template: `
    <div class="app-frame" [class.app-frame--has-nav]="showNav()">
      <div class="route-shell" [@routeAnimations]="routeState(outlet)">
        <router-outlet #outlet="outlet"></router-outlet>
      </div>
    </div>
    @if (showNav()) {
      <app-bottom-nav />
    }
    @if ((actionBarSvc.left() || actionBarSvc.right()) && !actionBarSvc.hidden()) {
      <app-action-bar />
    }
  `,
  styles: [
    `
      .app-frame {
        min-height: 100dvh;
        max-width: var(--frame-max);
        margin: 0 auto;
        background: var(--paper);
        position: relative;

        @media (min-width: 561px) {
          box-shadow: 0 0 0 1px var(--line);
        }
      }
      .app-frame--has-nav {
        padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom));
      }

      @media (min-width: 768px) {
        :host {
          background: linear-gradient(180deg, #e8e6f0 0%, var(--paper) 100%);
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private swUpdate = inject(SwUpdate);
  private msg = inject(NzMessageService);
  actionBarSvc = inject(ActionBarService);
  showNav = signal(true);

  private destroyed = false;
  private removeListeners: (() => void)[] = [];

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe((e) => {
      const isLogin = e.urlAfterRedirects.includes('/login');
      const hasActionBar = this.hasActionBarData(this.router.routerState.snapshot.root);
      this.showNav.set(!isLogin && !hasActionBar);
    });
  }

  ngOnInit(): void {
    this.trackConnectivity();
    this.trackUpdates();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.removeListeners.forEach((l) => l());
  }

  private hasActionBarData(snapshot: ActivatedRouteSnapshot): boolean {
    if (snapshot.data?.['actionBar']) return true;
    for (const child of snapshot.children) {
      if (this.hasActionBarData(child)) return true;
    }
    return false;
  }

  routeState(outlet: RouterOutlet): string {
    return outlet?.isActivated ? (outlet.activatedRouteData['animation'] ?? '') : '';
  }

  private trackConnectivity(): void {
    const offline = () => {
      if (this.destroyed) return;
      this.msg.warning('Você está offline. Alguns dados podem não carregar.', { nzDuration: 3000 });
    };
    const online = () => {
      if (this.destroyed) return;
      this.msg.success('Conexão restaurada.', { nzDuration: 2000 });
    };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    this.removeListeners.push(() => {
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    });
  }

  private trackUpdates(): void {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates.subscribe((evt) => {
      if (evt.type === 'VERSION_READY' && !this.destroyed) {
        this.msg.info('Nova versão disponível. Recarregue a página para atualizar.', {
          nzDuration: 5000,
        });
      }
    });
  }
}
