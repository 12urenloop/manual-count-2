import Vue from "vue";
import App from "./App.vue";

import router from "./plugins/router";
import store from "./plugins/store";
import TeamManager from "./team/TeamManager";
import TimeManager from "./team/TimeManager";
import Config from "./config";

import "./plugins/vuetify";

Vue.config.productionTip = false;

// Create a TimeManager.
let timeManager = new TimeManager();

// Fetch the time from the server.
timeManager.fetchTime();

// Store the time manager.
store.state.timeManager = timeManager;

// Create a TeamManager.
let teamManager = new TeamManager(store);

// Store team manager.
store.state.teamManager = teamManager;

// Fetch the teams from the backend.
store.state.teamManager.updateTeams();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

// eslint-disable-next-line no-console
console.log(`Using backend at ${Config.backend.url}`);
