<template>
  <div class="profile-container font">
    <div class="profile-header">
      <h1>Welcome {{ userAddress }}!</h1>
      <p>This is your profile page!</p>
    </div>
    <div v-if="isWalletConnected && isFetched">
      <div v-if="userNFT && userNFT.length > 0" class="nft-list">
        <div
          v-for="(nft, index) in userNFT"
          :key="index"
          class="nft-item"
          @click.prevent="openModal(nft.uri)"
        >
          <img :src="nft.logoURI" alt="NFT Image" />
          <h3>{{ nft.name }}</h3>
          <p>{{ nft.author }}</p>
        </div>
      </div>
      <div v-else>
        <p>No NFTs found in your wallet!</p>
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

    <!-- Modal -->
    <div v-if="modalOpen" class="modal-container">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-content">
        <div class="wrapper"></div>
        <iframe
          :src="modalUri"
          class="iframe-container"
          id="textbook-iframe"
          oncontextmenu="return false"
          false
        ></iframe>
      </div>
      <button class="modal-close" @click="closeModal">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
// import { useToast } from "vue-toastification";

const isWalletConnected = ref(false);
const userNFT = ref(null);
const isFetched = ref(false);
const userAddress = ref("");
const modalOpen = ref(false);
const modalUri = ref("");

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
// const toast = useToast();
const connected = useWallet();

watch(
  () => connected.connected.value,
  async (newValue) => {
    isWalletConnected.value = newValue;
    if (newValue) {
      getUserNFT();
    } else {
      userNFT.value = null;
      userAddress.value = "";
    }
  }
);

// const redirectToURI = (uri) => {
//   window.open(uri, "_blank");
// };

const openModal = (uri) => {
  modalUri.value = uri;
  modalOpen.value = true;
  scrollToTop(); // Scroll to the top when modal is opened
};

const scrollToTop = () => {
  // Scroll to the top of the page
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const closeModal = () => {
  modalOpen.value = false;
};

async function getUserNFT() {
  const address = connected.publicKey.value.toBase58();
  userAddress.value = address;
  isFetched.value = false;

  const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });

  const userNFTMetadata = await Promise.all(
    userNFTs.map(async (token) => {
      const mintPublickey = token.mintAddress;
      const mint = mintPublickey.toBase58();
      let name = token.name.trim();
      let author = "";
      let year = "";
      let subject = "";
      let uri = "";
      let logoURI;

      const NFTloaded = await metaplex
        .nfts()
        .findByMint({ mintAddress: mintPublickey });
      author = NFTloaded.json.attributes[0].value;
      year = NFTloaded.json.attributes[1].value;
      subject = NFTloaded.json.attributes[2].value;
      uri = NFTloaded.json.properties.files[0].url;

      if (name == "" && NFTloaded.json?.name && NFTloaded.json?.name != "") {
        name = NFTloaded.json?.name.trim();
      }
      if (NFTloaded.json?.image && NFTloaded.json?.image != "") {
        logoURI = NFTloaded.json?.image;
      } else {
        logoURI =
          "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
      }
      const symbolField = NFTloaded.symbol;
      if (symbolField !== "bkc") {
        return null;
      }

      return {
        name,
        logoURI,
        mint,
        author,
        year,
        subject,
        uri,
        symbolField,
      };
    })
  );

  const filteredNFTs = userNFTMetadata.filter((nft) => nft !== null);

  if (filteredNFTs.length === 0) {
    isFetched.value = true;
    userNFT.value = [];
    return;
  }

  filteredNFTs.sort(function (a, b) {
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

.iframe-container {
  width: 100%; /* Adjust as needed */
  height: 900px; /* Adjust as needed */
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 90%; /* Increase the height to 90% or adjust as needed */
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-background {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: #fff;
  border-radius: 5px;
  z-index: 1;
  overflow: auto; /* Enable scrolling */
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 3.5em;
  width: 10em;
  height: 3em;
  z-index: 9999;
}

.embed-cover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  /* Just for demonstration, remove this part */
  opacity: 0.25;
}

.wrapper {
  position: relative;
  overflow: hidden;
}
</style>
