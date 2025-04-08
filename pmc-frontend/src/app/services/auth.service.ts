import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../enviroment/enviroment'
import { AuthResponse } from '../interfaces/auth/authResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiURL = `${environment.apiUrl}/auth`;
  private tokenKey = 'authToken';
  private isBrowser: boolean;
  private isAuthSubject = new BehaviorSubject<boolean>(false);

  isAuthed$ = this.isAuthSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Prüfen, ob wir im Browser sind
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Token-Check nur im Browser
    if (this.isBrowser) {
      this.isAuthSubject.next(this.hasToken());
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiURL}/login`, { username, password })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            // Store token in localStorage only in browser
            if (this.isBrowser) {
              localStorage.setItem(this.tokenKey, response.token);
            }
            // Update authentication state
            this.isAuthSubject.next(true);
          }
        })
      );
  }

  /**
   * Logout user and clear token
   */
  logout(): void {
    // Remove token from localStorage if in browser
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    // Update authentication state
    this.isAuthSubject.next(false);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    // If no token, return false immediately
    if (!this.hasToken()) {
      return of(false);
    }

    // Verify token with backend
    return this.verifyToken().pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  /**
   * Verify if token is valid with backend
   */
  private verifyToken(): Observable<AuthResponse> {
    const token = this.getToken();
    return this.http.get<AuthResponse>(`${this.apiURL}/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Check if token exists in localStorage
   */
  private hasToken(): boolean {
    return this.isBrowser ? !!localStorage.getItem(this.tokenKey) : false;
  }

  /**
   * Get HTTP authorization headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
