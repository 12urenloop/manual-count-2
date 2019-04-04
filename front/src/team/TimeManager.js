import axios from "axios";
import Config from "../config";

export class TimeManager {

    /**
     * Create a new TimeManager.
     */
    constructor() {
        this.serverTime = Date.now();
        this.clientTime = Date.now();
    }

    /**
     * Fetch the time from the server.
     */
    fetchTime() {

        // Fetch the time using axios.
        axios.get(Config.backend.url + Config.backend.endpoints.time)      
        .then((response) => {
            this.serverTime = response.data.time;
        })

        .catch((error) => {

            // Log the error to the console.
            console.log(error);
        });
    }

    /**
     * Get the current timestamp that is in sync with the server.
     * @returns Current timestamp that is in sync with the server.
     */
    getTimestamp() {
        return this.serverTime - this.clientTime + Date.now()
    }
}

export default TimeManager;