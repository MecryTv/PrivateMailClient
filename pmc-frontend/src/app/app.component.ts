import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PrivateMailClient';
  isAuthenticated = false;
  private authSubscription: Subscription | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Abonniere den Authentifizierungsstatus
    this.authSubscription = this.authService.isAuthenticated()
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });
  }
  
  ngOnDestroy(): void {
    // Aufräumen, um Memory Leaks zu vermeiden
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
