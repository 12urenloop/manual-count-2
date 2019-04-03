import axios from "axios";
import Config from "../config";

export class TeamManager {

    /**
     * Create a new TeamManager.
     */
    constructor() {
        this.teams = new Array();
    }

    /**
     * Get a list with active teams from memory.
     * @returns List with teams.
     */
    getTeams() {
        return this.teams;
    }

    /**
     * Update the teamlist in memory.
     */
    updateTeams() {
        
        // Fetch the teams using axios.
        axios.get(Config.backend.url + Config.backend.endpoints.teams_overview)
        
            .then((response) => {

                // Update the representation in memory.
                this.teams = response.data;
            })

            .catch((error) => {

                // Log the error to the console.
                console.log(error);
            });
    }

    /**
     * Queue a lap for a certain team.
     * @param {number} id Id of the team to queue a lap for.
     */
    queueLap(id) {

        // Check if the local storage contains a queue list.
        // If false, create a list.
        if(!localStorage.queue) {
            localStorage.queue = new Array();
        }

        // Create a new queue entry.
        let queueEntry = {
            id: id,
            timestamp: new Date().getTime()
        };
        
        // Add the id of the team to local storage.
        localStorage.queue += queueEntry;

        // Queue a request to the server
        this.postLap(queueEntry);
        let interval = setInterval(this.postLap(queueEntry, interval), 1000);
    }

    /**
     * Post a lap for a certain team to the server.
     * @param {object} entry Queue entry to send to the server.
     * @param {interval} interval Interval that is used for trying to post to the server.
     */
    postLap(entry, interval) {

        // Only do something when the entry is inside the queue.
        if(!localStorage.queue[entry]) {

            let countURL = Config.backend.url + Config.backend.endpoints.teams_count.replace("{}", entry.id);
            let countParameters = "?timestamp=" + entry.timestamp;

            // Execute a post request to the server.
            axios.post(countURL + countParameters)
            .then((response) => {

                // Remove the entry from the queue list.
                delete localStorage.queue[entry];

                // Update the teams in memory.
                updateTeams();

                // If interval is given, clear the interval.
                if(interval) {
                    clearInterval(interval);
                }
            })

            .catch((error) => {

                // Log the error to the console.
                console.log(error);
            });
        }
    }
}

export default TeamManager;