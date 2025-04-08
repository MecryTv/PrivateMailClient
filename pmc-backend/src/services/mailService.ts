import { dummyMails } from '../data/dummieMails';

class MailService {

    constructor() { }

    public fetchMails(): Promise<any[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(dummyMails);
            }, 500);
        });
    }

    public getMailById(id: number): Promise<any> {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Finde E-Mail mit der angegebenen ID
            const mail = dummyMails.find(m => m.id === id);
            resolve(mail || null);
          }, 300);
        });
      }
      

      public markAsRead(id: number): Promise<boolean> {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Finde E-Mail mit der angegebenen ID
            const mail = dummyMails.find(m => m.id === id);
            if (mail) {
              mail.isRead = true;
              resolve(true);
            } else {
              resolve(false);
            }
          }, 200);
        });
      }
    

      public sendMail(
        to: string, 
        subject: string, 
        text?: string, 
        html?: string, 
        attachments?: any[],
        from?: string
      ): Promise<any> {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log('Dummy-E-Mail gesendet:', { to, subject, text });
            
            const newId = dummyMails.length > 0 ? Math.max(...dummyMails.map(mail => mail.id)) + 1 : 1;
            
            const newMail = {
              id: newId,
              subject: subject || '(Kein Betreff)',
              from: {
                name: 'Ich',
                email: from || 'user@example.com',
                faviconUrls: []
              },
              to: to,
              date: new Date(),
              body: text || html || '',
              isRead: true,
              isStarred: false, 
              hasAttachments: !!attachments && attachments.length > 0,
              attachments: attachments || []
            };
            
            dummyMails.push(newMail);
            
            resolve({
              success: true,
              messageId: `dummy-${Date.now()}@mecrytv.de`,
              envelope: {
                from: from || 'user@example.com',
                to: to
              },
              response: 'Nachricht erfolgreich gesendet (Dummy)'
            });
          }, 800);
        });
      }
      

      public async updateReadStatus(mailId: number, isRead: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
          try {
            const mailIndex = dummyMails.findIndex(mail => mail.id === mailId);
            
            if (mailIndex === -1) {
              return reject(new Error(`E-Mail mit ID ${mailId} nicht gefunden`));
            }
            
            dummyMails[mailIndex].isRead = isRead;
            
            setTimeout(() => {
              resolve({ success: true });
            }, 300);
          } catch (error) {
            reject(error);
          }
        });
      }
    
      
      public async markAllAsUnread(): Promise<any> {
        return new Promise((resolve) => {
          // Setze den isRead-Status aller E-Mails auf false
          dummyMails.forEach(mail => {
            mail.isRead = false;
          });
          
          // In einer echten Anwendung würde hier die Datenbank aktualisiert werden
          // Für Demozwecke simulieren wir eine erfolgreiche Aktualisierung
          setTimeout(() => {
            resolve({ success: true, count: dummyMails.length });
          }, 500);
        });
      }
}

export default new MailService();