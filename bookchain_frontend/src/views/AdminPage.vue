<script setup>
import { useWallet } from "solana-wallets-vue";
import { mintToken } from "../scripts/mintToken.js";
import { storeTextbook } from "../scripts/upload.mjs";
import { NFT_STORAGE_KEY } from "../scripts/upload.mjs";
import { addToMetadata } from "../scripts/upload.mjs";
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
});

let imgFile = null;
let pdfFile = null;
let bookName = "";
let metadataCID = "";

const handleImgFileChange = async (event) => {
  imgFile = event.target.files[0];
};

const handleMetadataCIDChange = async (event) => {
  metadataCID = event.target.value;
  console.log(metadataCID);
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
    image: `https://nftstorage.link/ipfs/${formData.value.imageUrl}/${formData.value.imageName}`,
    properties: {
      files: [
        {
          type: "application/pdf",
          url: `https://nftstorage.link/ipfs/${formData.value.pdfUrl}/${formData.value.pdfName}`,
        },
        {
          type: "image/jpg",
          url: `https://nftstorage.link/ipfs/${formData.value.imageUrl}/${formData.value.imageName}`,
        },
      ],
    },
  };

  const metadataJSON = JSON.stringify(metadata, null, 2);

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
  } catch (error) {
    console.error("Error uploading metadata:", error);
  }
};

const mint = async () => {
  bookName = formData.value.name;
  console.log("bookName", bookName);
  await addToMetadata(bookName, metadataCID);
  console.log("bookName and CID", bookName, metadataCID);
  console.log(`https://${metadataCID}.ipfs.nftstorage.link`);
  const token = await mintToken(
    bookName,
    "bkc",
    `https://${metadataCID}.ipfs.nftstorage.link`
  );
  metadataCID = "";
  console.log(token);
};
</script>

<template>
  <div class="font">
    <h1 class="header">Upload Textbook and Metadata</h1>
    <div class="intro">
      <h2>Instructions for uploading a textbook</h2>
      <p>
        Firstly, make sure you have access to the admin wallet. The admin wallet
        has this address:
        <strong style="font-size: 18px"
          >DycYs87NKZtrnML9raEVW5pk3Aac6D3eQYQUu52TvPRK</strong
        >. <br />
        Now, the following is how you use the forms below to mint the textbook!
      </p>
      <ul>
        <li>
          The 'Upload Files' section is to upload the front cover of the
          textbook, and the PDF file of the textbook itself.
          <br />
          You will get back a CID. It is a long string of text, keep it - as you
          will need it to generate the Metadata for the tokenised textbook.
        </li>
        <li>
          The 'Upload Metadata' is where all the important traits of the token
          are inputted. The most important of these are the last four. <br />If
          these are incorrect, the process will have to be restarted. So make
          sure that the CID and file names you input are the correct one! <br />
          This will net you another CID, that again, you will need for the next
          part, to mint the book finally.
        </li>
        <li>
          To mint the book token, input the metadata CID, as this will have all
          the information that the contract will need to mint and display the
          token for the users.
          <br />And that's all!
        </li>
      </ul>
    </div>
    <body v-if="connected">
      <div class="grid-container">
        <br />
        <div class="column">
          <h2>Upload Files</h2>
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
          <button type="button" @click="uploadFile()">Upload Files</button>
        </div>

        <br />
        <br />

        <div class="column">
          <h2>Upload Metadata</h2>
          <form @submit.prevent="generateMetadata">
            <label for="name">Name: </label>
            <input
              type="text"
              v-model="formData.name"
              id="name"
              name="name"
              class="upload-metadata"
            /><br />

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

            <label for="author">Author:</label>
            <input
              type="text"
              v-model="formData.author"
              id="author"
              name="author"
              class="upload-metadata"
            /><br />

            <label for="year">Year:</label>
            <input
              type="text"
              v-model="formData.year"
              id="year"
              name="year"
              class="upload-metadata"
            /><br />

            <label for="subject">Subject:</label>
            <input
              type="text"
              v-model="formData.subject"
              id="subject"
              name="subject"
              class="upload-metadata"
            /><br />

            <label for="code">Code:</label>
            <input
              type="text"
              v-model="formData.code"
              id="code"
              name="code"
              class="upload-metadata"
            /><br />

            <label for="pdfUrl">PDF CID:</label>
            <input
              type="text"
              v-model="formData.pdfUrl"
              id="pdfUrl"
              name="pdfUrl"
              class="upload-metadata"
            /><br />

            <label for="imageUrl">Image CID:</label>
            <input
              type="text"
              v-model="formData.imageUrl"
              id="imageUrl"
              name="imageUrl"
              class="upload-metadata"
            /><br />

            <label for="pdfName">PDF File Name:</label>
            <input
              type="text"
              v-model="formData.pdfName"
              id="pdfName"
              name="pdfName"
              class="upload-metadata"
            /><br />

            <label for="imageName">Image File Name:</label>
            <input
              type="text"
              v-model="formData.imageName"
              id="imageName"
              name="imageName"
              class="upload-metadata"
            /><br />
            <br />

            <button type="submit">Generate & Upload Metadata</button>
          </form>
        </div>

        <div class="column">
          <br />
          <h2>Mint Token (use Metadata CID)</h2>

          <input
            type="text"
            id="CID"
            v-model="metadataCID"
            name="metadataCID"
            @change="handleMetadataCIDChange"
            cols="30"
            rows="1"
          />
          <br />
          <br />
          <button @click="mint">Mint</button>
          <br />
        </div>
      </div>
      <div>
        <br />
        <br />
        <br />
      </div>
    </body>
    <p v-else class="wallet-message">Connect your wallet to upload File</p>
  </div>
</template>

<style scoped>
@import "../css/adminPage.css";
</style>
