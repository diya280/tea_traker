import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeaEntry {
  _id?: string;
  personName: string;
  date: string;
  count: number;
  remarks?: string;
}
export interface TeaSummary {
  totalTea: number;
  entryCount: number;
  peopleCount: number;
  byPerson: { personName: string; totalTea: number; entries: number }[];
}

@Injectable({ providedIn: 'root' })
export class TeaService {
  private http = inject(HttpClient);
  private api = 'https://tea-traker.onrender.com/api/tea';

  getEntries(month: number, year: number, search = ''): Observable<{ success: boolean; data: TeaEntry[] }> {
    const params = new HttpParams().set('month', month).set('year', year).set('search', search);
    return this.http.get<{ success: boolean; data: TeaEntry[] }>(this.api, { params });
  }
  getSummary(month: number, year: number): Observable<{ success: boolean; data: TeaSummary }> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<{ success: boolean; data: TeaSummary }>(`${this.api}/summary`, { params });
  }
  add(entry: TeaEntry) { return this.http.post<{ success: boolean; data: TeaEntry }>(this.api, entry); }
  update(id: string, entry: TeaEntry) { return this.http.put<{ success: boolean; data: TeaEntry }>(`${this.api}/${id}`, entry); }
  delete(id: string) { return this.http.delete<{ success: boolean }>(`${this.api}/${id}`); }
}
