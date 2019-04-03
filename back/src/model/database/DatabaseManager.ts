import { Connection, createConnection } from "typeorm";
import * as LogUtil from "../../util/LogUtil";
import * as Config from "../../Config";

export class DatabaseManager {
    
    private connection: Connection;

    /**
     * Initialize the Database Manager.
     *
     * @returns {Promise<boolean>}
     */
    async initialize(): Promise<boolean> {
        return await this.openConnection();
    }

    /**
     * Shutdown the Database Manager.
     *
     * @returns {Promise<boolean>}
     */
    async shutdown(): Promise<boolean> {
        return await this.closeConnection();
    }

    /**
     * Open the connection to the database.
     * 
     * @returns {Promise<boolean>}
     */
    async openConnection(): Promise<boolean> {

        // Log opening database connection
        console.log("[DatabaseManager] Attempting to connect to the database...");

        // Open the connection
        return await createConnection({
            type: <any> Config.CONNECTION.TYPE,
            host: Config.CONNECTION.HOST,
            port: Config.CONNECTION.PORT,
            username: Config.CONNECTION.USERNAME,
            password: Config.CONNECTION.PASSWORD,
            database: Config.CONNECTION.DATABASE,
            synchronize: true,
            logging: false,
            entities: ["src/model/models/**/*.ts"]
        }).then(connection => {

            // Set the connection
            this.connection = connection;

            // Log success opening database connection
            console.log("[DatabaseManager] Connected to the database.");

            return true;
        }).catch(error => {

            // Report the error.
            LogUtil.error("[DatabaseManager] An error occured while connecting to the database", error);

            return false;
        });
    }

    /**
     * Close the connection to the database.
     *
     * @returns {Promise<boolean>}
     */
    async closeConnection(): Promise<boolean> {

        // Log closing database connection
        console.log("[DatabaseManager] Attempting to close the connection to the database...");

        // Close the connection
        try  {
            await this.connection.close();
        } catch(error) {
            // Log the error
            LogUtil.error("[DatabaseManager] An error occured while closing the connection to the database", error);
            return false;
        }

        // Delete the connection
        try {
            delete this.connection;
        } catch(error) {
            // Log the error
            LogUtil.error("[DatabaseManager] An error occured while unsetting the connection to the database", error);
            return false;
        }

        return true;
    }

    /**
     * Get the connection to the database.
     *
     * @returns {Connection} Connection to the database.
     */
    getConnection(): Connection {
        return this.connection;
    }
}

export default DatabaseManager;