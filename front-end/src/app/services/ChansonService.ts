import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chanson } from '../Model/chanson';


@Injectable({
  providedIn: 'root'
})
export class ChansonService {
  private apiUrl = 'http://192.168.1.172:8888/api/chansons';


  constructor(private http: HttpClient) {}

  getAllChansons(): Observable<Chanson[]> {
    return this.http.get<Chanson[]>(this.apiUrl);
  }

  getChansonById(id: number): Observable<Chanson> {
    return this.http.get<Chanson>(`${this.apiUrl}/${id}`);
  }

  createChansonWithFiles(
    chanson: Chanson,
    paroles: File,
    partition: File,
    audio?: File
  ): Observable<Chanson> {
    const formData = new FormData();
    formData.append('titre', chanson.titre);
    if (chanson.chanteur) formData.append('chanteur', chanson.chanteur);
    if (chanson.compositeur) formData.append('compositeur', chanson.compositeur);
    if (chanson.parolier) formData.append('parolier', chanson.parolier);
    if (chanson.type) formData.append('type', chanson.type);
    if (chanson.annee !== undefined && chanson.annee !== null) formData.append('annee', chanson.annee.toString());
    if (chanson.rythme) formData.append('rythme', chanson.rythme);
    if (chanson.makam) formData.append('makam', chanson.makam);
    formData.append('paroles', paroles);
    formData.append('partition', partition);
    if (audio) formData.append('audio', audio);

    return this.http.post<Chanson>(this.apiUrl, formData);
  }

  updateChansonWithFiles(
    id: number,
    chanson: Chanson,
    paroles?: File,
    partition?: File,
    audio?: File
  ): Observable<Chanson> {
    const formData = new FormData();
    formData.append('titre', chanson.titre);
    formData.append('chanteur', chanson.chanteur);
    if (chanson.compositeur) formData.append('compositeur', chanson.compositeur);
    if (chanson.parolier) formData.append('parolier', chanson.parolier);
    if (chanson.type) formData.append('type', chanson.type);
    if (chanson.annee !== undefined && chanson.annee !== null) formData.append('annee', chanson.annee.toString());
    if (chanson.rythme) formData.append('rythme', chanson.rythme);
    if (chanson.makam) formData.append('makam', chanson.makam);
    if (paroles) formData.append('paroles', paroles);
    if (partition) formData.append('partition', partition);
    if (audio) formData.append('audio', audio);

    return this.http.put<Chanson>(`${this.apiUrl}/${id}`, formData);
  }

  deleteChanson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
