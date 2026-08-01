import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SacramentalData } from '../models';
import { DiscursantesState, DiscursanteSugestao, SaveDiscursantesRequest } from '../models/discursantes.model';

@Injectable({ providedIn: 'root' })
export class DiscursantesService {
  private readonly base = `${environment.apiUrl}/discursantes`;

  constructor(private http: HttpClient) {}

  getRecentes(dias = 90): Observable<SacramentalData[]> {
    return this.http.get<SacramentalData[]>(`${this.base}/recentes`, {
      params: { dias },
    });
  }

  getState(date: string): Observable<DiscursantesState> {
    return this.http.get<DiscursantesState>(`${this.base}/state`, {
      params: { date },
    });
  }

  getSugestoes(): Observable<DiscursanteSugestao[]> {
    return this.http.get<DiscursanteSugestao[]>(`${this.base}/sugestoes`);
  }

  salvar(req: SaveDiscursantesRequest): Observable<DiscursantesState> {
    return this.http.post<DiscursantesState>(`${this.base}/salvar`, req);
  }
}
