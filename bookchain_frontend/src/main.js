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
import { initWorkspace } from "./scripts/workspace";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: homePage },
    { path: "/admin", component: adminPage },
    { path: "/all_books", component: booksLists },
    { path: "/mint", name: "mint", component: mintPage },
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
createApp(App).use(router).mount("#app");

export default router;

// const app = Vue.createApp({
//   router,
//   walletOptions,
//   solanaWallets,
// });

// app.mount("#app");
