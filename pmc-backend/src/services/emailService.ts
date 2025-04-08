import { createPool, Pool, PoolConnection } from 'mariadb';
import { EmailAddress } from '../models/emailAddress';
import config from '../../config.json';
import logger from '../logger';

export default class EmailService {
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
    logger.info('Email Service initialized with MariaDB connection pool');
  }

  
  async getEmails(): Promise<EmailAddress[]> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query('SELECT * FROM email_addresses ORDER BY created_at DESC');
      logger.info(`Retrieved ${rows.length} email addresses`);
      return rows as EmailAddress[];
    } catch (error) {
      logger.error(`Fehler beim Abrufen der E-Mail-Adressen: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Fügt eine neue E-Mail-Adresse hinzu
   * @param emailAddress Die E-Mail-Adresse die hinzugefügt werden soll
   * @returns Die hinzugefügte E-Mail-Adresse mit ID
   */
  async addEmail(emailAddress: EmailAddress): Promise<EmailAddress> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      
      // Prüfe ob die E-Mail-Adresse bereits existiert
      const existing = await conn.query(
        'SELECT * FROM email_addresses WHERE address = ?', 
        [emailAddress.address]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        throw new Error('Diese E-Mail-Adresse existiert bereits');
      }
      
      // Füge neue E-Mail-Adresse hinzu
      const now = new Date();
      const result = await conn.query(
        'INSERT INTO email_addresses (address, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [emailAddress.address, emailAddress.user_id || null, now, now]
      );
      
      // BigInt in Number umwandeln, um Serialisierungsprobleme zu vermeiden
      const insertId = typeof result.insertId === 'bigint' ? Number(result.insertId) : result.insertId;
      
      // Hole die neu eingefügte E-Mail-Adresse
      const rows = await conn.query(
        'SELECT * FROM email_addresses WHERE id = ?',
        [insertId]
      );
      
      logger.info(`Neue E-Mail-Adresse hinzugefügt: ${emailAddress.address}`);
      return (Array.isArray(rows) && rows.length > 0) ? rows[0] : { ...emailAddress, id: insertId };
    } catch (error) {
      logger.error(`Fehler beim Hinzufügen der E-Mail-Adresse: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Entfernt eine E-Mail-Adresse
   * @param id Die ID der zu entfernenden E-Mail-Adresse
   * @returns true wenn erfolgreich, false wenn nicht gefunden
   */
  async removeEmail(id: number): Promise<boolean> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      const result = await conn.query('DELETE FROM email_addresses WHERE id = ?', [id]);
      
      const success = result.affectedRows > 0;
      if (success) {
        logger.info(`E-Mail-Adresse gelöscht: ID ${id}`);
      } else {
        logger.warn(`E-Mail-Adresse zum Löschen nicht gefunden: ID ${id}`);
      }
      
      return success;
    } catch (error) {
      logger.error(`Fehler beim Entfernen der E-Mail-Adresse: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Sucht nach E-Mail-Adressen anhand eines Suchbegriffs
   * @param searchTerm Suchbegriff
   * @returns Liste der gefundenen E-Mail-Adressen
   */
  async searchEmails(searchTerm: string): Promise<EmailAddress[]> {
    let conn: PoolConnection | undefined;
    try {
      conn = await this.pool.getConnection();
      
      const rows = await conn.query(
        'SELECT * FROM email_addresses WHERE address LIKE ? ORDER BY created_at DESC',
        [`%${searchTerm}%`]
      );
      
      logger.info(`Suche nach E-Mail-Adressen mit Term '${searchTerm}': ${rows.length} Ergebnisse`);
      return rows as EmailAddress[];
    } catch (error) {
      logger.error(`Fehler bei der Suche nach E-Mail-Adressen: ${error}`);
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
}
