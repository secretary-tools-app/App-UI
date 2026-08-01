import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppInfo } from '../models/app.model';
 
@Injectable({ providedIn: 'root' })
export class AppService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/app`;
 
  /**
   * Versão do app e contato de WhatsApp.
   * O contato só é retornado pela API (endpoint autenticado) —
   * nunca deve ser hardcoded aqui no frontend, pois este arquivo vai pro git.
   */
  getInfo() {
    return this.http.get<AppInfo>(`${this.url}/info`);
  }
}