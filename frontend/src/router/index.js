import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import UserPanel from "@/views/UserPanel.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  { path: "/dashboard", component: Dashboard },
  { path: "/userpanel", component: UserPanel },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
