<script setup>
// import { useWorkspace } from "../scripts/workspace";
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
// const { program } = useWorkspace();
// import { description, name } from "../metadata.json";
import { description, name } from "../python_metadata.json";
const { connected } = useWallet();

// const emit = defineEmits(["minted"]);
const mint = async () => {
  if (!connected) return;
  console.log(description);
  console.log(name);
  const token = await mintToken(
    name,
    "bkc",
    "https://raw.githubusercontent.com/d-arde/bookchain/test2/bookchain_frontend/src/metadata.json"
  );
  // emit("minted", token);
  console.log(token);
};
</script>

<template>
  <div>
    <h1>Admin</h1>
    <button v-if="connected" @click="mint">Mint Token</button>
    <p v-else>Connect your wallet to test mint</p>
  </div>
</template>
