<template>
  <div class="form-container font">
    <div
      v-for="(step, index) in steps"
      :key="index"
      :class="{ 'form-slide': true, active: currentStep === index }"
    >
      <div v-if="index === 0" class="form-group">
        <h2>Upload Files</h2>
        <label class="form-label" for="name">Cover Upload:</label>
        <input
          class="form-input"
          type="file"
          id="fileInputImg"
          name="imgFile"
          @change="handleImgFileChange"
        />
      </div>
      <div v-if="index === 0" class="form-group">
        <label class="form-label" for="email">Textbook Upload:</label>
        <input
          type="file"
          id="fileInputPdf"
          name="pdfFile"
          @change="handlePdfFileChange"
        />
      </div>
      <div v-if="index === 1" class="form-group">
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
            readonly
          /><br />

          <label for="imageUrl">Image CID:</label>
          <input
            type="text"
            v-model="formData.imageUrl"
            id="imageUrl"
            name="imageUrl"
            class="upload-metadata"
            readonly
          /><br />

          <label for="pdfName">PDF File Name:</label>
          <input
            type="text"
            v-model="formData.pdfName"
            id="pdfName"
            name="pdfName"
            class="upload-metadata"
            readonly
          /><br />

          <label for="imageName">Image File Name:</label>
          <input
            type="text"
            v-model="formData.imageName"
            id="imageName"
            name="imageName"
            class="upload-metadata"
            readonly
          /><br />
          <br />
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
      <br />
      <button @click="mintTest">Mint</button>
    </div>
  </div>
</template>

<script setup>
import { mintToken } from "../scripts/mintToken.js";
import { NFT_STORAGE_KEY } from "../scripts/upload.mjs";
import { storeTextbook } from "../scripts/upload.mjs";
import { ref } from "vue";
import { useToast } from "vue-toastification";
const toast = useToast();

// toast()
// toast.info() toast.success() toast.error()

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
});

let imgFile = null;
let pdfFile = null;
let bookName = "";

const handleImgFileChange = async (event) => {
  imgFile = event.target.files[0];
};

// const handleMetadataCIDChange = async (event) => {
//   metadataCID = event.target.value;
//   console.log(metadataCID);
// };

const handlePdfFileChange = async (event) => {
  pdfFile = event.target.files[0];
};

const uploadFile = async () => {
  if (!imgFile || !pdfFile) {
    toast.warning("Please select a file to upload to NFTStorage.");
    return;
  }

  try {
    toast.info("Uploading... Please be patient");
    const result = await storeTextbook(imgFile, pdfFile);
    toast.success(`Upload successful; IPFS CID: ${result}`);
    formData.value.imageName = imgFile.name;
    formData.value.pdfName = pdfFile.name;
    formData.value.pdfUrl = result;
    formData.value.imageUrl = result;
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
    toast.success("Metadata uploaded successfully");
    toast.success("Metadata CID:", responseData.value.cid);
    console.log("Metadata uploaded successfully:", responseData);
    console.log("Metadata CID (need this):", responseData.value);
    return responseData.value.cid;
  } catch (error) {
    toast.error("Error uploading metadata");
    console.error("Error uploading metadata:", error);
  }
};

const mint = async (metadataCID) => {
  bookName = formData.value.name;
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

const mintTest = async (metadataCID) => {
  bookName = formData.value.name;
  console.log("bookName and CID", bookName, metadataCID);
  // console.log(`https://${metadataCID}.ipfs.nftstorage.link`);
  const token = await mintToken(
    "Thermodynamics",
    "bkc",
    `https://bafkreiaw3hg7rqkkreuuosrqq7bhrxkzwzginjytsl7e2as4msb4qwznha.ipfs.nftstorage.link`
  );
  metadataCID = "";
  console.log(token);
};

const steps = ref([{ label: "Step 1" }, { label: "Step 2" }]);

const nextStep = async () => {
  // make sure the code below is undedited to make the toast work
  //
  // let fileReturn = await uploadFile();
  // if (fileReturn == null) {
  //   return;
  // }
  console.log(await uploadFile());
  currentStep.value++;
};

const submitForm = async () => {
  // add a check to make sure that all of the fields are populating. Otherwise, it will upload an empty metadata file
  const metadataGen = await generateMetadata();
  console.log("MEATADATA GEN:", metadataGen);
  console.log("AWAINT MINT FUNCTION: ", await mint(metadataGen));
};
</script>

<style scoped>
.form-container {
  width: 400px;
  margin: 0 auto;
}

.form-slide {
  display: none;
}

.form-slide.active {
  display: block;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-button:hover {
  background-color: #0056b3;
}
</style>

//Thermodynamics. A textbook minted by Bookchain!
