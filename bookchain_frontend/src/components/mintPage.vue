<template>
  <h1 class="font">Buy Textbook</h1>
  <div v-if="matchedNFT">
    <div class="container font">
      <div class="nft-details">
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
          <p>Price: ${{ matchedNFT.price }}</p>
          <button v-if="connected" @click="mintWithQuery">Buy Textbook</button>
          <p v-else style="font-size: larger; color: red">
            Connect your wallet to buy a textbook
          </p>
        </div>
      </div>
    </div>
    <br />
    <div class="font desc">
      <h2>About:</h2>
      <p>
        {{ matchedNFT.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
import { sendSolana } from "@/scripts/sendPayment.js";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useToast } from "vue-toastification";

const { connected } = useWallet();
const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
const toast = useToast();
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
    try {
      toast.info("Please approve both transactions to buy textbook");
      try {
        await sendSolana(matchedNFT.value.price);
      } catch (error) {
        toast.error(
          "An error has occured whilst sending payment! Please try again."
        );
        return;
      }
      await mintToken(
        name,
        "bkc",
        `https://coral-urgent-cicada-906.mypinata.cloud/ipfs/${cid}`
        // ?pinataGatewayToken=x4DOBOvHmszo1Y2SmEXYrCI0sKemrOUBTmqyKJ5zgTI59JHSW5_0Vh1Cr7UzdLEj
      );
      toast.success("Congrats! View your book on the profile tab.");
    } catch (error) {
      toast.error("Sorry! An error has occurred, please try again.");
    }
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
        let description = "";
        let price = "";
        let logoURI;

        const NFTloaded = await metaplex
          .nfts()
          .findByMint({ mintAddress: mintPublickey });

        // Retrieve additional metadata if available
        if (NFTloaded.json && NFTloaded.json.attributes) {
          author = NFTloaded.json.attributes[0]?.value || "";
          year = NFTloaded.json.attributes[1]?.value || "";
          subject = NFTloaded.json.attributes[2]?.value || "";
          description = NFTloaded.json.description || "";
          price = NFTloaded.json.attributes[4]?.value || "";
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

        console.log("PRICE:", NFTloaded);

        return {
          name,
          logoURI,
          mint,
          author,
          year,
          subject,
          description,
          price,
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
