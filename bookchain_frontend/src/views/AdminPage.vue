<template>
  <div class="font">
    <div v-if="connected && isAdminConnected">
      <h1>Upload Textbook and Metadata</h1>
      <div class="intro">
        <h2>Instructions for uploading a textbook</h2>
        <p>
          Firstly, make sure you have access to the admin wallet. The admin
          wallet has this address:
          <strong style="font-size: 18px"
            >DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK</strong
          >. <br />
          Now, the following is how you use the forms below to mint the
          textbook!
        </p>
        <ul>
          <li>
            The 'Upload Files' section is to upload the front cover of the
            textbook, and the PDF file of the textbook itself.
            <br />
          </li>
          <li>
            The 'Upload Metadata' is where all the important traits of the token
            are inputted. The most important of these are the last four. <br />
            These have already been prefilled for you from the previous step.
          </li>
          <br />
          And that's all!
        </ul>
      </div>
      <br />
      <br />
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="{ 'form-slide': true, active: currentStep === index }"
        class="form-container"
      >
        <div v-if="index === 0" class="form-group form-input">
          <h2>Upload Files</h2>
          <label class="" for="name">Cover Upload:</label>
          <br />
          <input
            type="file"
            id="fileInputImg"
            name="imgFile"
            @change="handleImgFileChange"
          />
          <br />
          <br />
          <label class="form-label" for="email">Textbook Upload:</label>
          <input
            type="file"
            id="fileInputPdf"
            name="pdfFile"
            @change="handlePdfFileChange"
          />
        </div>
        <div v-if="index === 1" class="form-group form-input">
          <h2>Upload Metadata</h2>
          <form>
            <label for="name">Name: </label>
            <input
              type="text"
              v-model="formData.name"
              id="name"
              name="name"
              class="upload-metadata"
            /><br />
            <br />
            <label for="description">Description:</label><br />
            <textarea
              v-model="formData.description"
              id="description"
              name="description"
              rows="4"
              cols="50"
              class="upload-metadata"
            ></textarea
            ><br />
            <br />
            <label for="author">Author:</label>
            <input
              type="text"
              v-model="formData.author"
              id="author"
              name="author"
              class="upload-metadata"
            /><br />
            <br />
            <label for="year">Year:</label>
            <input
              type="text"
              v-model="formData.year"
              id="year"
              name="year"
              class="upload-metadata"
            /><br />
            <br />
            <label for="subject">Subject:</label>
            <input
              type="text"
              v-model="formData.subject"
              id="subject"
              name="subject"
              class="upload-metadata"
            /><br />
            <br />
            <label for="code">Code:</label>
            <input
              type="text"
              v-model="formData.code"
              id="code"
              name="code"
              class="upload-metadata"
            /><br />
            <br />
            <label for="pdfUrl">PDF CID:</label>
            <input
              type="text"
              v-model="formData.pdfUrl"
              id="pdfUrl"
              name="pdfUrl"
              class="upload-metadata"
              style="color: grey"
              readonly
            /><br />
            <br />
            <label for="imageUrl">Image CID:</label>
            <input
              type="text"
              v-model="formData.imageUrl"
              id="imageUrl"
              name="imageUrl"
              class="upload-metadata"
              style="color: grey"
              readonly
            /><br />
            <br />
            <label for="pdfName">PDF File Name:</label>
            <input
              type="text"
              v-model="formData.pdfName"
              id="pdfName"
              name="pdfName"
              class="upload-metadata"
              style="color: grey"
              readonly
            /><br />
            <br />
            <label for="imageName">Image File Name:</label>
            <input
              type="text"
              v-model="formData.imageName"
              id="imageName"
              name="imageName"
              class="upload-metadata"
              style="color: grey"
              readonly
            /><br />
            <br />
            <label for="price">Price (USD):</label>
            <input
              type="number"
              v-model="formData.price"
              id="price"
              name="price"
              class="upload-metadata"
            />
          </form>
        </div>
        <button
          v-if="index < steps.length - 1"
          class="form-button"
          @click="nextStep"
        >
          Next
        </button>
        <button
          v-if="index === steps.length - 1"
          class="form-button"
          @click="submitForm"
        >
          Upload Metadata
        </button>
        <img
          v-if="loading"
          src="../img/loading.svg"
          alt="Loading"
          style="margin-left: 1em; margin-top: 1em"
        />
        <br />
      </div>
    </div>
    <div v-else>
      <h1 class="font wallet-message">
        Access Denied, please connect the Admin wallet
      </h1>
    </div>
    <footer></footer>
  </div>
</template>

