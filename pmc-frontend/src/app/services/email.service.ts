import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Email, BackendEmail } from '../interfaces/email';
import { environment } from '../../enviroment/enviroment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiURL = `${environment.apiUrl}/emails`;
  private mailsApiURL = `${environment.apiUrl}/mails`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Lädt alle E-Mails vom Server
   * @returns Observable mit einer Liste von E-Mails
   */
  getEmails(): Observable<Email[]> {
    
    // Token aus dem AuthService holen und Headers erstellen
    const headers = this.getAuthHeaders();
    
    return this.http.get<BackendEmail[]>(this.mailsApiURL, { headers }).pipe(
      map(backendEmails => this.transformBackendEmails(backendEmails)),
      catchError(error => {
        console.error('Fehler beim Laden der E-Mails vom Backend:', error);
        // Für den Fall von Fehlern geben wir Dummy-Daten zurück
        return of(this.getDummyEmails());
      })
    );
  }

  /**
   * Wandelt die Backend E-Mail Daten in das Frontend-Format um
   * @param backendEmails Die E-Mails vom Backend
   * @returns Array von Frontend-E-Mails
   */
  private transformBackendEmails(backendEmails: BackendEmail[]): Email[] {
    if (!backendEmails || !Array.isArray(backendEmails)) {
      console.error('Ungültiges Datenformat vom Backend:', backendEmails);
      return [];
    }

    return backendEmails.map(mail => ({
      id: mail.id,
      sender: mail.from.name,
      senderEmail: mail.from.email,
      senderFaviconUrls: mail.from.faviconUrls,
      subject: mail.subject,
      content: mail.body,
      date: mail.date,
      hasAttachment: mail.hasAttachments,
      isRead: mail.isRead,
      category: ''
    }));
  }

  /**
   * Gibt Dummy-E-Mail-Daten zurück, wenn der Server nicht verfügbar ist
   * @returns Array von Test-E-Mails
   */
  private getDummyEmails(): Email[] {
    return [
      {
        id: 1,
        sender: 'Marketing',
        subject: 'Kundenfeedback #14',
        date: '07.04.2025 17:40',
        hasAttachment: true,
        isRead: false
      },
      {
        id: 2,
        sender: 'MecryTv',
        subject: 'Willkommen beim eigenen E-Mail-Client!',
        date: '06.04.2025 10:00',
        hasAttachment: false,
        isRead: false
      },
      {
        id: 3,
        sender: 'Support',
        subject: 'Ihre Anfrage wurde bearbeitet',
        date: '05.04.2025 08:15',
        hasAttachment: true,
        isRead: true
      },
      {
        id: 4,
        sender: 'Newsletter',
        subject: 'Neuigkeiten im April',
        date: '04.04.2025 11:30',
        hasAttachment: false,
        isRead: true
      }
    ];
  }

  /**
   * Holt die verfügbaren E-Mail-Adressen für Antworten/Weiterleiten vom Backend
   * @returns Observable mit einer Liste von E-Mail-Adressen
   */
  getAvailableEmailAddresses(): Observable<string[]> {
    const headers = this.getAuthHeaders();
    // Verwende die neue alternative Route für E-Mail-Adressen
    const emailAddressesUrl = `${environment.apiUrl}/emails/addresses`;
    
    console.log('Lade E-Mail-Adressen von alternativer Route:', emailAddressesUrl);

    return this.http.get<{addresses: string[]}>(emailAddressesUrl, { headers }).pipe(
      map(response => {
        console.log('Empfangene E-Mail-Adressen:', response);
        return response.addresses || [];
      }),
      catchError(error => {
        console.error('Fehler beim Laden der E-Mail-Adressen:', error);
        // Leeres Array zurückgeben, damit die Komponente einen leeren Zustand anzeigen kann
        return of([]);
      })
    );
  }
  
  /**
   * Überprüft in Echtzeit, ob eine E-Mail-Adresse in der Datenbank existiert
   * @param email Die zu überprüfende E-Mail-Adresse
   * @returns Observable mit dem Ergebnis der Überprüfung (true/false)
   */
  checkEmailAddressExists(email: string): Observable<boolean> {
    const headers = this.getAuthHeaders();
    const checkUrl = `${environment.apiUrl}/emails/check?email=${encodeURIComponent(email)}`;
    
    return this.http.get<{exists: boolean}>(checkUrl, { headers }).pipe(
      map(response => response.exists),
      catchError(error => {
        console.error('Fehler bei der Überprüfung der E-Mail-Adresse:', error);
        // Bei Fehlern davon ausgehen, dass die E-Mail nicht existiert
        return of(false);
      })
    );
  }

  /**
   * Erstellt die Auth-Headers für die API-Anfragen
   * @returns HttpHeaders mit dem Authorization-Token, falls vorhanden
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token 
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`) 
      : new HttpHeaders();
  }

}
