<template>
  <div class="searchSection">
    <input
      type="text"
      v-model="searchQuery"
      @input="handleSearchInput"
      placeholder="Search for you textbook here..."
      class="searchBar"
    />
    <div v-for="nft in filteredNFTs" :key="nft.mint" class="font">
      <p>this is the filtered nfts</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = new Metaplex(connection);
const searchQuery = ref("");
const userNFTs = ref([]);
const filteredNFTs = ref([]);

async function getUserNFTs() {
  const address = "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK";
  const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });
  const userNFTMetadata = await Promise.all(
    userNFTs.map(async (token) => {
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

  return userNFTMetadata;
}

userNFTs.value = await getUserNFTs();

// Function to handle search input change
const handleSearchInput = () => {
  const query = searchQuery.value.trim().toLowerCase();
  filteredNFTs.value = userNFTs.value.filter((nft) =>
    nft.name.toLowerCase().includes(query)
  );
};
</script>

<style>
@import "../css/frontPage.css";
</style>
