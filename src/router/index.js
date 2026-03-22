import { createRouter, createWebHistory } from 'vue-router'
import Office from '../views/Office.vue'

const routes = [
  { path: '/', name: 'Office', component: Office }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
