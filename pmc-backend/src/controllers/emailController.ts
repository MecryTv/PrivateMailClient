import { Request, Response } from 'express';
import EmailService from '../services/emailService';
import { EmailAddress } from '../models/emailAddress';

export default class EmailController {
  private emailService: EmailService;
  
  constructor() {
    this.emailService = new EmailService();
  }
  
  /**
   * Gibt alle E-Mail-Adressen zurück
   */
  public getEmails = async (req: Request, res: Response): Promise<void> => {
    try {
      const emails = await this.emailService.getEmails();
      res.status(200).json(emails);
    } catch (error) {
      console.error('Fehler beim Abrufen der E-Mail-Adressen:', error);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  }
  
  /**
   * Fügt eine neue E-Mail-Adresse hinzu
   */
  public addEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.body;
      
      if (!address) {
        res.status(400).json({ message: 'E-Mail-Adresse fehlt' });
        return;
      }
      
      // E-Mail-Format überprüfen
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(address)) {
        res.status(400).json({ message: 'Ungültiges E-Mail-Format' });
        return;
      }
      
      const emailAddress: EmailAddress = { address };
      const newEmail = await this.emailService.addEmail(emailAddress);
      
      res.status(201).json(newEmail);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der E-Mail-Adresse:', error);
      if ((error as Error).message === 'Diese E-Mail-Adresse existiert bereits') {
        res.status(409).json({ message: 'Diese E-Mail-Adresse existiert bereits' });
      } else {
        res.status(500).json({ message: 'Interner Serverfehler' });
      }
    }
  }
  
  /**
   * Entfernt eine E-Mail-Adresse
   */
  public removeEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'Ungültige ID' });
        return;
      }
      
      await this.emailService.removeEmail(id);
      res.status(204).send();
    } catch (error) {
      console.error('Fehler beim Entfernen der E-Mail-Adresse:', error);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  }
}
