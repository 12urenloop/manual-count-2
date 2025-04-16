import { createApp } from "vue";
import { createPinia } from "pinia";
import { initDB } from "./helpers/db";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { dom } from "@fortawesome/fontawesome-svg-core";
import router from "./router";
import App from "./App.vue";
import VWave from "v-wave";

import 'animate.css';
import 'localforage/dist/localforage'
import "bulma/bulma.scss";
import "./assets/scss/application.scss";


// Create the Vue app
const app = createApp(App);
initDB();

// Register Vue router
app.use(router);

// Register Pinia
app.use(createPinia());

// Ripple effect for cards
app.use(VWave, {
  color: "rgb(50,50,50)",
});

// FA lib
library.add(faLock);
dom.watch();
app.component('font-awesome-icon', FontAwesomeIcon);


// Mount the Vue app to the root element
app.mount("#app");
