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
          @click="redirectToURI(nft.uri)"
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "solana-wallets-vue";
import { useToast } from "vue-toastification";
import { ACCESS_TOKEN } from "@/scripts/upload";
const crypto = require("crypto");

function hashToken(token) {
  const hash = crypto.createHash("sha256"); // You can use other hash algorithms like 'md5', 'sha512', etc.
  hash.update(token);
  return hash.digest("hex"); // Return the hashed token as a hexadecimal string
}

const token = ACCESS_TOKEN;
const hashedToken = hashToken(token);
console.log("Hashed token:", hashedToken);

const isWalletConnected = ref(false);
const userNFT = ref(null);
const isFetched = ref(false);
const userAddress = ref("");

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
const toast = useToast();

const connected = useWallet();
watch(
  () => connected.connected.value,
  async (newValue) => {
    isWalletConnected.value = newValue;
    if (newValue) {
      getUserNFT();
    } else {
      console.log("USERNFT: ", userNFT);
      userNFT.value = null;
      userAddress.value = ""; // Clear user NFTs when wallet is disconnected
    }
  }
);

const redirectToURI = (uri) => {
  // const newURI = uri + '?pinataGatewayToken=x4DOBOvHmszo1Y2SmEXYrCI0sKemrOUBTmqyKJ5zgTI59JHSW5_0Vh1Cr7UzdLEj';
  window.open(uri, "_blank");
  // ?pinataGatewayToken=x4DOBOvHmszo1Y2SmEXYrCI0sKemrOUBTmqyKJ5zgTI59JHSW5_0Vh1Cr7UzdLEj
};

async function getUserNFT() {
  if (!connected) {
    toast.error("Please connect your wallet!");
  }
  const address = connected.publicKey.value.toBase58();
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
      console.log(NFTloaded);
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
    // Empty wallet case
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

// pinata api
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMmM1MjdlNy0zYzRjLTRhMDktOWVmOC1iMTQ5ZGYxZWQ5MTIiLCJlbWFpbCI6ImZhbGx0aGVmb3gxMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ0NzY3MmUwNDE0ZTkwZWE0OTFlIiwic2NvcGVkS2V5U2VjcmV0IjoiMWRmOWM2NzI1NWUxMTk4NDVmOWVhZjFhYTE5NGE1YWY5NTc2MjQwM2EzY2UzYjJiOWQzYmE1NGE0ODkyYjAzOSIsImlhdCI6MTcxMjA1NDYxN30._uVT0NylLbrsIhbD8I6UwNiyzTQU2PAiEd2_nOpBDqA

// pinata gateway
// https://coral-urgent-cicada-906.mypinata.cloud

// bafybeidkr4elcpwvgmw4c2hyf3jmzsgikg7zee74awftklmowvfuzg243i.ipfs.nftstorage.link/python-basics-sample-chapters.pdf
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
