import App from './App.vue';
import { createApp } from 'vue';

// dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// windi Styles
import 'virtual:windi-base.css';
import 'virtual:windi-components.css';
import 'virtual:windi-utilities.css';

// router
import { createWebHashHistory, createRouter } from 'vue-router';
import routes from '~pages';

// Customized Styles
import '@/styles/index.less';

dayjs.locale('zh-cn');

const app = createApp(App);

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

app.use(router);
app.mount('#app');
