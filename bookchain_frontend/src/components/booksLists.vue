<template>
  <div>
    <div v-if="isFetched">
      <div v-for="(nft, index) in userNFT" :key="index">
        <img @click="getToMintPage(nft)" :src="nft.logoURI" alt="NFT Image" />
        <h1 @click="getToMintPage(nft)">{{ nft.name }}</h1>
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
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

    async function getUserNFT() {
      const address = "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK";
      isFetched.value = false;

      const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });
      console.log(userNFTs);

      const userNFTMetadata = await Promise.all(
        userNFTs.map(async (token) => {
          // @ts-ignore
          const mintPublickey = token.mintAddress;
          const mint = mintPublickey.toBase58();
          let name = token.name.trim();
          let logoURI;

          const NFTloaded = await metaplex
            .nfts()
            .findByMint({ mintAddress: mintPublickey });

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

          return {
            name,
            logoURI,
            mint,
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
      console.log("user NFTs", userNFTMetadata);
    }

    function getToMintPage(nft) {
      router.push({ path: "/mint", query: { mint: nft.name } });
    }

    onMounted(() => {
      getUserNFT();
    });

    return { userNFT, isFetched, getUserNFT, getToMintPage };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+3");
.font {
  font-family: "Source Sans 3", sans-serif;
}
</style>
