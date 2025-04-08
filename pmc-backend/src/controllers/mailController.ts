import { Request, Response } from "express";
import MailService from "../services/mailService";
import logger from '../logger';

class MailController {
    constructor() {
      // Die MailService-Instanz ist bereits importiert
    }
  
    public async getMails(req: Request, res: Response) {
      try {
        const mails = await MailService.fetchMails();
        res.json(mails);
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Mails' });
      }
    }
  
    public async getMailById(req: Request, res: Response) {
      const mailId = parseInt(req.params.id);
      try {
        const mail = await MailService.getMailById(mailId);
        if (mail) {
          res.json(mail);
        } else {
          res.status(404).json({ error: 'Mail nicht gefunden' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Mail' });
      }
    }

    /**
     * Sendet eine E-Mail mit den angegebenen Details
     * @param req Request mit E-Mail-Details im Body
     * @param res Response
     */
    public async sendMail(req: Request, res: Response) {
      const { to, subject, text, html, attachments, from } = req.body;
      
      // Grundlegende Validierung
      if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ 
          error: 'Fehlende Parameter', 
          message: 'Empfänger, Betreff und mindestens Text oder HTML-Inhalt sind erforderlich' 
        });
      }

      try {
        const result = await MailService.sendMail(to, subject, text, html, attachments, from);
        res.status(200).json({
          success: true,
          message: 'E-Mail erfolgreich gesendet',
          data: {
            ...result,
            from: from || process.env.SMTP_FROM || process.env.SMTP_USER
          }
        });
      } catch (error: any) {
        logger.error(`Fehler beim Senden der E-Mail: $${error}`);
        res.status(500).json({ 
          success: false, 
          error: 'Fehler beim Senden der E-Mail',
          message: error.message || 'Unbekannter Fehler'
        });
      }
    }
    /**
     * Lädt einen Anhang herunter
     * @param req Request mit Mail-ID und Anhang-ID
     * @param res Response
     */
    public async downloadAttachment(req: Request, res: Response) {
      const mailId = parseInt(req.params.id);
      const attachmentId = parseInt(req.params.attachmentId);
      
      if (isNaN(mailId) || isNaN(attachmentId)) {
        return res.status(400).json({ error: 'Ungültige Mail-ID oder Anhang-ID' });
      }
      
      try {
        // Mail mit den Anhängen finden
        const mail = await MailService.getMailById(mailId);
        
        if (!mail) {
          return res.status(404).json({ error: 'Mail nicht gefunden' });
        }
        
        if (!mail.attachments || mail.attachments.length === 0) {
          return res.status(404).json({ error: 'Diese Mail hat keine Anhänge' });
        }
        
        // Den spezifischen Anhang finden
        const attachment = mail.attachments.find((a: { id: number }) => a.id === attachmentId);
        
        if (!attachment) {
          return res.status(404).json({ error: 'Anhang nicht gefunden' });
        }
        
        // In der Dummy-Implementation senden wir einen simulierten PDF als Antwort
        // In einer richtigen Implementation würde hier die tatsächliche Datei geladen und gesendet werden
        
        // Erzeuge einen Dummy-PDF-Inhalt
        const fileContent = Buffer.from(`Dummy content for file: ${attachment.filename}`, 'utf-8');
        
        logger.info(`Download-Anfrage für Datei: ${attachment.filename}`);
        
        // Setze Header für den Download
        res.setHeader('Content-Type', attachment.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(attachment.filename)}`);
        res.setHeader('Content-Length', fileContent.length);
        
        // Sende den Anhang für sichere und verdächtige Dateien
        res.send(fileContent);
      } catch (error: any) {
        logger.error(`Fehler beim Herunterladen des Anhangs: ${error}`);
        res.status(500).json({ error: 'Fehler beim Herunterladen des Anhangs' });
      }
    }
    
    /**
    * Aktualisiert den Lesestatus einer E-Mail
    * @param req Request mit E-Mail-ID und isRead-Status im Body
    * @param res Response
    */
    public async updateReadStatus(req: Request, res: Response) {
      const mailId = parseInt(req.params.id);
      const { isRead } = req.body;
      
      if (isRead === undefined) {
        return res.status(400).json({ error: 'isRead-Status muss angegeben werden' });
      }
      
      try {
        // Hier würde normalerweise der Aufruf an den tatsächlichen Dienst erfolgen
        // Für Demozwecke simulieren wir eine erfolgreiche Aktualisierung
        await MailService.updateReadStatus(mailId, isRead);
        
        res.json({ success: true, message: `Lesestatus für Mail ${mailId} auf ${isRead ? 'gelesen' : 'ungelesen'} gesetzt` });
      } catch (error: any) {
        logger.error(`Fehler beim Aktualisieren des Lesestatus: ${error}`);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Lesestatus' });
      }
    }
    
    /**
    * Markiert alle E-Mails als ungelesen (für Demo/Dummy-Zwecke)
    * @param req Request
    * @param res Response
    */
    public async markAllAsUnread(req: Request, res: Response) {
      try {
        // Hier würde normalerweise der Aufruf an den tatsächlichen Dienst erfolgen
        // Für Demozwecke simulieren wir eine erfolgreiche Aktualisierung
        await MailService.markAllAsUnread();
        
        res.json({ success: true, message: 'Alle E-Mails wurden als ungelesen markiert' });
      } catch (error: any) {
        logger.error(`Fehler beim Markieren aller E-Mails als ungelesen: ${error}`);
        res.status(500).json({ error: 'Fehler beim Markieren aller E-Mails als ungelesen' });
      }
    }
}

export default MailController;