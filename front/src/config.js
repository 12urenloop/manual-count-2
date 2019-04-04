import Home from "./views/Home";
import Teams from "./views/Teams";

export default {
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home
        },

        {
            path: "/teams",
            name: "Teams",
            component: Teams
        }
    ],

    backend: {
        url: "http://10.0.0.174:3000",
        endpoints: {
            teams_overview: "/teams",
            teams_count: "/teams/{}/bump?timestamp={}",
            teams_add: "/teams/add/{}",
            time: "/time"
        }
    },

    teams: {
        delay_bumpable: 15,
        delay_warning: 90,
        delay_refresh: 1,
        delay_post_lap: 1,
    }
};
