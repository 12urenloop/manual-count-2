import Vue from "vue";
import VueRouter from "vue-router";
import { config } from "../config";

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes: config.routes
});

export default router;