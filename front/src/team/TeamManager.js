import axios from "axios";
import Config from "../config";

export class TeamManager {

    /**
     * Create a new TeamManager.
     */
    constructor(store) {
        this.teams = new Array();
        this.store = store;

        // Create a task that will update the teams every 5 seconds.
        setInterval(() => {
            this.updateTeams();
        }, Config.teams.delay_refresh * 1000);

        // Start a task that will try to send the queue to the server every second.
        this.startTaskLaps();
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
                this.teams.length = 0;

                // Push all the received teams to the teams list.
                response.data.teams.forEach((team) => {
                    this.teams.push(team);
                });
            })
            .catch((error) => {
                // Log the error to the console.
                // eslint-disable-next-line no-console
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
        if (!localStorage.queue) {
            localStorage.queue = JSON.stringify(new Array());
        }

        // Create a new queue entry.
        let queueEntry = {
            id: id,
            timestamp: this.store.state.timeManager.getTimestamp()
        };

        // Parse the queue in an Array.
        let queue = JSON.parse(localStorage.queue);

        // Add the id of the team to local storage.
        queue.push(queueEntry);

        // Save the queue list in local storage as JSON.
        localStorage.queue = JSON.stringify(queue);
    }

    /**
     * Start a task that will try to send the queue to the server every second.
     */
    startTaskLaps() {

        setInterval(() => {

            // Only do something when the queue exists.
            if (localStorage.queue) {
                let queue = JSON.parse(localStorage.queue);

                // Go over every entry in the queue.
                // Stop the loop when one request failed.
                for (let entry of queue) {
                    this.postLap(queue, entry);
                }
            }
        }, Config.teams.delay_post_lap * 1000);
    }

    /**
     * Post an entry to the server.
     * @param {Array} queue List with all the queued entries.
     * @param {Object} entry Entry to post to the server.
     * @return {boolean} if the post request succeeded. 
     */
    async postLap(queue, entry) {

        if (queue.indexOf(entry) >= 0) {

            // Execute a post request to the server.
            try {
                await axios.post(Config.backend.url + Config.backend.endpoints.teams_count.replace("{}", entry.id).replace("{}", entry.timestamp))
                // Remove the entry from the queue.
                delete queue[queue.indexOf(entry)];

                // Update the teams in memory.
                this.updateTeams();

                // Update the local storage.
                localStorage.queue = queue === null ? JSON.stringify(queue) : JSON.stringify(new Array());
            } catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
                return false;
            }
        }
    }
}

export default TeamManager;