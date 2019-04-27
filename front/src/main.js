import Vue from "vue";
import App from "./App.vue";

import router from "./plugins/router";
import store from "./plugins/store";
import { config } from "./config";

import { teamManager } from "./team/TeamManager";
import { timeManager } from "./team/TimeManager";

import "./plugins/vuetify";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    timeManager.fetchTime();
    teamManager.updateTeams();
  }
}).$mount("#app");

// eslint-disable-next-line no-console
console.log(`Using backend at ${config.backend.url}`);