<script setup>
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
import { PINATA_KEY } from "../scripts/upload.js";
// import { ACCESS_TOKEN } from "../scripts/upload.js";
import { storeTextbookPinata } from "../scripts/upload.js";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useWorkspace, initWorkspace } from "@/scripts/workspace.js";
import { useToast } from "vue-toastification";
import { ACCESS_TOKEN } from "../scripts/upload.js";
const { connected } = useWallet();
const toast = useToast();
const router = useRouter();

initWorkspace();
const { wallet } = useWorkspace();

const isAdminConnected = computed(() => {
  if (
    wallet.value.publicKey.toBase58() ===
      "DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK" &&
    connected
  ) {
    return true;
  } else {
    return false;
  }
});

const currentStep = ref(0);
const formData = ref({
  name: "",
  description: "",
  author: "",
  year: "",
  subject: "",
  code: "",
  pdfUrl: "",
  imageUrl: "",
  pdfName: "",
  imageName: "",
  price: "",
});

let imgFile = null;
let pdfFile = null;
let folderName = "";
let bookName = "";
const loading = ref(false);

const handleImgFileChange = async (event) => {
  imgFile = event.target.files[0];
};

const handlePdfFileChange = async (event) => {
  pdfFile = event.target.files[0];
  folderName = event.target.files[0].name.split(".")[0];
};

const uploadFile = async () => {
  if (!imgFile || !pdfFile) {
    toast.warning("Please select both files to upload to NFTStorage.");
    return null;
  }

  try {
    const result = await storeTextbookPinata(imgFile, pdfFile, folderName);
    console.log("PRINT RESULT", result);
    formData.value.imageName = imgFile.name;
    formData.value.pdfName = pdfFile.name;
    formData.value.pdfUrl = result.IpfsHash;
    formData.value.imageUrl = result.IpfsHash;
    currentStep.value++;
  } catch (error) {
    console.error(error);
    toast.error("Upload failed, please try again.");
    return null;
  }
};

const generateMetadata = async () => {
  const metadata = {
    attributes: [
      { trait_type: "Author", value: formData.value.author },
      { trait_type: "Year", value: formData.value.year },
      { trait_type: "Subject", value: formData.value.subject },
      { trait_type: "Code", value: formData.value.code },
      { trait_type: "Price", value: `${formData.value.price}` },
    ],
    collection: {
      family: "Bookchain",
      name: "Bookchain",
    },
    description: formData.value.description,
    name: formData.value.name,
    image: `https://coral-urgent-cicada-906.mypinata.cloud/ipfs/${formData.value.imageUrl}/${formData.value.imageName}${ACCESS_TOKEN}`,
    properties: {
      files: [
        {
          type: "application/pdf",
          url: `https://coral-urgent-cicada-906.mypinata.cloud/ipfs/${formData.value.pdfUrl}/${formData.value.pdfName}${ACCESS_TOKEN}`,
        },
        {
          type: "image/jpg",
          url: `https://coral-urgent-cicada-906.mypinata.cloud/ipfs/${formData.value.imageUrl}/${formData.value.imageName}${ACCESS_TOKEN}`,
        },
      ],
    },
  };

  const metadataJSON = JSON.stringify(metadata, null, 2);

  try {
    toast.info("Uploading... Please be patient");
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_KEY}`,
          "Content-Type": "application/json",
        },
        body: metadataJSON,
      }
    );

    console.log("BODY", metadataJSON);

    if (!response.ok) {
      throw new Error("Failed to upload metadata");
    }

    const responseData = await response.json();
    toast.success("Metadata uploaded successfully");
    console.log("Metadata uploaded successfully:", responseData);
    console.log("Metadata CID (need this):", responseData.IpfsHash);
    return responseData.IpfsHash;
  } catch (error) {
    toast.error("Error uploading metadata");
    console.error("Error uploading metadata:", error);
  }
};

const mint = async (metadataCID) => {
  bookName = formData.value.name;
  toast.info(`Minting ${bookName}`);
  try {
    const token = await mintToken(
      bookName,
      "bkc",
      `https://coral-urgent-cicada-906.mypinata.cloud/ipfs/${metadataCID}${ACCESS_TOKEN}`
    );
    metadataCID = "";
    toast.success(`${bookName} minted successfully`);
    console.log(token);
    router.push("/");
  } catch (error) {
    toast.error("Sorry! An error has occured. Please try again.");
    await delay(2000);
    router.push("/");
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const steps = ref([{ label: "Step 1" }, { label: "Step 2" }]);

const nextStep = async () => {
  loading.value = true;
  await uploadFile();
  loading.value = false;
};

const submitForm = async () => {
  // add a check to make sure that all of the fields are populating. Otherwise, it will upload an empty metadata file
  loading.value = true;
  const metadataGen = await generateMetadata();
  await mint(metadataGen);
  loading.value = false;
};
</script>

<style scoped>
@import "../css/adminPage.css";
</style>
../scripts/upload.js../scripts/upload.js
