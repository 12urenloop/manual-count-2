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
            state.teams = { ...state.teams, id: { ...state.teams[id], status } }
        }
    }
});

export default store;