import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./assets/scss/application.scss";
import VWave from "v-wave";

// Create the Vue app
const app = createApp(App);

// Register Vue router
app.use(router);

// Register Pinia
app.use(createPinia());

// Ripple effect for cards
app.use(VWave, {
  color: "rgb(50,50,50)",
});

// Mount the Vue app to the root element
app.mount("#app");
