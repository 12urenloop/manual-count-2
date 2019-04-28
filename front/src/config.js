import Home from "./views/Home";
import Teams from "./views/Teams";
import Admin from "./views/Admin";

export const config = {
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
        },

        {
            path: "/admin",
            name: "Admin",
            component: Admin
        }
    ],

    backend: {
        url: "http://10.0.21.21:3000",
        retries: 1,
        endpoints: {
            teams_overview: "/teams",
            teams_count: "/teams/{}/bump?timestamp={}",
            teams_add: "/teams/add/{}",
            time: "/time",
            reset_counter: "/reset-db"
        }
    },

    teams: {
        delay_bumpable: 15,
        delay_warning: 90,
        delay_error: 120,
        delay_refresh: 3,
        delay_post_lap: 1,
    }
};
