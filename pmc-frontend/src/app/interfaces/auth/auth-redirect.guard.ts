import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Wenn bereits authentifiziert, zur Mails-Seite weiterleiten
          this.router.navigate(['/mails']);
          return false;
        }
        // Nicht authentifiziert, Zugriff auf Login erlauben
        return true;
      })
    );
  }
}
