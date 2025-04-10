import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';

export type FilterOption = 'all' | 'unread' | 'read' | 'flagged';

@Component({
  selector: 'app-toolbar',
  standalone: false,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 25;
  @Input() currentPage: number = 1;
  @Input() allSelected: boolean = false;
  @Input() selectedEmailsCount: number = 0;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() deleteSelectedEmails = new EventEmitter<void>();
  @Output() moveSelectedEmails = new EventEmitter<void>();
  @Output() cancelEmailSelection = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<FilterOption>();
  
  // Dropdown-Zustand
  isDropdownOpen: boolean = false;
  selectedFilter: FilterOption = 'all';
  
  // Filter-Optionen
  filterOptions: { value: FilterOption, label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'unread', label: 'Ungelesen' },
    { value: 'flagged', label: 'Markiert' },
    { value: 'read', label: 'Gelesen' }
  ];
  
  /**
   * Berechnet die aktuelle Anzeigeinformation (z.B. "1-25 von 100")
   */
  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} von ${this.totalItems}`;
  }
  
  /**
   * Prüft, ob die Vor-Schaltfläche verfügbar sein sollte
   */
  get canNavigatePrevious(): boolean {
    return this.currentPage > 1;
  }
  
  /**
   * Prüft, ob die Nächste-Schaltfläche verfügbar sein sollte
   */
  get canNavigateNext(): boolean {
    return this.currentPage < this.totalPages;
  }
  
  /**
   * Berechnet die Gesamtzahl der Seiten
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  /**
   * Zur vorherigen Seite navigieren
   */
  navigateToPreviousPage(): void {
    if (this.canNavigatePrevious) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }
  
  /**
   * Zur nächsten Seite navigieren
   */
  navigateToNextPage(): void {
    if (this.canNavigateNext) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
  
  /**
   * Wechselt den Zustand der Auswahlbox zwischen ausgewählt und nicht ausgewählt
   */
  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.selectAllChange.emit(this.allSelected);
  }

  /**
   * Löst das Event zum Löschen der ausgewählten E-Mails aus
   */
  deleteSelected(): void {
    this.deleteSelectedEmails.emit();
  }

  /**
   * Löst das Event zum Verschieben der ausgewählten E-Mails aus
   */
  moveSelected(): void {
    this.moveSelectedEmails.emit();
  }

  /**
   * Löst das Event zum Abbrechen der E-Mail-Auswahl aus
   */
  cancelSelection(): void {
    this.cancelEmailSelection.emit();
  }
  
  /**
   * Öffnet oder schließt das Dropdown-Menü
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  /**
   * Schließt das Dropdown-Menü, wenn außerhalb geklickt wird
   */
  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  
  /**
   * Wählt eine Filteroption aus und schließt das Dropdown
   */
  selectFilterOption(option: FilterOption, event: Event): void {
    event.stopPropagation();
    this.selectedFilter = option;
    this.filterChange.emit(option);
    this.isDropdownOpen = false;
  }
  
  /**
   * Gibt den anzuzeigenden Filternamen zurück
   */
  get currentFilterLabel(): string {
    const option = this.filterOptions.find(opt => opt.value === this.selectedFilter);
    return option ? option.label : 'Alle';
  }
}
