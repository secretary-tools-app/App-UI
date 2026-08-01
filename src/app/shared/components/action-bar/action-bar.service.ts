import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ActionBarBtn {
  label: string;
  icon?: string;
  disabled?: boolean;
  iconOnly?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ActionBarService {
  left = signal<ActionBarBtn | null>(null);
  right = signal<ActionBarBtn | null>(null);
  rightSecondary = signal<ActionBarBtn | null>(null);
  hidden = signal(false);

  private leftClick = new Subject<void>();
  private rightClick = new Subject<void>();
  private rightSecondaryClick = new Subject<void>();

  leftClicked$ = this.leftClick.asObservable();
  rightClicked$ = this.rightClick.asObservable();
  rightSecondaryClicked$ = this.rightSecondaryClick.asObservable();

  setHidden(hidden: boolean): void {
    this.hidden.set(hidden);
  }

  onLeftClick(): void {
    this.leftClick.next();
  }

  onRightClick(): void {
    this.rightClick.next();
  }

  onRightSecondaryClick(): void {
    this.rightSecondaryClick.next();
  }

  clear(): void {
    this.left.set(null);
    this.right.set(null);
    this.rightSecondary.set(null);
  }
}
