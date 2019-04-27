import Home from "./views/Home";
import Teams from "./views/Teams";
import Admin from "./views/Admin";

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
        },

        {
            path: "/admin",
            name: "Admin",
            component: Admin
        }
    ],

    backend: {
        url: "http://localhost:3000",
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
