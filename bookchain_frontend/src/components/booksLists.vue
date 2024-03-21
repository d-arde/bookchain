<template>
  <div class="font">
    <h1 style="text-align: center">Buy Textbooks</h1>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="search-bar"
    />
    <div v-if="isFetched" class="nft-container">
      <div
        v-for="(nft, index) in filteredNFT"
        :key="index"
        class="nft-card"
        @click="getToMintPage(nft)"
      >
        <img :src="nft.logoURI" alt="NFT Image" class="nft-image" />
        <h1 class="nft-name">{{ nft.name }}</h1>
        <p class="nft-name">Author: {{ nft.author }}</p>
        <p class="nft-name">Year of Release: {{ nft.year }}</p>
        <p class="nft-name">Subject: {{ nft.subject }}</p>
        <p class="nft-name">Price: ${{ nft.price }}</p>
        <br />
      </div>
    </div>
    <div v-else class="loading font">Loading...</div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const connection = new Connection(clusterApiUrl("devnet"));
    const metaplex = new Metaplex(connection);
    const router = useRouter();

    const userNFT = ref(null);
    const isFetched = ref(false);
    const searchQuery = ref("");

    async function getUserNFT() {
      const address = "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK";
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
          let price = "";
          let logoURI;

          const NFTloaded = await metaplex
            .nfts()
            .findByMint({ mintAddress: mintPublickey });
          author = NFTloaded.json.attributes[0].value;
          year = NFTloaded.json.attributes[1].value;
          subject = NFTloaded.json.attributes[2].value;
          price = NFTloaded.json.attributes[4].value;
          uri = NFTloaded.uri;
          uri_split = uri.split(".");
          uri_split = uri_split[0].split("/");
          CID = uri_split[2];
          if (
            name == "" &&
            NFTloaded.json?.name &&
            NFTloaded.json?.name != ""
          ) {
            name = NFTloaded.json?.name.trim();
          }
          if (NFTloaded.json?.image && NFTloaded.json?.image != "") {
            logoURI = NFTloaded.json?.image;
          } else {
            logoURI =
              "https://arweave.net/WCMNR4N-4zKmkVcxcO2WImlr2XBAlSWOOKBRHLOWXNA";
          }

          console.log("NFT:", NFTloaded);
          return {
            name,
            logoURI,
            mint,
            author,
            year,
            subject,
            CID,
            price,
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

    function getToMintPage(nft) {
      console.log("nftData:", nft);
      const nameWithCID = `${nft.name}-${nft.CID}`; // Concatenate name and cid
      console.log(nameWithCID);
      router.push({
        path: "/mint",
        query: { mint: nameWithCID },
        params: { nftData: nft },
      });
    }

    const filteredNFT = computed(() => {
      if (!userNFT.value) return [];
      const query = searchQuery.value.trim().toLowerCase();
      return userNFT.value.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.author.toLowerCase().includes(query) ||
          nft.year.toString().includes(query) ||
          nft.subject.toLowerCase().includes(query)
      );
    });

    onMounted(() => {
      getUserNFT();
    });

    return {
      userNFT,
      isFetched,
      getUserNFT,
      getToMintPage,
      filteredNFT,
      searchQuery,
    };
  },
};
</script>

<style scoped>
@import "../css/bookList.css";
</style>

//streamline the adminPage to be just two processes. Upload files as one ('next'
button to upload) //and metadata and mint as the other processes
