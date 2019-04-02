import Home from "./views/Home";

export default {
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home
        }
    ],

    endpoints: {
        counter: "http://localhost:73748/"
    },

    team: {
        click_delay: 5,
    }
};
