<template>
  <div class="profile-container font">
    <div class="profile-header">
      <h1>Welcome {{ userAddress }}!</h1>
      <p>This is your profile page!</p>
    </div>
    <div v-if="isWalletConnected && isFetched">
      <div class="nft-list">
        <div v-for="(nft, index) in userNFT" :key="index" class="nft-item">
          <img :src="nft.logoURI" alt="NFT Image" />
          <h3>{{ nft.name }}</h3>
          <p>{{ nft.author }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="isWalletConnected && !isFetched">
      <div style="color: #ff0000; font-size: 16px; margin-top: 20px">
        Loading...
      </div>
    </div>
    <div v-else>
      <h2>Please connect your wallet!</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWorkspace, initWorkspace } from "@/scripts/workspace.js";
import { useWallet } from "solana-wallets-vue";
import { useToast } from "vue-toastification";

const { wallet } = useWorkspace();
const isWalletConnected = ref(false);
const userNFT = ref(null);
const isFetched = ref(false);
const userAddress = ref("");

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
const toast = useToast();
initWorkspace();

const connected = useWallet();
watch(
  () => connected.connected.value,
  (newValue) => {
    isWalletConnected.value = newValue;
    if (newValue) {
      getUserNFT();
    } else {
      userNFT.value = null;
      userAddress.value = ""; // Clear user NFTs when wallet is disconnected
    }
  }
);

async function getUserNFT() {
  if (!connected) {
    toast.error("Please connect your wallet!");
  }
  const address = wallet.value.publicKey.toBase58();
  userAddress.value = address;
  isFetched.value = false;

  const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });

  const userNFTMetadata = await Promise.all(
    userNFTs.map(async (token) => {
      // @ts-ignore
      const mintPublickey = token.mintAddress;
      const mint = mintPublickey.toBase58();
      let name = token.name.trim();
      let author = "";
      let year = "";
      let subject = "";
      let CID = "";
      let uri = "";
      let uri_split = "";
      let logoURI;

      const NFTloaded = await metaplex
        .nfts()
        .findByMint({ mintAddress: mintPublickey });
      author = NFTloaded.json.attributes[0].value;
      year = NFTloaded.json.attributes[1].value;
      subject = NFTloaded.json.attributes[2].value;
      uri = NFTloaded.uri;
      uri_split = uri.split(".");
      uri_split = uri_split[0].split("/");
      CID = uri_split[2];
      if (name == "" && NFTloaded.json?.name && NFTloaded.json?.name != "") {
        name = NFTloaded.json?.name.trim();
      }
      if (NFTloaded.json?.image && NFTloaded.json?.image != "") {
        logoURI = NFTloaded.json?.image;
      } else {
        logoURI =
          "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
      }
      console.log(NFTloaded);

      return {
        name,
        logoURI,
        mint,
        author,
        year,
        subject,
        CID,
      };
    })
  );

  userNFTMetadata.sort(function (a, b) {
    if (a.name.toUpperCase() < b.name.toUpperCase()) {
      return -1;
    }
    if (a.name.toUpperCase() > b.name.toUpperCase()) {
      return 1;
    }
    return 0;
  });

  userNFT.value = userNFTMetadata;
  isFetched.value = true;
}

onMounted(() => {
  isWalletConnected.value = connected.connected.value;
  if (connected) {
    getUserNFT();
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
}

.profile-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.nft-list {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.nft-item {
  width: calc(33.33% - 20px);
  margin: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.nft-item:hover {
  transform: translateY(-5px); /* Move the card up by 5px when hovered */
}

.nft-item img {
  max-width: 100%; /* Limit image width to fit inside the card */
  height: auto; /* Ensure aspect ratio is maintained */
  border-radius: 8px;
  margin: 0 auto; /* Center the image horizontally */
  display: block; /* Ensure the image is block-level */
  overflow: hidden;
}

.nft-item h3 {
  font-size: 18px;
  margin-bottom: 5px;
}

.nft-item p {
  font-size: 14px;
  color: #666;
}
</style>
