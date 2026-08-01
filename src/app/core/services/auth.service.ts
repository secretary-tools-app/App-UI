import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models';

const TOKEN_KEY = 'atas_token';
const USER_KEY = 'atas_user';
const ROLE_KEY = 'atas_role';
const ALANAME_KEY = 'atas_alaname';
const DISPLAYNAME_KEY = 'atas_displayname';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Reactive flag other parts of the UI can read (e.g. to show/hide the shell). */
  readonly isAuthenticated = signal<boolean>(!!this.getToken());
  readonly username = signal<string | null>(this.getStoredUsername());
  readonly role = signal<string | null>(this.getStoredRole());
  readonly alaName = signal<string | null>(this.getStoredAlaName());
  readonly displayName = signal<string | null>(this.getStoredDisplayName());

  /** Nome exibido no topo das telas: nome da ala, ou o usuário como fallback. */
  readonly alaTitle = computed(() => this.alaName() ?? this.username() ?? '');

  constructor(private http: HttpClient) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap((res) => {
        this.aplicarSessao(res);
      })
    );
  }

  register(req: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, req).pipe(
      tap((res) => {
        this.aplicarSessao(res);
      })
    );
  }

  setDisplayName(displayName: string | null): void {
    localStorage.setItem(DISPLAYNAME_KEY, displayName ?? '');
    this.displayName.set(displayName);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ALANAME_KEY);
    localStorage.removeItem(DISPLAYNAME_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
    this.role.set(null);
    this.alaName.set(null);
    this.displayName.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private aplicarSessao(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, res.username);
    localStorage.setItem(ROLE_KEY, res.role);
    localStorage.setItem(ALANAME_KEY, res.alaName ?? '');
    localStorage.setItem(DISPLAYNAME_KEY, res.displayName ?? '');
    this.isAuthenticated.set(true);
    this.username.set(res.username);
    this.role.set(res.role);
    this.alaName.set(res.alaName ?? null);
    this.displayName.set(res.displayName ?? null);
  }

  private getStoredUsername(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  private getStoredRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  }

  private getStoredAlaName(): string | null {
    return localStorage.getItem(ALANAME_KEY) || null;
  }

  private getStoredDisplayName(): string | null {
    return localStorage.getItem(DISPLAYNAME_KEY) || null;
  }
}
