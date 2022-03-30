import { createRouter, createWebHashHistory } from "vue-router";
import IndexPage from "./pages/index.vue";
import resetAuthPage from "./pages/resetAuth.vue";
import resetQueuePage from "./pages/resetQueue.vue";

// Routes
const routes = [
  {
    path: "/",
    component: IndexPage,
  },
  {
    path: "/reset-token",
    component: resetAuthPage,
  },
  {
    path: "/clear-queue",
    component: resetQueuePage,
  },
];

// Create the Vue app & mount it to the root element
export default createRouter({
  history: createWebHashHistory(),
  routes,
});
