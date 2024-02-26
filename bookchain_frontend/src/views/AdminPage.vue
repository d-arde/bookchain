<script setup>
// import { useWorkspace } from "../scripts/workspace";
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
// const { program } = useWorkspace();
import { description, name } from "../metadata.json";
const { connected } = useWallet();

// const metadata = {
//   attributes: [
//     {
//       trait_type: "Author",
//       value: "John A Wick",
//     },
//     {
//       trait_type: "Year",
//       value: "2011",
//     },
//     {
//       trait_type: "Subject",
//       value: "Engineering",
//     },
//     {
//       trait_type: "Code",
//       value: "AV751D",
//     },
//   ],
//   description: "A textbook minted through Bookchain!",
//   name: "Electromagnetics",
//   symbol: "BKC",
//   properties: {
//     files: [
//       {
//         type: "application/pdf",
//         url: "https://nftstorage.link/ipfs/bafkreidiqxv6dhzeul2zgkwtzuoqr32zbx3y45kdwtbhcfkrr7ehf444vq",
//       },
//       {
//         type: "image/jpg",
//         url: "https://nftstorage.link/ipfs/bafkreidiqxv6dhzeul2zgkwtzuoqr32zbx3y45kdwtbhcfkrr7ehf444vq",
//       },
//     ],
//   },
// };

// const emit = defineEmits(["minted"]);
const mint = async () => {
  if (!connected) return;
  console.log(description);
  console.log(name);
  const token = await mintToken(
    name,
    "bkc",
    "https://raw.githubusercontent.com/d-arde/bookchain/test/bookchain_frontend/src/metadata.json?token=GHSAT0AAAAAACKIX3SWETOISOFNVZVWJPNUZO4TN4Q"
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
