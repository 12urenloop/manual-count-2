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
        url: "http://localhost:3000",
        endpoints: {
            teams_overview: "/teams",
            teams_count: "/teams/count/{}",
            teams_add: "/teams/add/{}"
        }
    },

    teams: {
        delay: 30
    }
};
