import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Category } from '../../interfaces/category';
import { CategoryService } from '../../services/category.service';
import { TnotifyService} from '../../services/tnotify.service';
import { CategoryIconService } from '../../services/category-icon.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MailService } from '../../services/mails.service';


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  replyMode: boolean = false;
  forwardMode: boolean = false;
  selectedEmailAddress: {id: number, address: string} | null = null;
  replyText: string = '';
  newEmailAddress: string = '';
  isAddingEmail: boolean = false;
  showEmailError: boolean = false;
  emailErrorMessage: string = '';
  emailAddresses: Array<{id: number, address: string}> = [];
  unreadCount: number = 0;
  showSettingsMenu: boolean = false;
  showEmailManager: boolean = false;
  categories: Category[] = [];
  showCategoryManager: boolean = false;
  editingCategory: Category | null = null;
  newCategory: Category = { name: '', color: '#7952dc', emoji: '' };
  showCategoryError: boolean = false;
  categoryErrorMessage: string = '';
  isAddingCategory: boolean = false;
  showDeleteDialog: boolean = false;
  categoryToDelete: Category | null = null;
  availableColors: string[] = [
    '#7952dc', '#3b82f6', '#06b6d4', '#22c55e', '#eab308', 
    '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#8bc34a',
    '#0288d1', '#009688', '#f44336', '#e91e63', '#673ab7'
  ];
  suggestedIcons: string[] = [
    'fa-tag', 'fa-folder', 'fa-inbox', 'fa-star', 'fa-heart',
    'fa-briefcase', 'fa-home', 'fa-users', 'fa-building', 'fa-user',
    'fa-shopping-cart', 'fa-euro-sign', 'fa-file-invoice-dollar', 'fa-money-bill-wave',
    'fa-plane', 'fa-car', 'fa-umbrella-beach', 'fa-hotel',
    'fa-graduation-cap', 'fa-book', 'fa-university',
    'fa-heartbeat', 'fa-pills', 'fa-user-md',
    'fa-laptop-code', 'fa-code', 'fa-server', 'fa-microchip',
    'fa-newspaper', 'fa-bell', 'fa-calendar', 'fa-clock',
    'fa-music', 'fa-film', 'fa-gamepad', 'fa-camera',
    'fa-utensils', 'fa-coffee', 'fa-pizza-slice', 'fa-beer'
  ];

  constructor(
    private mailService: MailService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private tnotifyService: TnotifyService,
    private categoryService: CategoryService,
    private categoryIconService: CategoryIconService
  ) { }
  
  ngOnInit(): void {
    // Lade Kategorien beim Start
    this.loadCategories();
    // Lade E-Mail-Adressen beim Start
    this.loadEmailAddresses();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kategorien:', error);
        this.tnotifyService.showError('Kategorien konnten nicht geladen werden');
      }
    });
  }
  
  /**
   * Öffnet das Modal zur Kategorieverwaltung
   */
  showCategoryModal(): void {
    this.showCategoryManager = true;
    this.newCategory = { name: '', color: this.availableColors[0], emoji: '' };
    this.editingCategory = null;
    this.showCategoryError = false;
  }
  
  /**
   * Schließt das Kategorien-Modal
   */
  closeCategoryModal(): void {
    this.showCategoryManager = false;
    this.newCategory = { name: '', color: this.availableColors[0], emoji: '' };
    this.editingCategory = null;
    this.showCategoryError = false;
  }
  
  /**
   * Setzt die ausgewählte Farbe für eine neue Kategorie
   * @param color Die zu setzende Farbe
   */
  selectColor(color: string): void {
    this.newCategory.color = color;
  }
  
  /**
   * Setzt das ausgewählte Icon für eine neue Kategorie
   * @param icon Das zu setzende Icon (FontAwesome Klassenname ohne 'fas')
   */
  selectIcon(icon: string): void {
    this.newCategory.emoji = icon;
  }
  
  /**
   * Speichert eine neue oder aktualisiert eine bestehende Kategorie
   */
  saveCategory(): void {
    // Validierung
    if (!this.newCategory.name.trim()) {
      this.showCategoryError = true;
      this.categoryErrorMessage = 'Kategoriename darf nicht leer sein.';
      return;
    }
    
    // Wenn kein Icon gewählt wurde, automatisch ein passendes Icon basierend auf dem Namen wählen
    if (!this.newCategory.emoji) {
      const iconName = this.categoryIconService.findIconForCategory(this.newCategory.name);
      this.newCategory.emoji = iconName;
    }
    
    this.isAddingCategory = true;
    
    if (this.editingCategory && this.editingCategory.id) {
      // Bestehende Kategorie aktualisieren
      this.categoryService.updateCategory(this.editingCategory.id, this.newCategory).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.tnotifyService.showSuccess('Kategorie erfolgreich aktualisiert');
          this.isAddingCategory = false;
          this.closeCategoryModal();
        },
        error: (error) => {
          console.error('Fehler beim Aktualisieren der Kategorie:', error);
          this.showCategoryError = true;
          this.categoryErrorMessage = 'Fehler beim Aktualisieren der Kategorie';
          this.isAddingCategory = false;
        }
      });
    } else {
      // Neue Kategorie hinzufügen
      this.categoryService.addCategory(this.newCategory).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.tnotifyService.showSuccess('Kategorie erfolgreich erstellt');
          this.isAddingCategory = false;
          this.closeCategoryModal();
        },
        error: (error) => {
          console.error('Fehler beim Erstellen der Kategorie:', error);
          this.showCategoryError = true;
          this.categoryErrorMessage = 'Fehler beim Erstellen der Kategorie';
          this.isAddingCategory = false;
        }
      });
    }
  }
  
  /**
   * Startet die Bearbeitung einer bestehenden Kategorie
   * @param category Die zu bearbeitende Kategorie
   */
  editCategory(category: Category): void {
    this.editingCategory = category;
    this.newCategory = { ...category };
    this.showCategoryManager = true;
    this.showCategoryError = false;
  }
  
  /**
   * Zeigt den Bestätigungsdialog für das Löschen einer Kategorie an
   * @param category Die zu löschende Kategorie
   */
  showDeleteConfirmation(category: Category, event?: MouseEvent): void {
    // Stoppt die Event-Propagation, damit die Kategorie-Auswahl nicht ausgelöst wird
    if (event) {
      event.stopPropagation();
    }
    
    // Speichert die zu löschende Kategorie und zeigt den Dialog an
    this.categoryToDelete = category;
    this.showDeleteDialog = true;
  }
  
  /**
   * Bricht den Löschvorgang ab und schließt den Dialog
   */
  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.categoryToDelete = null;
  }
  
  /**
   * Bestätigt das Löschen der Kategorie
   */
  confirmDeleteCategory(): void {
    this.deleteCategory();
    this.showDeleteDialog = false;
  }
  
  /**
   * Löscht eine Kategorie
   */
  deleteCategory(): void {
    if (!this.categoryToDelete || !this.categoryToDelete.id) return;
    
    const categoryId = this.categoryToDelete.id;
    console.log(`Lösche Kategorie mit ID: ${categoryId}`);
    
    // Toast anzeigen, dass die Kategorie gelöscht wird
    this.tnotifyService.showInfo('Lösche Kategorie...');
    
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: (response) => {
        console.log('Löschantwort vom Server:', response);
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
        this.tnotifyService.showSuccess('Kategorie erfolgreich gelöscht');
        this.categoryToDelete = null;
        
        // Kategorien neu laden, um sicherzustellen, dass die Anzeige aktuell ist
        this.loadCategories();
      },
      error: (error) => {
        console.error('Fehler beim Löschen der Kategorie:', error);
        
        // Detaillierte Fehlerinformationen ausgeben
        if (error.status) {
          console.error(`HTTP-Status: ${error.status}`);
          console.error(`Fehlertext: ${error.statusText}`);
        }
        
        if (error.error) {
          console.error('Server-Fehler:', error.error);
        }
        
        this.tnotifyService.showError(`Kategorie konnte nicht gelöscht werden: ${error.message || 'Unbekannter Fehler'}`);
        this.categoryToDelete = null;
      }
    });
  }
  
  /**
   * Wählt eine Kategorie aus, um die E-Mails nach dieser zu filtern
   * @param category Die ausgewählte Kategorie
   */
  selectCategory(category: Category): void {
    // Hier wird die Logik implementiert, um E-Mails nach Kategorie zu filtern
    // Diese Funktion wird aufgerufen, wenn Benutzer auf eine Kategorie in der Seitenleiste klicken
    console.log(`Kategorie ausgewählt: ${category.name}`);
    
    // TODO: Backend-Anbindung für das Filtern nach Kategorien implementieren
    
    // Hier kann später die Filterlogik implementiert werden, wenn die Backend-Funktionalität bereit ist
    // z.B. this.loadMailsByCategory(category.id)
  }

  toggleSettingsMenu(): void {
    this.showSettingsMenu = !this.showSettingsMenu;
  }
  
  /**
   * Schließt das Einstellungsmenü
   */
  closeSettingsMenu(): void {
    this.showSettingsMenu = false;
  }
  
  /**
   * Öffnet das E-Mail-Manager-Modal und schließt das Einstellungsmenü
   */
  openEmailManager(): void {
    this.showEmailManager = true;
    this.showSettingsMenu = false;
  }
  
  /**
   * Schließt das E-Mail-Manager-Modal
   */
  closeEmailManager(): void {
    this.showEmailManager = false;
  }
  
  /**
   * Logout-Funktion
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  /**
   * Lädt die E-Mail-Adressen des Benutzers aus der Datenbank
   */
  loadEmailAddresses(): void {
    // TODO: Später mit Backend-Service verbinden
    // Vorläufig: Demo-Daten laden
    this.mailService.getEmailAddresses().subscribe(
      data => {
        this.emailAddresses = data;
      },
      error => {
        console.error('Fehler beim Laden der E-Mail-Adressen:', error);
      }
    );
  }
  
  /**
   * Fügt eine neue E-Mail-Adresse hinzu
   */
  addEmail(): void {
    // Validierung
    if (!this.newEmailAddress) {
      this.showEmailError = true;
      this.emailErrorMessage = 'Bitte gib eine E-Mail-Adresse ein';
      return;
    }
    
    // E-Mail-Format prüfen
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.newEmailAddress)) {
      this.showEmailError = true;
      this.emailErrorMessage = 'Ungültiges E-Mail-Format';
      return;
    }
    
    // Prüfen, ob die E-Mail bereits existiert
    if (this.emailAddresses.some(email => email.address === this.newEmailAddress)) {
      this.showEmailError = true;
      this.emailErrorMessage = 'Diese E-Mail-Adresse ist bereits vorhanden';
      return;
    }
    
    this.isAddingEmail = true;
    this.showEmailError = false;
    
    // An den Server senden
    this.mailService.addEmailAddress(this.newEmailAddress).subscribe(
      response => {
        // Erfolgreich hinzugefügt
        this.emailAddresses.push(response);
        this.newEmailAddress = '';
        this.isAddingEmail = false;
      },
      error => {
        console.error('Fehler beim Hinzufügen der E-Mail-Adresse:', error);
        this.showEmailError = true;
        this.emailErrorMessage = 'Die E-Mail-Adresse konnte nicht hinzugefügt werden';
        this.isAddingEmail = false;
      }
    );
  }
  
  /**
   * Entfernt eine E-Mail-Adresse
   */
  removeEmail(id: number): void {
    this.mailService.removeEmailAddress(id).subscribe(
      () => {
        // Erfolgreich entfernt
        this.emailAddresses = this.emailAddresses.filter(email => email.id !== id);
      },
      error => {
        console.error('Fehler beim Entfernen der E-Mail-Adresse:', error);
      }
    );
  }
}
