import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instrumental } from '../Model/Instrumental';

@Injectable({
  providedIn: 'root'
})
export class InstrumentalService {
  private apiUrl = 'http://192.168.1.172:8888/api/instrumentals';

  constructor(private http: HttpClient) {}

  /**
   * Get all instrumentals (without files)
   */
  getAllInstrumentals(): Observable<Instrumental[]> {
    return this.http.get<Instrumental[]>(this.apiUrl);
  }

  /**
   * Get an instrumental by its ID
   * @param id Instrumental ID
   */
  getInstrumentalById(id: number): Observable<Instrumental> {
    return this.http.get<Instrumental>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new instrumental with files (partition required, audio optional)
   * @param instrumentalData Instrumental data (titre, compositeur, annee, rythme, makam)
   * @param partitionFile Partition file (required)
   * @param audioFile Audio file (optional)
   */
  createInstrumentalWithFiles(
    instrumentalData: {
      titre: string;
      compositeur?: string;
      annee?: number;
      rythme?: string;
      makam?: string;
    },
    partitionFile: File,
    audioFile?: File
  ): Observable<Instrumental> {
    const formData = new FormData();
    formData.append('titre', instrumentalData.titre);
    if (instrumentalData.compositeur) {
      formData.append('compositeur', instrumentalData.compositeur);
    }
    if (instrumentalData.annee !== undefined && instrumentalData.annee !== null) {
      formData.append('annee', instrumentalData.annee.toString());
    }
    if (instrumentalData.rythme) {
      formData.append('rythme', instrumentalData.rythme);
    }
    if (instrumentalData.makam) {
      formData.append('makam', instrumentalData.makam);
    }
    formData.append('partition', partitionFile);
    if (audioFile) {
      formData.append('audio', audioFile);
    }

    return this.http.post<Instrumental>(this.apiUrl, formData);
  }

  /**
   * Update an existing instrumental with files (all files optional)
   * @param id Instrumental ID
   * @param instrumentalData Instrumental data (titre, compositeur, annee, rythme, makam)
   * @param partitionFile Partition file (optional)
   * @param audioFile Audio file (optional)
   */
  updateInstrumentalWithFiles(
    id: number,
    instrumentalData: {
      titre: string;
      compositeur?: string;
      annee?: number;
      rythme?: string;
      makam?: string;
    },
    partitionFile?: File,
    audioFile?: File
  ): Observable<Instrumental> {
    const formData = new FormData();
    formData.append('titre', instrumentalData.titre);
    if (instrumentalData.compositeur) {
      formData.append('compositeur', instrumentalData.compositeur);
    }
    if (instrumentalData.annee !== undefined && instrumentalData.annee !== null) {
      formData.append('annee', instrumentalData.annee.toString());
    }
    if (instrumentalData.rythme) {
      formData.append('rythme', instrumentalData.rythme);
    }
    if (instrumentalData.makam) {
      formData.append('makam', instrumentalData.makam);
    }
    if (partitionFile) {
      formData.append('partition', partitionFile);
    }
    if (audioFile) {
      formData.append('audio', audioFile);
    }

    return this.http.put<Instrumental>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Delete an instrumental by its ID
   * @param id Instrumental ID
   */
  deleteInstrumental(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
