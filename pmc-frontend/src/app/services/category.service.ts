import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { environment } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiURL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiURL);
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiURL, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiURL}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    console.log(`Sende HTTP DELETE-Anfrage an: ${this.apiURL}/${id}`);
    
    return this.http.delete(`${this.apiURL}/${id}`, {
      observe: 'response',
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }
}
