const request = require("request");
const config = require("./config.json");

request(`${config.locations.manualcount}/teams`, function (error, response, body) {
    if (error || response.statusCode !== 200) {
        console.log(error);
        if (response) {
            console.log(response.statusCode)
            console.log(response.statusMessage)
        }
        return
    }
    const newState = {
        teams: {}
    };
    const state = JSON.parse(body);
    console.log(state);


    state.teams.forEach((team) => {
            const offset = config.offsets[team.id];
            newState.teams[team.id] = {
                id: team.id,
                name: team.name,
                laps: offset + team.status.lapCount,
                updated: team.status.lastBumpAt
            }
        }
    );

    request.put(`${config.locations.boxxy}/teams`, {
        json: true, body: newState,
        auth: {
            user: config.user,
            pass: config.pass,
            sendImmediately: false
        }
    })
        .on("response", (response => {
            console.log(response.statusCode);
            console.log(response.statusMessage);
        }));

});

