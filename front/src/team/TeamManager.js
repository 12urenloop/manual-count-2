import axios from "axios";
import Queue from "storage-based-queue";

import { store } from '../plugins/store';

import { timeManager } from './TimeManager';
import { config } from "../config";


class TeamManager {

    /**
     * Create a new TeamManager.
     */
    constructor() {
        this.teams = new Array();
        Queue.workers({ BumpLapWorker });
        this.queue = new Queue();
        this.channel = this.queue.create("send-bump");

        this.channel.start();

        // Create a task that will update the teams every 5 seconds.
        setInterval(() => {
            this.updateTeams();
        }, config.teams.delay_refresh * 1000);
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
        return axios.get(config.backend.url + config.backend.endpoints.teams_overview)
            .then((response) => {
                const teams = response.data.teams.reduce((acc, team) => {
                    acc[team.id] = team;
                    return acc;
                }, {});
                store.commit('updateAllTeams', teams);
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
        const timestamp = timeManager.now();
        const job = {
            label: 'Bump lap',
            handler: 'BumpLapWorker',
            args: [id, timestamp],
        };
        this.channel.add(job);
    }
}

class BumpLapWorker {
    timeout = 5
    retry = config.backend.retries

    async handle([id, timestamp]) {
        const endpoint = config.backend.endpoints.teams_count
            .replace("{}", id)
            .replace("{}", timestamp);
        try {
            const status = await axios.post(config.backend.url + endpoint);
            store.commit('updateCommit', { id, status });
            return Promise.resolve(true);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
            return Promise.resolve(false);
        }
    }
}

export const teamManager = new TeamManager();