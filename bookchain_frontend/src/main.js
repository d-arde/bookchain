// to run, cd to front end and run npm start

import { createApp } from "vue";
import App from "./App.vue";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "solana-wallets-vue/styles.css";
import { initWallet } from "solana-wallets-vue";
import { createRouter, createWebHistory } from "vue-router";
import booksLists from "./components/booksLists.vue";
import homePage from "./views/HomePage.vue";
import adminPage from "./views/AdminPage.vue";
import mintPage from "./components/mintPage.vue";
import profilePage from "./components/profilePage.vue";
import FAQPage from "./views/FAQPage.vue";
import { initWorkspace } from "./scripts/workspace";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: homePage },
    { path: "/admin", component: adminPage },
    { path: "/all_books", component: booksLists },
    { path: "/mint", name: "mint", component: mintPage },
    { path: "/faq", component: FAQPage },
    { path: "/profile", component: profilePage },
  ],
});

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

initWallet({ wallets, autoConnect: true });
initWorkspace();

// const walletOptions = {
//   wallets: [
//     new PhantomWalletAdapter(),
//     new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
//   ],
//   autoConnect: false,
// };

// createApp(App).use(solanaWallets, walletOptions, router).mount("#app");
const app = createApp(App);

app.use(router);
app.use(Toast, {
  position: "bottom-left",
  timeout: 6000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.84,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: false,
  icon: true,
  rtl: false,
});

app.mount("#app");
// createApp(App).use(router, Toast).mount("#app");

export default router;

// const app = Vue.createApp({
//   router,
//   walletOptions,
//   solanaWallets,
// });

// app.mount("#app");
