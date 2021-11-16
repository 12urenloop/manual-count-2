import { createRouter, createWebHashHistory } from "vue-router";
import IndexPage from "./pages/index.vue";

// Routes
const routes = [
  {
    path: "/",
    component: IndexPage,
  },
];

// Create the Vue app & mount it to the root element
export default createRouter({
  history: createWebHashHistory(),
  routes,
});
