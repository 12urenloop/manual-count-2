import DatabaseManager from "./model/database/DatabaseManager";
import ControllerManager from "./controller/ControllerManager";

// Create the Database Manager
export const databaseManager = new DatabaseManager();

// Create the Controller Manager
export const controllerManager = new ControllerManager();

/**
 * Initialize the back-end.
 */
async function initialize() {
    
    // Initialize the Database Manager.
    if(!await databaseManager.initialize()) {
        return;
    }

    // Initialize the Controller Manager.
    if(!await controllerManager.initialize()) {
        return;
    }
}

initialize();