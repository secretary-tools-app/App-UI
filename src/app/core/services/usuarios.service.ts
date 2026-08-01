import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UsuarioResponse, UpdateProfileRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  getAll() {
    return this.http.get<UsuarioResponse[]>(this.url);
  }

  updateMe(data: UpdateProfileRequest) {
    return this.http.put<UsuarioResponse>(`${this.url}/me`, data);
  }
}
