import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Email } from '../../interfaces/email';
import { finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-mails',
  standalone: false,
  templateUrl: './mails.component.html',
  styleUrl: './mails.component.css'
})
export class MailsComponent implements OnInit {
  emails: Email[] = [];
  isLoading = true;
  errorMessage = '';
  selectedEmail: Email | null = null;
  
  // E-Mail-Auswahl
  selectedEmails: Set<number> = new Set<number>();
  allEmailsSelected: boolean = false;
  
  // Anzahl der ausgewählten E-Mails
  get selectedEmailsCount(): number {
    return this.selectedEmails.size;
  }
  
  // States für Antworten/Weiterleiten
  isReplying = false;
  isForwarding = false;
  selectedReplyEmail: string = '';
  replyContent: string = '';
  availableEmails: string[] = [];
  
  // Ziel-E-Mail für Weiterleiten
  forwardTargetEmail: string = '';
  isForwardEmailValid: boolean = false;
  
  // Zweistufiger Prozess
  replyStep = 1; // 1 = E-Mail-Auswahl, 2 = Text schreiben
  
  // Echtzeit-Email-Prüfung
  newEmailAddress: string = '';
  isValidEmail: boolean = false;
  emailExists: boolean = false;
  isCheckingEmail: boolean = false;
  private emailCheckSubject = new Subject<string>();
  
  // Pagination-Eigenschaften
  currentPage = 1;
  itemsPerPage = 25; // Maximal 25 Mails pro Seite

  constructor(private emailService: EmailService) {
    // Setup für Echtzeit-E-Mail-Überprüfung
    this.emailCheckSubject.pipe(
      debounceTime(300), // Warte 300ms nach der letzten Eingabe
      distinctUntilChanged(), // Ignoriere, wenn sich der Wert nicht geändert hat
      switchMap(email => {
        this.isCheckingEmail = true;
        return this.emailService.checkEmailAddressExists(email);
      })
    ).subscribe(exists => {
      this.emailExists = exists;
      this.isCheckingEmail = false;
    });
  }

  ngOnInit(): void {
    this.loadEmails();
    this.loadAvailableEmails();
  }
  
