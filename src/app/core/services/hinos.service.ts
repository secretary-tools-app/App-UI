import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hino } from '../models/hinos.model';

@Injectable({ providedIn: 'root' })
export class HinosService {
  private readonly base = `${environment.apiUrl}/hinos`;

  constructor(private http: HttpClient) {}

  buscar(busca: string): Observable<Hino[]> {
    return this.http.get<Hino[]>(this.base, {
      params: busca ? { busca } : {},
    });
  }
}
