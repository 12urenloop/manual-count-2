import axios from "axios";
import { config } from "../config";

class TimeManager {

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
        axios.get(config.backend.url + config.backend.endpoints.time)
            .then((response) => {
                this.serverTime = response.data.time;
            })

            .catch((error) => {

                // Log the error to the console.
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }

    /**
     * Get the current timestamp that is in sync with the server.
     * @returns Current timestamp that is in sync with the server.
     */
    now() {
        const offset = this.serverTime - this.clientTime;
        return Date.now() + offset;
    }
}

export const timeManager = new TimeManager();