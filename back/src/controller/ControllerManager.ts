import express from "express";
import * as Config from "../Config";
import { databaseManager } from "../Main";
import { Team } from "../model/models/Team";
import { Lap } from "../model/models/Lap";

export class ControllerManager {
    private router: express.Application;

    /**
     * Creates an instance of ControllerManager.
     */
    constructor() {
        this.router = express();
    }

    /**
     * Initialize the Controller Manager.
     *
     * @returns {Promise<boolean>}
     */
    async initialize(): Promise<boolean> {
        // Log starting express.
        console.log("[ControllerManager] Attempting to start express...");
        
        // Allow cross origin.
        this.router.use(async (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept"
            );
            next();
        });

        // Set the routes.

        // Main route.
        this.router.get("/", async (req, res, next) => {
            try {
                res.redirect("/teams");
            } catch (err) {
                next(err);
            }
        });

        // Get teams route.
        this.router.get("/teams", async (req, res, next) => {
            // Get the database repository with all the teams.
            let teamsRepo = databaseManager.getConnection().getRepository(Team);

            // Fetch all the teams.
            let teams = await teamsRepo.find();

            // Return the teams as a JSON.
            res.send(teams);
        });

        // Create team route.
        this.router.post("/teams/add", async (req, res, next) => {
            // Get the team name.
            let name = req.query.name;

            // Only create the team when the name is not undefined.
            if (name) {
                // Get the database repository with all the teams.
                let teamsRepo = databaseManager
                    .getConnection()
                    .getRepository(Team);

                // Check if there is already a team with the same name.
                // If this is the case, send an error to the client.
                if (
                    (await teamsRepo.find({ where: { name: name } })).length > 0
                ) {
                    res.send({
                        error: "error_name_exists"
                    });
                }

                // Create a new team.
                let team = new Team();
                team.name = name;
                team.laps = new Array();

                // Add the team to the database.
                teamsRepo.save(team);

                // Route the client back to the "/teams" endpoint.
                res.redirect("/teams");
            } else {
                res.send({
                    error: "error_name_invalid"
                });
            }
        });

        // Count one lap to a given team.
        this.router.post("/teams/count/:id/", async (req, res, next) => {
            // Get the database repository with all the teams.
            let teamsRepo = databaseManager.getConnection().getRepository(Team);

            // Get the database repository with all the laps.
            let lapsRepo = databaseManager.getConnection().getRepository(Lap);

            // Get the team by the given id.
            let team = await teamsRepo.findOne({
                where: { id: req.params.id }
            });

            // Check if no team with the specified id was found.
            // If this is the case, send an error to the client.
            if (!team) {
                res.send({
                    error: "error_invalid_id"
                });
            }
            
            // Last lap of the team.
            let lastLap = team.getLastLap();

            if(lastLap) {
                // Check if the last timestamp is smaller than the current timestamp.
                // If this is the case, send an error to the client.
                if (lastLap.timestamp_seen + parseInt(Config.TEAM.LAP_DELAY) * 1000 > Date.now()) {
                    res.send({
                        error: "error_delay"
                    });
                }
            }

            // Create a new lap.
            let lap = new Lap();
            lap.timestamp_added = Date.now();
            lap.timestamp_seen = req.query.timestamp;

            // Save the lap to the database.
            lapsRepo.save(lap);

            // Add the lap to the team.
            team.laps.push(lap);

            // Save the team to the database.
            teamsRepo.save(team);

            // Route the client back to the "/teams" endpoint.
            res.redirect("/teams");
        });

        // Open the router.
        await this.router.listen(Config.EXPRESS.PORT);

        // Log success starting express.
        console.log(
            `[ControllerManager] Started express on port ${Config.EXPRESS.PORT}`
        );

        return true;
    }

    /**
     * Shutdown the Controller Manager.
     *
     * @returns {Promise<boolean>}
     */
    async shutdown(): Promise<boolean> {
        return true;
    }
}

export default ControllerManager;
