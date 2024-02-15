<script setup>
// import { useWorkspace } from "../scripts/workspace";
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
// const { program } = useWorkspace();
const { connected } = useWallet();

const metadata = {
  name: "Kobeni",
  symbol: "kBN",
  uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
};
// const emit = defineEmits(["minted"]);
const mint = async () => {
  if (!connected) return;
  const token = await mintToken(metadata.name, metadata.symbol, metadata.uri);
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
