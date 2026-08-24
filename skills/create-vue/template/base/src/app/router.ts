import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/features/home/views/HomeView.vue'
import AboutView from '@/features/about/views/AboutView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
