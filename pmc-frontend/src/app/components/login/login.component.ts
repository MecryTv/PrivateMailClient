import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  sqlInjectionDetected: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already authenticated, redirect to mails if true
    this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/mails']);
      }
    });
  }

   /**
   * Detects common SQL injection patterns in input strings
   * @param input The string to check for SQL injection patterns
   * @returns true if SQL injection is detected, false otherwise
   */
   detectSqlInjection(input: string): boolean {
    if (!input) return false;
    
    // Common SQL injection patterns
    const sqlPatterns = [
      /\bselect\b.*\bfrom\b/i,         // SELECT ... FROM
      /\binsert\b.*\binto\b/i,         // INSERT INTO
      /\bupdate\b.*\bset\b/i,          // UPDATE ... SET
      /\bdelete\b.*\bfrom\b/i,         // DELETE FROM
      /\bdrop\b.*\btable\b/i,          // DROP TABLE
      /\balter\b.*\btable\b/i,         // ALTER TABLE
      /\bexec\b/i,                     // EXEC
      /\bunion\b.*\bselect\b/i,        // UNION SELECT
      /\bor\b.*\b1\s*=\s*1\b/i,        // OR 1=1
      /\bor\b.*\b'\s*'\s*=\s*'/i,      // OR ''='
      /\b--\b/,                        // --
      /\b;\s*--\b/,                    // ;--
      /';/,                            // ';
      /\b\/\*/,                        // /*
      /\*\/\b/                         // */
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  onLogin(): void {
    this.errorMessage = '';
    this.sqlInjectionDetected = false;

    // Check for SQL injection
    if (this.detectSqlInjection(this.username) || this.detectSqlInjection(this.password)) {
      this.errorMessage = 'Sicherheitsverstoß erkannt! SQL-Injection-Versuche sind nicht erlaubt.';
      this.sqlInjectionDetected = true;
      return;
    }
    
    this.isLoading = true;

    if (!this.username || !this.password) {
      this.errorMessage = 'Benutzername und Passwort werden benötigt';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/mails']);
        } else {
          this.errorMessage = response.message || 'Login fehlgeschlagen';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Verbindungsfehler. Bitte versuchen Sie es später noch einmal.';
        console.error('Login error:', error);
        this.isLoading = false;
      }
    });
  }
}
