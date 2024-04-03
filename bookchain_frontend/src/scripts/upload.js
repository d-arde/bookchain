import { File } from "nft.storage";
import { useToast } from "vue-toastification";
const toast = useToast();

// import { NFTStorage } from "nft.storage";

// const NFT_STORAGE_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyODBBQUIxZjhCZjc2NzI1ODRhODZCMEY0NjRiQTIwODNmODc5ODQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDYwOTAyMjIyMiwibmFtZSI6Im5ldyBCb29rY2hhaW4ifQ.CiNtkdzqF_0d2unBq3sZfw6X0h9oCGcMchjsnAMgI1g";

const PINATA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMmM1MjdlNy0zYzRjLTRhMDktOWVmOC1iMTQ5ZGYxZWQ5MTIiLCJlbWFpbCI6ImZhbGx0aGVmb3gxMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ0NzY3MmUwNDE0ZTkwZWE0OTFlIiwic2NvcGVkS2V5U2VjcmV0IjoiMWRmOWM2NzI1NWUxMTk4NDVmOWVhZjFhYTE5NGE1YWY5NTc2MjQwM2EzY2UzYjJiOWQzYmE1NGE0ODkyYjAzOSIsImlhdCI6MTcxMjA1NDYxN30._uVT0NylLbrsIhbD8I6UwNiyzTQU2PAiEd2_nOpBDqA";

// async function storeTextbook(imgFilePath, pdfFilePath) {
//   const imgFile = await fileFromSystem(imgFilePath);
//   const pdfFile = await fileFromSystem(pdfFilePath);
//   const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

//   const meta = nftstorage.storeDirectory([imgFile, pdfFile], "metadata.json");

//   console.log("cid: ", meta.cid);
//   return meta;
// }

async function storeTextbookPinata(imgFilePath, pdfFilePath, folderName) {
  try {
    toast.info("Uploading... Please be patient");
    const folder = folderName;
    const imgFile = await fileFromSystem(imgFilePath);
    const pdfFile = await fileFromSystem(pdfFilePath);

    const files = [imgFile, pdfFile];
    const data = new FormData();

    Array.from(files).forEach((file) => {
      data.append("file", file, `${folder}/${file.name}`);
    });

    const pinataMetadata = JSON.stringify({
      name: `${folder}`,
    });
    data.append("pinataMetadata", pinataMetadata);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_KEY}`,
      },
      body: data,
    });
    const resData = await res.json();
    toast.success(`Upload successful; IPFS CID: ${resData.IpfsHash}`);
    return resData;
  } catch (error) {
    console.log(error);
  }
}

async function fileFromSystem(filePath) {
  const content = await readFileAsync(filePath);
  const type = filePath.type;
  console.log("file: ", content, filePath.name, type);
  return new File([content], filePath.name, { type });
}

async function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(filePath);
  });
}

export { storeTextbookPinata, fileFromSystem, PINATA_KEY };

// uploading file to pinata IPFS?

// const axios = require('axios')
// const FormData = require('form-data')
// const fs = require('fs')
// const JWT = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMmM1MjdlNy0zYzRjLTRhMDktOWVmOC1iMTQ5ZGYxZWQ5MTIiLCJlbWFpbCI6ImZhbGx0aGVmb3gxMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ0NzY3MmUwNDE0ZTkwZWE0OTFlIiwic2NvcGVkS2V5U2VjcmV0IjoiMWRmOWM2NzI1NWUxMTk4NDVmOWVhZjFhYTE5NGE1YWY5NTc2MjQwM2EzY2UzYjJiOWQzYmE1NGE0ODkyYjAzOSIsImlhdCI6MTcxMjA1NDYxN30._uVT0NylLbrsIhbD8I6UwNiyzTQU2PAiEd2_nOpBDqA

// const pinFileToIPFS = async () => {
//     const formData = new FormData();
//     const src = "path/to/file.png";

// const file = fs.createReadStream(src)
//     formData.append('file', file)

//     const pinataMetadata = JSON.stringify({
//       name: 'File name',
//     });
//     formData.append('pinataMetadata', pinataMetadata);

//     const pinataOptions = JSON.stringify({
//       cidVersion: 0,
//     })
//     formData.append('pinataOptions', pinataOptions);

//     try{
//       const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
//         maxBodyLength: "Infinity",
//         headers: {
//           'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
//           'Authorization': `Bearer ${JWT}`
//         }
//       });
//       console.log(res.data);
//     } catch (error) {
//       console.log(error);
//     }
// }
// pinFileToIPFS()
