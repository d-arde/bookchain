<script setup>
// import { useWorkspace } from "../scripts/workspace";
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
// // const { program } = useWorkspace();
// // import { description, name } from "../metadata.json";
// import { description, name } from "../python_metadata.json";
import { storeTextbook } from "../scripts/upload.mjs";
import { NFT_STORAGE_KEY } from "../scripts/upload.mjs";
import { ref } from "vue";
const { connected } = useWallet();

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
  metadataCID: "",
});

let imgFile = null;
let pdfFile = null;

const handleImgFileChange = async (event) => {
  imgFile = event.target.files[0];
};

const handlePdfFileChange = async (event) => {
  pdfFile = event.target.files[0];
};

const uploadFile = async () => {
  if (!imgFile || !pdfFile) {
    console.log("Please select a file to upload to NFTStorage.");
    return;
  }

  try {
    console.log("Uploading...");
    const result = await storeTextbook(imgFile, pdfFile);
    console.log(`Upload successful; IPFS CID (keep this!): ${result}`);
    imgFile = null;
    pdfFile = null;
  } catch (error) {
    console.error(error);
    console.log("Upload failed, please try again.");
  }
};

const generateMetadata = async () => {
  const metadata = {
    attributes: [
      { trait_type: "Author", value: formData.value.author },
      { trait_type: "Year", value: formData.value.year },
      { trait_type: "Subject", value: formData.value.subject },
      { trait_type: "Code", value: formData.value.code },
    ],
    collection: {
      family: "Bookchain",
      name: "Bookchain",
    },
    description: formData.value.description,
    name: formData.value.name,
    properties: {
      files: [
        {
          type: "application/pdf",
          url: `ipfs://${formData.value.pdfUrl}/${formData.value.pdfName}`,
        },
        {
          type: "image/jpg",
          url: `ipfs://${formData.value.imageUrl}/${formData.value.imageName}`,
        },
      ],
    },
  };

  const metadataJSON = JSON.stringify(metadata, null, 2);
  console.log(metadataJSON);

  try {
    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NFT_STORAGE_KEY}`,
        "Content-Type": "application/json",
      },
      body: metadataJSON,
    });

    if (!response.ok) {
      throw new Error("Failed to upload metadata");
    }

    const responseData = await response.json();
    console.log("Metadata uploaded successfully:", responseData);
    console.log("Metadata CID (need this):", responseData.value);
    formData.value.metadataCID = responseData.value;
  } catch (error) {
    console.error("Error uploading metadata:", error);
  }
};

// const emit = defineEmits(["minted"]);
const mint = async () => {
  const name = "math";
  console.log(typeof name);
  const token = await mintToken(
    name,
    "bkc",
    `ipfs://bafkreieijlmkknvbl2yhacxkfgy7cux2s42uegeqtzpbpkwfpvwdy45blu`
  );
  console.log(token);
};
</script>

<template>
  <div>
    <h1>Upload Textbook and Metadata</h1>
    <body v-if="connected">
      <h2>Upload</h2>
      <p>Cover upload</p>
      <input
        type="file"
        id="fileInputImg"
        name="imgFile"
        @change="handleImgFileChange"
      />
      <br />
      <p>Textbook Upload</p>
      <input
        type="file"
        id="fileInputPdf"
        name="pdfFile"
        @change="handlePdfFileChange"
      />
      <br />
      <br />
      <button type="button" @click="uploadFile()">Upload File/Metadata</button>
      <br />
      <br />
      <form @submit.prevent="generateMetadata">
        <label for="name">Name:</label>
        <input
          type="text"
          v-model="formData.name"
          id="name"
          name="name"
        /><br />

        <label for="description">Description:</label><br />
        <textarea
          v-model="formData.description"
          id="description"
          name="description"
          rows="4"
          cols="50"
        ></textarea
        ><br />

        <label for="author">Author:</label>
        <input
          type="text"
          v-model="formData.author"
          id="author"
          name="author"
        /><br />

        <label for="year">Year:</label>
        <input
          type="text"
          v-model="formData.year"
          id="year"
          name="year"
        /><br />

        <label for="subject">Subject:</label>
        <input
          type="text"
          v-model="formData.subject"
          id="subject"
          name="subject"
        /><br />

        <label for="code">Code:</label>
        <input
          type="text"
          v-model="formData.code"
          id="code"
          name="code"
        /><br />

        <label for="pdfUrl">PDF CID:</label>
        <input
          type="text"
          v-model="formData.pdfUrl"
          id="pdfUrl"
          name="pdfUrl"
        /><br />

        <label for="imageUrl">Image CID:</label>
        <input
          type="text"
          v-model="formData.imageUrl"
          id="imageUrl"
          name="imageUrl"
        /><br />

        <label for="pdfUrl">PDF File Name:</label>
        <input
          type="text"
          v-model="formData.pdfName"
          id="pdfName"
          name="pdfName"
        /><br />

        <label for="imageUrl">Image File Name:</label>
        <input
          type="text"
          v-model="formData.imageName"
          id="imageName"
          name="imageName"
        /><br />

        <button type="submit">Generate Metadata</button>
      </form>
      <br />
      <br />
      <button @click="mint">Mint</button>
    </body>
    <p v-else>Connect your wallet to upload File</p>
  </div>
</template>