  /**
   * Lädt verfügbare E-Mail-Adressen für die Antwort-Auswahl aus dem Backend
   */
  loadAvailableEmails(): void {
    // Lädt die verfügbaren E-Mail-Adressen vom Backend
    // Falls dies fehlschlägt, werden automatisch Dummy-Daten angezeigt
    this.isLoading = true;
    this.emailService.getAvailableEmailAddresses()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (addresses: string[]) => {
          this.availableEmails = addresses;
          
          // Bei erfolgreicher Abfrage sicherstellen, dass eine E-Mail ausgewählt ist
          if (this.availableEmails.length > 0 && !this.selectedReplyEmail) {
            this.selectedReplyEmail = this.availableEmails[0];
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der E-Mail-Adressen:', error);
          this.errorMessage = 'E-Mail-Adressen konnten nicht geladen werden';
        }
      });
  }

  /**
   * Lädt die E-Mails vom Server
   */
  loadEmails(): void {
    this.isLoading = true;
    this.emailService.getEmails().subscribe({
      next: (emails: Email[]) => {
        this.emails = emails;
        this.isLoading = false;
        
        // Debug-Ausgabe für die ersten E-Mails und deren Favicon-URLs
        console.log('Geladene E-Mails:', emails.slice(0, 2));
        if (emails.length > 0) {
          console.log('Erste E-Mail senderFaviconUrls:', emails[0].senderFaviconUrls);
        }
        
        // Stellen Sie sicher, dass die aktuelle Seite gültig ist
        this.validateCurrentPage();
      },
      error: (error: any) => {
        this.errorMessage = 'Fehler beim Laden der E-Mails';
        this.isLoading = false;
        console.error(error);
      }
    });
  }
  
  /**
   * Gibt die E-Mails zurück, die auf der aktuellen Seite angezeigt werden sollen
   */
  get displayedEmails(): Email[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.emails.slice(startIndex, endIndex);
  }
  
  /**
   * Gibt die Gesamtzahl der E-Mails zurück
   */
  get totalEmails(): number {
    return this.emails.length;
  }
  
  /**
   * Behandelt die Seitenänderung aus der Toolbar
   */
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    // Wenn eine E-Mail ausgewählt ist, deselektieren wir sie beim Seitenwechsel
    this.selectedEmail = null;
    // Setze Auswahlstatus zurück
    this.selectedEmails.clear();
    this.allEmailsSelected = false;
  }
  
  /**
   * Stellt sicher, dass die aktuelle Seite gültig ist
   */
  private validateCurrentPage(): void {
    const maxPage = Math.ceil(this.totalEmails / this.itemsPerPage);
    if (maxPage > 0 && this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
  }

  /**
   * Formatiert das Datum für die Anzeige
   * @param date Datum als String oder Date-Objekt
   * @returns Formatiertes Datum
   */
  formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      // Prüfen, ob das Format bereits korrekt ist (wie im Screenshot)
      if (date.match(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/)) {
        return date;
      }
      
      // Versuchen, das Datum zu parsen, wenn es kein exaktes Format hat
      try {
        const dateObj = new Date(date);
        return this.formatDateObject(dateObj);
      } catch {
        return date; // Wenn das Parsen fehlschlägt, das Original zurückgeben
      }
    }
    
    // Formatieren des Date-Objekts
    return this.formatDateObject(new Date(date));
  }
  
  /**
   * Formatiert ein Date-Objekt genau wie im Screenshot
   * @param dateObj Das zu formatierende Date-Objekt
   * @returns Formatiertes Datum im Format DD.MM.YYYY HH:MM
   */
  private formatDateObject(dateObj: Date): string {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  
  /**
   * Wählt eine E-Mail aus und zeigt die Details an
   * @param email Die auszuwählende E-Mail
   */
  selectEmail(email: Email): void {
    this.selectedEmail = email;
    // Wenn E-Mail Details geöffnet werden, Auswahl zurücksetzen
    this.selectedEmails.clear();
    this.allEmailsSelected = false;
    
    // Wenn die E-Mail nicht als gelesen markiert ist, markieren wir sie jetzt als gelesen
    // In einer realen Anwendung würde hier ein API-Aufruf stehen
    if (!email.isRead) {
      email.isRead = true;
    }
  }
  
  /**
   * Schließt die Detailansicht und kehrt zur Mail-Liste zurück
   */
  closeDetailView(): void {
    this.selectedEmail = null;
    this.isReplying = false;
    this.isForwarding = false;
    this.selectedReplyEmail = '';
    this.replyContent = '';
    this.forwardTargetEmail = '';
    this.isForwardEmailValid = false;
    this.replyStep = 1;
  }
  
  /**
   * Wählt eine E-Mail aus oder hebt die Auswahl auf (checkbox)
   * @param email Die E-Mail, deren Auswahl geändert werden soll
   * @param event Das Event, um Propagation zu verhindern
   */
  toggleEmailSelection(email: Email, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.selectedEmails.has(email.id)) {
      this.selectedEmails.delete(email.id);
    } else {
      this.selectedEmails.add(email.id);
    }
    
    // Prüfe, ob alle E-Mails der aktuellen Seite ausgewählt sind
    this.checkIfAllSelected();
  }
  
  /**
   * Prüft, ob alle Emails auf der aktuellen Seite ausgewählt sind
   */
  private checkIfAllSelected(): void {
    this.allEmailsSelected = this.displayedEmails.length > 0 && 
                             this.displayedEmails.every(email => this.selectedEmails.has(email.id));
  }
  
  /**
   * Prüft, ob eine bestimmte E-Mail ausgewählt ist
   * @param email Die zu prüfende E-Mail
   */
  isEmailSelected(email: Email): boolean {
    return this.selectedEmails.has(email.id);
  }
  
  /**
   * Wählt alle E-Mails auf der aktuellen Seite aus oder hebt die Auswahl auf
   * @param selected Ob alle ausgewählt werden sollen (true) oder keiner (false)
   */
  handleSelectAllChange(selected: boolean): void {
    this.allEmailsSelected = selected;
    
    if (selected) {
      // Alle E-Mails der aktuellen Seite auswählen
      this.displayedEmails.forEach(email => this.selectedEmails.add(email.id));
    } else {
      // Alle E-Mails der aktuellen Seite abwählen
      this.displayedEmails.forEach(email => this.selectedEmails.delete(email.id));
    }
  }
  
  /**
   * Löscht die ausgewählten E-Mails (aktuell nur Simulation)
   */
  deleteSelectedEmails(): void {
    // Hier würde später eine API-Anfrage zum Löschen der E-Mails erfolgen
    console.log(`${this.selectedEmailsCount} E-Mails werden gelöscht:`, [...this.selectedEmails]);
    
    // Simulierte Löschoperation
    this.emails = this.emails.filter(email => !this.selectedEmails.has(email.id));
    
    // Auswahl zurücksetzen
    this.selectedEmails.clear();
    this.allEmailsSelected = false;
    
    // Stellen Sie sicher, dass die aktuelle Seite gültig ist
    this.validateCurrentPage();
  }
  
  /**
   * Verschiebt die ausgewählten E-Mails in einen anderen Ordner (aktuell nur Simulation)
   */
  moveSelectedEmails(): void {
    // Hier würde später eine UI zum Auswählen des Zielordners angezeigt
    console.log(`${this.selectedEmailsCount} E-Mails werden verschoben:`, [...this.selectedEmails]);
    
    // In einer vollständigen Implementierung würde hier eine Ordnerauswahl angezeigt
    alert(`${this.selectedEmailsCount} E-Mails werden verschoben (Ordnerauswahl noch nicht implementiert)`);
    
    // Auswahl zurücksetzen
    this.selectedEmails.clear();
    this.allEmailsSelected = false;
  }
  
  /**
   * Bricht die aktuelle Auswahl ab und setzt alle Auswahlstatus zurück
   */
  cancelSelection(): void {
    this.selectedEmails.clear();
    this.allEmailsSelected = false;
  }
  
  /**
   * Startet das Antworten auf eine E-Mail
   */
  replyToEmail(): void {
    if (!this.selectedEmail) return;
    
    this.isReplying = true;
    this.isForwarding = false;
    this.replyStep = 1;
    
    if (this.availableEmails.length > 0) {
      this.selectedReplyEmail = this.availableEmails[0];
    }
    
    // Vorbereiten des Antworttextes mit Zitat der Original-E-Mail
    this.replyContent = `
-------- Original-Nachricht von ${this.selectedEmail.sender} --------
${this.selectedEmail.content || ''}`;  
  }
  
  /**
   * Startet das Weiterleiten einer E-Mail
   */
  forwardEmail(): void {
    if (!this.selectedEmail) return;
    
    this.isReplying = false;
    this.isForwarding = true;
    this.replyStep = 1;
    
    // Zurücksetzen der Ziel-E-Mail-Adresse
    this.forwardTargetEmail = '';
    this.isForwardEmailValid = false;
    
    if (this.availableEmails.length > 0) {
      this.selectedReplyEmail = this.availableEmails[0];
    }
    
    // Vorbereiten des Weiterleitungstextes mit Original-E-Mail
    this.replyContent = `
-------- Weitergeleitete Nachricht --------
Von: ${this.selectedEmail.sender} <${this.selectedEmail.senderEmail || 'noreply@mecrytu.de'}>

${this.selectedEmail.content || ''}`;  
  }
  
  /**
   * Setzt die aktuell ausgewählte Antwort-E-Mail
   * @param email Die auszuwählende E-Mail-Adresse
   */
  selectReplyEmail(email: string): void {
    this.selectedReplyEmail = email;
  }
  
  /**
   * Überprüft, ob die eingegebene E-Mail-Adresse gültig ist und ob sie bereits existiert
   */
  checkEmailInRealtime(): void {
    // Prüfe zuerst, ob die E-Mail-Adresse ein gültiges Format hat
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    this.isValidEmail = emailRegex.test(this.newEmailAddress);
    
    // Wenn das Format gültig ist, prüfe, ob die E-Mail bereits existiert
    if (this.isValidEmail && this.newEmailAddress) {
      this.emailCheckSubject.next(this.newEmailAddress);
    } else {
      this.emailExists = false;
    }
  }
  
  /**
   * Validiert die Ziel-E-Mail-Adresse für das Weiterleiten
   */
  validateForwardEmail(): void {
    // Prüfen, ob die eingegebene E-Mail-Adresse ein gültiges Format hat
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    this.isForwardEmailValid = emailRegex.test(this.forwardTargetEmail);
  }
  
  /**
   * Fügt eine neue E-Mail-Adresse zur Datenbank hinzu
   */
  addNewEmail(): void {
    if (this.isValidEmail && !this.emailExists && this.newEmailAddress) {
      this.isLoading = true;
      
      // TODO: Implementieren eines API-Aufrufs zum Hinzufügen der E-Mail-Adresse
      // Hier wird nur ein Platzhalter-Code gezeigt, der die E-Mail-Adresse lokal hinzufügt
      setTimeout(() => {
        this.availableEmails.push(this.newEmailAddress);
        this.selectedReplyEmail = this.newEmailAddress;
        this.newEmailAddress = '';
        this.isLoading = false;
      }, 500);
    }
  }
  
  /**
   * Bricht den Antwort-/Weiterleitungsmodus ab
   */
  cancelReply(): void {
    this.isReplying = false;
    this.isForwarding = false;
    this.selectedReplyEmail = '';
    this.replyContent = '';
    this.forwardTargetEmail = '';
    this.isForwardEmailValid = false;
    this.replyStep = 1;
  }
  
  /**
   * Geht zum nächsten Schritt im Antwort-/Weiterleitungsprozess
   */
  nextStep(): void {
    if (this.replyStep === 1) {
      // Bei Weiterleitung prüfen, ob eine gültige Ziel-E-Mail eingegeben wurde
      if (this.isForwarding && (!this.forwardTargetEmail || !this.isForwardEmailValid)) {
        return; // Nicht fortfahren, wenn Weiterleitung ohne gültige Ziel-E-Mail
      }
      
      // Nur weitergehen, wenn eine Absender-E-Mail ausgewählt wurde
      if (this.selectedReplyEmail) {
        this.replyStep = 2;
      }
    }
  }
  
  /**
   * Geht zum vorherigen Schritt im Antwortprozess
   */
  previousStep(): void {
    if (this.replyStep === 2) {
      this.replyStep = 1;
    }
  }
  
  /**
   * Sendet die Antwort oder Weiterleitung
   */
  sendReply(): void {
    // Hier würde die Logik zum Senden der E-Mail implementiert werden
    console.log('E-Mail gesendet an:', this.selectedReplyEmail);
    console.log('Inhalt:', this.replyContent);
    
    // Nach dem Senden zurücksetzen
    this.cancelReply();
  }
  
  /**
   * Liefert das entsprechende Logo für den Mail-Absender
   * @param sender Der Name des Absenders
   * @returns URL zum Logo des Absenders
   */
  getMailLogo(sender: string): string {
    // Suche die E-Mail anhand des Absendernamens
    const email = this.emails.find(e => e.sender === sender);
    
    // Wenn E-Mail gefunden und Favicon-URLs vorhanden sind
    if (email?.senderFaviconUrls) {
      // Priorisierte Reihenfolge von Favicon-Quellen
      const sources = [
        email.senderFaviconUrls.googleFavicon,
        email.senderFaviconUrls.duckDuckGoFavicon,
        email.senderFaviconUrls.faviconkit,
        email.senderFaviconUrls.favicon,
        email.senderFaviconUrls.appleTouchIcon,
        email.senderFaviconUrls.fallback
      ];
      
      // Die erste vorhandene URL zurückgeben
      for (const source of sources) {
        if (source) return source;
      }
    }
    
    // Fallback: Platzhalter-Logo mit Initialen
    return `https://via.placeholder.com/36/${this.getColorForSender(sender)}/FFFFFF?text=${sender.charAt(0)}`;
  }
  
  /**
   * Generiert eine konsistente Farbe basierend auf dem Absendernamen
   * @param sender Der Name des Absenders
   * @returns Ein Hex-Farbcode ohne # für den Platzhalter
   */
  getColorForSender(sender: string): string {
    // Einfache Hash-Funktion für Namen, um eine konsistente Farbe zu generieren
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Die Farben auf einen dunkleren Bereich beschränken (für bessere Lesbarkeit)
    const r = Math.min(Math.max(((hash & 0xFF0000) >> 16) & 0xFF, 40), 150);
    const g = Math.min(Math.max(((hash & 0x00FF00) >> 8) & 0xFF, 40), 150);
    const b = Math.min(Math.max(hash & 0x0000FF, 40), 150);
    
    // In Hex-Format umwandeln
    return r.toString(16).padStart(2, '0') + 
           g.toString(16).padStart(2, '0') + 
           b.toString(16).padStart(2, '0');
  }

  /**
   * Ermittelt das passende Icon für einen Dateityp basierend auf der Dateiendung
   * @param filename Der Dateiname oder Pfad
   * @returns CSS-Klasse für das passende FontAwesome-Icon
   */
  getFileIcon(filename: string): string {
    if (!filename) return 'fas fa-file'; // Standard-Icon
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc': case 'docx':
        return 'fas fa-file-word';
      case 'xls': case 'xlsx':
        return 'fas fa-file-excel';
      case 'ppt': case 'pptx':
        return 'fas fa-file-powerpoint';
      case 'zip': case 'rar': case '7z':
        return 'fas fa-file-archive';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'webp':
        return 'fas fa-file-image';
      case 'mp3': case 'wav': case 'ogg': case 'flac': case 'm4a':
        return 'fas fa-file-audio';
      case 'mp4': case 'avi': case 'mov': case 'wmv': case 'flv': case 'mkv':
        return 'fas fa-file-video';
      case 'txt': case 'rtf':
        return 'fas fa-file-alt';
      case 'html': case 'htm': case 'css': case 'js': case 'ts': case 'json':
        return 'fas fa-file-code';
      default:
        return 'fas fa-file';
    }
  }
  
  /**
   * Formatiert eine Dateigröße in Bytes in eine lesbare Größe (KB, MB, etc.)
   * @param bytes Größe in Bytes
   * @returns Formatierte Dateigröße als String
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    if (!bytes || isNaN(bytes)) return '?';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
