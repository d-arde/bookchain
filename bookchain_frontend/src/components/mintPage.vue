<template>
  <h1 class="font">Mint Token</h1>
  <div class="container font">
    <div v-if="matchedNFT" class="nft-details">
      <div class="nft-image-container">
        <img
          v-if="matchedNFT.logoURI"
          :src="matchedNFT.logoURI"
          alt="NFT Image"
          class="nft-image"
        />
        <p v-else>No image available</p>
      </div>
      <div class="nft-info">
        <h2>Name: {{ matchedNFT.name }}</h2>
        <p>Author: {{ matchedNFT.author }}</p>
        <p>Year: {{ matchedNFT.year }}</p>
        <p>Subject: {{ matchedNFT.subject }}</p>
        <button v-if="connected" @click="mintWithQuery">Mint Token</button>
        <p v-else>Connect your wallet to test mint</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const { connected } = useWallet();
const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
const route = useRoute();
const matchedNFT = ref(null);

if (!connected) {
  console.log("nope");
}

const mintWithQuery = async () => {
  if (!connected) return;
  const { query } = route;
  if (query && query.mint) {
    let [name, cid] = query.mint.split("-");
    if (name.length > 30) {
      const words = name.split(" ");
      words.pop();
      name = words.join(" ");
    }
    console.log(name, cid);
    await mintToken(name, "bkc", `https://${cid}.ipfs.nftstorage.link`);
  }
};

console.log(mintWithQuery);

async function getUserNFT() {
  const address = "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK";

  const { query } = route;
  const name = query.mint.split("-")[0]; // Extract name from query
  const storedNFT = sessionStorage.getItem(`matchedNFT_${name}`); // Retrieve stored data

  if (storedNFT) {
    matchedNFT.value = JSON.parse(storedNFT);
    sessionStorage.clear();
  } else {
    // Retrieve NFT data if not found in sessionStorage
    const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });
    const userNFTMetadata = await Promise.all(
      userNFTs.map(async (token) => {
        const mintPublickey = token.mintAddress;
        const mint = mintPublickey.toBase58();
        let name = token.name.trim();
        let author = "";
        let year = "";
        let subject = "";
        let logoURI;

        const NFTloaded = await metaplex
          .nfts()
          .findByMint({ mintAddress: mintPublickey });

        // Retrieve additional metadata if available
        if (NFTloaded.json && NFTloaded.json.attributes) {
          author = NFTloaded.json.attributes[0]?.value || "";
          year = NFTloaded.json.attributes[1]?.value || "";
          subject = NFTloaded.json.attributes[2]?.value || "";
        }

        // Retrieve name from NFT if not available
        if (name == "" && NFTloaded.json?.name && NFTloaded.json?.name != "") {
          name = NFTloaded.json?.name.trim();
        }
        if (NFTloaded.json?.image && NFTloaded.json?.image != "") {
          logoURI = NFTloaded.json?.image;
        } else {
          logoURI =
            "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
        }

        return {
          name,
          logoURI,
          mint,
          author,
          year,
          subject,
        };
      })
    );

    matchedNFT.value = userNFTMetadata.find((nft) => nft.name === name);

    console.log("MATCH: ", matchedNFT);
    // Store matchedNFT in sessionStorage
    sessionStorage.setItem(
      `matchedNFT_${name}`,
      JSON.stringify(matchedNFT.value)
    );
  }
}

onMounted(() => {
  getUserNFT();
});
</script>

<style scoped>
@import "../css/mintPage.css";
</style>
