import { Request, Response } from 'express';
import CategoryService from '../services/categoryService';
import { Category } from '../models/category';
import logger from '../logger';

export default class CategoryController {
  private categoryService: CategoryService;
  
  constructor() {
    this.categoryService = new CategoryService();
  }
  
  /**
   * Gibt alle Kategorien zurück
   */
  public getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      // Wir könnten hier künftig die User-ID aus dem authentifizierten Benutzer extrahieren
      // const userId = req.user?.id;
      const categories = await this.categoryService.getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      logger.error(`Fehler beim Abrufen der Kategorien: ${error}`);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  }
  
  /**
   * Gibt eine Kategorie anhand ihrer ID zurück
   */
  public getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'Ungültige Kategorie-ID' });
        return;
      }
      
      const category = await this.categoryService.getCategoryById(id);
      
      if (!category) {
        res.status(404).json({ message: 'Kategorie nicht gefunden' });
        return;
      }
      
      res.status(200).json(category);
    } catch (error: any) {
      logger.error(`Fehler beim Abrufen der Kategorie: ${error}`);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  }
  
  /**
   * Fügt eine neue Kategorie hinzu
   */
  public addCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, color, emoji } = req.body;
      
      if (!name) {
        res.status(400).json({ message: 'Kategoriename fehlt' });
        return;
      }
      
      if (!color) {
        res.status(400).json({ message: 'Kategoriefarbe fehlt' });
        return;
      }
      
      // Hier könnten wir künftig die User-ID aus dem authentifizierten Benutzer extrahieren
      // const userId = req.user?.id;
      const category: Category = { 
        name, 
        color,
        emoji,
        // user_id: userId 
      };
      
      const newCategory = await this.categoryService.addCategory(category);
      
      res.status(201).json(newCategory);
    } catch (error: any) {
      logger.error(`Fehler beim Hinzufügen der Kategorie: ${error}`);
      if ((error as Error).message === 'Eine Kategorie mit diesem Namen existiert bereits') {
        res.status(409).json({ message: 'Eine Kategorie mit diesem Namen existiert bereits' });
      } else {
        res.status(500).json({ message: 'Interner Serverfehler' });
      }
    }
  }
  
  /**
   * Aktualisiert eine bestehende Kategorie
   */
  public updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, color, emoji } = req.body;
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'Ungültige Kategorie-ID' });
        return;
      }
      
      if (!name) {
        res.status(400).json({ message: 'Kategoriename fehlt' });
        return;
      }
      
      if (!color) {
        res.status(400).json({ message: 'Kategoriefarbe fehlt' });
        return;
      }
      
      // Hier könnten wir künftig die User-ID aus dem authentifizierten Benutzer extrahieren
      // const userId = req.user?.id;
      const category: Category = { 
        name, 
        color,
        emoji,
        // user_id: userId 
      };
      
      const updatedCategory = await this.categoryService.updateCategory(id, category);
      
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      if ((error as Error).message === 'Kategorie nicht gefunden') {
        res.status(404).json({ message: 'Kategorie nicht gefunden' });
      } else if ((error as Error).message === 'Eine andere Kategorie mit diesem Namen existiert bereits') {
        res.status(409).json({ message: 'Eine andere Kategorie mit diesem Namen existiert bereits' });
      } else {
        res.status(500).json({ message: 'Interner Serverfehler' });
      }
    }
  }
  
  /**
   * Löscht eine Kategorie
   */
  public deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ message: 'Ungültige Kategorie-ID' });
        return;
      }
      
      const deleted = await this.categoryService.deleteCategory(id);
      
      if (!deleted) {
        res.status(404).json({ message: 'Kategorie nicht gefunden' });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      res.status(500).json({ message: 'Interner Serverfehler' });
    }
  }
}
