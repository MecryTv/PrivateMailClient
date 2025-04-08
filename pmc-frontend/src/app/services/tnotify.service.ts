import { Injectable } from '@angular/core';
import { TNotify } from '../interfaces/tnotify';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TnotifyService {
  private tnotify: TNotify[] = [];
  private tnotifyCounter = 0;
  private tnotifySubject = new Subject<TNotify[]>();

  public tnotify$ = this.tnotifySubject.asObservable();

  constructor() { }

  public show(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info', timeout: number = 5000): number {
    const id = ++this.tnotifyCounter;
    const tnotify: TNotify = { id, message, type, timeout }

    this.tnotify.push(tnotify);
    this.tnotifySubject.next([...this.tnotify]);

    if (timeout > 0){
      setTimeout(() => this.remove(id), timeout);
    }

    return id;
  }

  public remove(id: number): void {
    this.tnotify = this.tnotify.filter(tnotify => tnotify.id !== id);
    this.tnotifySubject.next([...this.tnotify]);
  }

  public showSuccess(message: string, timeout: number = 5000): number {
    return this.show(message, 'success', timeout)
  }

  public showError(message: string, timeout: number = 5000): number {
    return this.show(message, 'danger', timeout)
  }

  public showWarning(message: string, timeout: number = 5000): number {
    return this.show(message, 'warning', timeout)
  }

  public showInfo(message: string, timeout: number = 5000): number {
    return this.show(message, 'info', timeout)
  }

  public clear(): void {
    this.tnotify = [];
    this.tnotifySubject.next([...this.tnotify]);
  }

  public success(message: string, timeout: number = 5000): number {
    return this.show(message, 'success', timeout);
  }

  public warning(message: string, timeout: number = 5000): number {
    return this.show(message, 'warning', timeout);
  }

  public info(message: string, timeout: number = 5000): number {
    return this.show(message, 'info', timeout);
  }

  public danger(message: string, timeout: number = 5000): number {
    return this.show(message, 'danger', timeout);
  }
}
