import { Component, OnInit, OnDestroy } from '@angular/core';
import { TnotifyService } from '../../services/tnotify.service';
import { TNotify } from '../../interfaces/tnotify';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tnotify',
  standalone: false,
  templateUrl: './tnotify.component.html',
  styleUrl: './tnotify.component.css'
})
export class TnotifyComponent implements OnInit, OnDestroy {

  tnotify: TNotify[] = [];
  private subscription: Subscription | null = null;

  constructor(private tnotifyService: TnotifyService) { }

 ngOnInit(): void {
    this.subscription = this.tnotifyService.tnotify$.subscribe(toasts => {
      console.log('Neue Toasts erhalten:', toasts);
      this.tnotify = toasts;
    });
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  /**
   * Entfernt einen Toast manuell
   * @param id ID des zu entfernenden Toasts
   */
  removeToast(id: number): void {
    this.tnotifyService.remove(id);
  }
  
  /**
   * Gibt die CSS-Klasse für den Toast-Typ zurück
   * @param type Der Typ des Toasts
   * @returns Die entsprechende CSS-Klasse
   */
  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'toast-success';
      case 'warning': return 'toast-warning';
      case 'danger': return 'toast-danger';
      case 'info': 
      default: return 'toast-info';
    }
  }
  
  /**
   * Gibt das Icon für den Toast-Typ zurück
   * @param type Der Typ des Toasts
   * @returns Die entsprechende Icon-Klasse
   */
  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'exclamation-triangle';
      case 'danger': return 'exclamation-circle';
      case 'info': 
      default: return 'info-circle';
    }
  }
}
