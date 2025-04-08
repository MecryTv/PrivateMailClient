import { createPool, Pool } from 'mariadb';
import logger from '../logger';
import config from '../../config.json';

class DBConnection {
    private pool: Pool;

    constructor(){
        this.pool = createPool({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            connectionLimit: 10
        })
    }

    public async query(sql: string, params?: any[]): Promise<any> {
        let connection;

        try {
            connection = await this.pool.getConnection();
            logger.info('MariaDB Database connection established');
            
            const rows = await connection.query(sql, params);
            return rows;
        } catch (error) {
            logger.error(`MariadDB Connection error: ${error}`);
            throw error;
        } finally {
            if (connection) connection.end();
        }
    }
}

export default new DBConnection();