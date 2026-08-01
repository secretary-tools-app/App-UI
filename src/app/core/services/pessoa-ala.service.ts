import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PessoaAlaResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PessoaAlaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pessoas-ala`;

  getAll() {
    return this.http.get<PessoaAlaResponse[]>(this.url);
  }

  create(nome: string) {
    return this.http.post<PessoaAlaResponse>(this.url, { nome });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
