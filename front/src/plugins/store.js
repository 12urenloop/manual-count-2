import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        teams: [],
        teamManager: null,
        timeManager: null,
    },
    mutations: {
        updateAllTeams(state, teams) {
            state.teams = { ...teams };

        },
        updateTeam(state, { id, status }) {
            const teams = { ...state.teams };
            teams[id].status = status;
            state.teams = teams;
        }
    }
});

export default store;