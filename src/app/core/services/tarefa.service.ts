import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TarefaResponse, CreateTarefaRequest } from '../models';

export interface UpdateTarefaRequest {
  titulo?: string;
  responsavel?: string;
  dataPrevista?: string;
  concluida?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tarefas`;

  getAll() {
    return this.http.get<TarefaResponse[]>(this.url);
  }

  create(data: CreateTarefaRequest) {
    return this.http.post<TarefaResponse>(this.url, data);
  }

  update(id: number, data: UpdateTarefaRequest) {
    return this.http.put<TarefaResponse>(`${this.url}/${id}`, data);
  }

  toggle(id: number) {
    return this.http.patch<TarefaResponse>(`${this.url}/${id}/toggle`, {});
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
