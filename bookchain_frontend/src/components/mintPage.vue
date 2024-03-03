<template>
  <div>
    <h1>Mint Token</h1>
    <button v-if="connected" @click="mintWithQuery">Mint Token</button>
    <p v-else>Connect your wallet to test mint</p>
  </div>
</template>

<script setup>
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
import { python, marketing, electromagnetics } from "../metadata.js";
import { useRoute } from "vue-router";

const { connected } = useWallet();
const route = useRoute();

if (!connected) {
  console.log("nope");
}

const mintWithQuery = async () => {
  console.log("button printed");
  if (!connected) return;
  console.log("is connected");
  const { query } = route;
  console.log(query, query.mint);
  if (query && query.mint) {
    console.log("in if");
    switch (query.mint) {
      case "Python Basics":
        console.log("python case");
        mintToken(
          python.name,
          "bkc",
          "https://raw.githubusercontent.com/d-arde/bookchain/test2/bookchain_frontend/src/python_metadata.json"
        );
        break;
      case "Electromagnetics":
        console.log("engineering case");
        mintToken(
          electromagnetics.name,
          "bkc",
          "https://raw.githubusercontent.com/d-arde/bookchain/test2/bookchain_frontend/src/metadata.json"
        );
        break;
      case "Principles of Marketing":
        console.log("marketing case");
        mintToken(
          marketing.name,
          "bkc",
          "https://raw.githubusercontent.com/d-arde/bookchain/test2/bookchain_frontend/src/marketing_metadata.json"
        );
        break;
      default:
        console.log("default case :/");
        console.error("Invalid option");
    }
  }
};

console.log(mintWithQuery);
</script>

<style scoped>
/* Add component styles here */
</style>
