import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../enviroment/enviroment'

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private mailsUrl = `${environment.apiUrl}/mails`;
  private emailsUrl = `${environment.apiUrl}/emails`;

  constructor(private http: HttpClient) { }

  getMails(): Observable<any[]> {
    return this.http.get<any[]>(this.mailsUrl);
  }

  getMailById(id: number): Observable<any> {
    return this.http.get<any>(`${this.mailsUrl}/${id}`);
  }

  getEmailAddresses(): Observable<any[]> {
    return this.http.get<any[]>(this.emailsUrl);
  }

  addEmailAddress(address: string): Observable<any> {
    return this.http.post<any>(this.emailsUrl, { address });
  }

  removeEmailAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${this.emailsUrl}/${id}`);
  }

  downloadAttachment(mailId: number, attachmentId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.mailsUrl}/${mailId}/attachments/${attachmentId}`,
      { observe: 'response', responseType: 'blob' }
    ) as Observable<HttpResponse<Blob>>;
  }
  
  updateReadStatus(mailId: number, isRead: boolean): Observable<any> {
    return this.http.put<any>(`${this.mailsUrl}/${mailId}/readstatus`, { isRead });
  }

  markAllAsUnread(): Observable<any> {
    return this.http.put<any>(`${this.mailsUrl}/markallunread`, {});
  }
 
  updateStarredStatus(mailId: number, isStarred: boolean): Observable<any> {
    return this.http.put<any>(`${this.mailsUrl}/${mailId}/starredstatus`, { isStarred });
  }
  
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.mailsUrl}/unread/count`);
  }
  
  deleteEmailAddress(id: number): Observable<any> {
    return this.removeEmailAddress(id); // Verwendet die vorhandene Methode
  }

  reply(mailId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.mailsUrl}/${mailId}/reply`, data);
  }
  
  forward(mailId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.mailsUrl}/${mailId}/forward`, data);
  }
  
  sendNewMail(data: any): Observable<any> {
    return this.http.post<any>(`${this.mailsUrl}`, data);
  }
}
