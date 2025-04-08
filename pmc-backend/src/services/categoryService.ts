import { createPool, Pool, PoolConnection } from 'mariadb';
import { Category } from '../models/category';
import config from '../../config.json';
import logger from '../logger';

export default class CategoryService {
  private pool: Pool;

  constructor() {
    this.pool = createPool({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port,
      connectionLimit: 5
    });
    logger.info('Category Service initialized with MariaDB connection pool');
  }

  /**
   * Holt alle Kategorien des angegebenen Benutzers
   * @param userId ID des Benutzers (optional)
   * @returns Liste der Kategorien
   */
  async getCategories(userId?: number): Promise<Category[]> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      let query = 'SELECT * FROM categories';
      const params = [];
      
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY name ASC';
      
      const rows = await conn.query(query, params);
      logger.info(`Retrieved ${rows.length} categories${userId ? ` for user ${userId}` : ''}`);
      return rows as Category[];
    } catch (error) {
      logger.error(`Fehler beim Abrufen der Kategorien: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Holt eine Kategorie anhand ihrer ID
   * @param id ID der Kategorie
   * @returns Die gefundene Kategorie oder null
   */
  async getCategoryById(id: number): Promise<Category | null> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(
        'SELECT * FROM categories WHERE id = ?', 
        [id]
      );
      
      if (Array.isArray(rows) && rows.length > 0) {
        logger.info(`Retrieved category with ID ${id}`);
        return rows[0] as Category;
      }
      
      logger.info(`No category found with ID ${id}`);
      return null;
    } catch (error) {
      logger.error(`Fehler beim Abrufen der Kategorie: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Fügt eine neue Kategorie hinzu
   * @param category Die Kategorie die hinzugefügt werden soll
   * @returns Die hinzugefügte Kategorie mit ID
   */
  async addCategory(category: Category): Promise<Category> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      
      // Prüfe ob bereits eine Kategorie mit diesem Namen existiert
      const existing = await conn.query(
        'SELECT * FROM categories WHERE name = ? AND (user_id = ? OR user_id IS NULL)', 
        [category.name, category.user_id]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        throw new Error('Eine Kategorie mit diesem Namen existiert bereits');
      }
      
      const now = new Date();
      const result = await conn.query(
        'INSERT INTO categories (name, color, emoji, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          category.name,
          category.color,
          category.emoji || null,
          category.user_id || null,
          now,
          now
        ]
      );
      
      const newCategory = {
        ...category,
        id: result.insertId,
        created_at: now,
        updated_at: now
      };
      
      logger.info(`Neue Kategorie hinzugefügt: ${category.name}`);
      return newCategory;
    } catch (error) {
      logger.error(`Fehler beim Hinzufügen der Kategorie: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Aktualisiert eine Kategorie
   * @param id ID der zu aktualisierenden Kategorie
   * @param category Die aktualisierten Daten
   * @returns Die aktualisierte Kategorie
   */
  async updateCategory(id: number, category: Category): Promise<Category> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      
      // Prüfe ob die Kategorie existiert
      const existing = await conn.query(
        'SELECT * FROM categories WHERE id = ?', 
        [id]
      );
      
      if (!Array.isArray(existing) || existing.length === 0) {
        throw new Error('Kategorie nicht gefunden');
      }

      // Prüfe ob der Name bereits von einer anderen Kategorie verwendet wird
      const nameCheck = await conn.query(
        'SELECT * FROM categories WHERE name = ? AND id != ? AND (user_id = ? OR user_id IS NULL)', 
        [category.name, id, category.user_id]
      );
      
      if (Array.isArray(nameCheck) && nameCheck.length > 0) {
        throw new Error('Eine andere Kategorie mit diesem Namen existiert bereits');
      }
      
      const now = new Date();
      await conn.query(
        'UPDATE categories SET name = ?, color = ?, emoji = ?, updated_at = ? WHERE id = ?',
        [
          category.name,
          category.color,
          category.emoji || null,
          now,
          id
        ]
      );
      
      const updatedCategory = {
        ...category,
        id,
        updated_at: now
      };
      
      logger.info(`Kategorie aktualisiert: ID ${id}, Name: ${category.name}`);
      return updatedCategory;
    } catch (error) {
      logger.error(`Fehler beim Aktualisieren der Kategorie: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Löscht eine Kategorie
   * @param id ID der zu löschenden Kategorie
   * @returns True wenn erfolgreich gelöscht
   */
  async deleteCategory(id: number): Promise<boolean> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      
      // Optional: Entferne zuvor alle Verknüpfungen zu E-Mails (falls vorhanden)
      // await conn.query('DELETE FROM email_categories WHERE category_id = ?', [id]);
      
      const result = await conn.query(
        'DELETE FROM categories WHERE id = ?', 
        [id]
      );
      
      const success = result.affectedRows > 0;
      if (success) {
        logger.info(`Kategorie gelöscht: ID ${id}`);
      } else {
        logger.warn(`Keine Kategorie mit ID ${id} zum Löschen gefunden`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Fehler beim Löschen der Kategorie: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}
