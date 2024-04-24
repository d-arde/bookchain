<template>
  <div class="font">
    <h1 style="text-align: center">Buy Textbooks</h1>
    <div class="main-content">
      <div class="filters">
        <h2>Filters:</h2>
        <div>
          <h3 for="author">Author:</h3>
          <div v-for="author in filters.authors" :key="author">
            <input type="checkbox" v-model="selectedAuthors" :value="author" />
            <label>{{ author }}</label>
          </div>
        </div>
        <div>
          <h3 for="year">Year of Release:</h3>
          <div v-for="year in filters.years" :key="year">
            <input type="checkbox" v-model="selectedYears" :value="year" />
            <label>{{ year }}</label>
          </div>
        </div>
        <div>
          <h3 for="subject">Subject:</h3>
          <div v-for="subject in filters.subjects" :key="subject">
            <input
              type="checkbox"
              v-model="selectedSubjects"
              :value="subject"
            />
            <label>{{ subject }}</label>
          </div>
        </div>
        <div>
          <h3>Price Range:</h3>
          <div v-for="range in priceRanges" :key="range">
            <input
              type="checkbox"
              v-model="selectedPriceRanges"
              :value="range"
            />
            <label>{{ range }}</label>
          </div>
        </div>
      </div>
      <div class="results">
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
            <p class="nft-name">
              Price: {{ convertToSol(nft.price) }} SOL
              <span style="color: grey">(~${{ nft.price }})</span>
            </p>
            <br />
          </div>
        </div>
        <div v-else class="loading font">Loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useRouter } from "vue-router";
import { getSolanaPrice } from "../scripts/sendPayment.js";

export default {
  setup() {
    const connection = new Connection(clusterApiUrl("devnet"));
    const metaplex = new Metaplex(connection);
    const router = useRouter();

    const userNFT = ref(null);
    const isFetched = ref(false);
    const searchQuery = ref("");
    const solPrice = ref(null);
    const filters = ref({
      authors: [],
      years: [],
      subjects: [],
    });
    const selectedAuthors = ref([]);
    const selectedYears = ref([]);
    const selectedSubjects = ref([]);
    const selectedPriceRanges = ref([]);
    const priceRanges = ["<20$", "21-50$", "51-100$", "101-150$", "151$>"];

    // function creates an array of all data from NFTs from the address specified
    async function getUserNFT() {
      // address of 'admin wallet'
      const address = "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK";
      isFetched.value = false;
      //function to get all NFTs from address
      const userNFTs = await metaplex.nfts().findAllByOwner({ owner: address });
      const userNFTMetadata = await Promise.all(
        // for each NFT in userNFT, map and assign these variables
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
          let price = "";
          let logoURI;

          // this gets data of a specific NFT using the mint address - allowing for assigning the different traits
          const NFTloaded = await metaplex
            .nfts()
            .findByMint({ mintAddress: mintPublickey });
          // all fields for main page are specified here
          author = NFTloaded.json.attributes[0].value;
          year = NFTloaded.json.attributes[1].value;
          subject = NFTloaded.json.attributes[2].value;
          price = NFTloaded.json.attributes[4].value;
          uri = NFTloaded.uri;
          uri_split = uri.split(".");
          uri_split = uri_split[2].split("/");
          CID = uri_split[2];

          if (author && !filters.value.authors.includes(author)) {
            filters.value.authors.push(author);
          }

          if (year && !filters.value.years.includes(year)) {
            filters.value.years.push(year);
          }

          if (subject && !filters.value.subjects.includes(subject)) {
            filters.value.subjects.push(subject);
          }

          // this is some error handling, so if fields are empty - there are placeholders
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
            author,
            year,
            subject,
            CID,
            price,
          };
        })
      );

      // sorts all the nfts
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
    // this function redirects the user to the correct textbook page, with the correct data of the textbook they clicked on
    function getToMintPage(nft) {
      console.log("nftData:", nft);
      const nameWithCID = `${nft.name}-${nft.CID}`;
      console.log("CID", nameWithCID);
      router.push({
        path: "/mint",
        query: { mint: nameWithCID },
        params: { nftData: nft },
      });
    }

    // this function is for the filtering system
    const filteredNFT = computed(() => {
      if (!userNFT.value) return [];
      const query = searchQuery.value.trim().toLowerCase();
      return userNFT.value.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) &&
          (selectedAuthors.value.length === 0 ||
            selectedAuthors.value.includes(nft.author)) &&
          (selectedYears.value.length === 0 ||
            selectedYears.value.includes(nft.year)) &&
          (selectedSubjects.value.length === 0 ||
            selectedSubjects.value.includes(nft.subject)) &&
          (selectedPriceRanges.value.length === 0 ||
            selectedPriceRanges.value.some((range) => {
              if (range === "<20$") {
                return parseFloat(nft.price) < 20;
              } else if (range === "21-50$") {
                return (
                  parseFloat(nft.price) >= 21 && parseFloat(nft.price) <= 50
                );
              } else if (range === "51-100$") {
                return (
                  parseFloat(nft.price) >= 51 && parseFloat(nft.price) <= 100
                );
              } else if (range === "101-150$") {
                return (
                  parseFloat(nft.price) >= 101 && parseFloat(nft.price) <= 150
                );
              } else if (range === "151$>") {
                return parseFloat(nft.price) >= 151;
              }
            }))
      );
    });

    // converts USD to SOL price (for the price attribute on the nft card)
    const convertToSol = (price) => {
      return (price / solPrice.value).toFixed(2);
    };

    // performs these actions when page first opens
    onMounted(async () => {
      getUserNFT();
      try {
        solPrice.value = await getSolanaPrice();
      } catch (error) {
        console.error("Error fetching Solana price:", error);
      }
    });

    return {
      userNFT,
      isFetched,
      searchQuery,
      selectedAuthors,
      selectedYears,
      selectedSubjects,
      selectedPriceRanges,
      filters,
      filteredNFT,
      priceRanges,
      solPrice,
      convertToSol,
      getToMintPage,
    };
  },
};
</script>

<style scoped>
@import "../css/bookList.css";
</style>
