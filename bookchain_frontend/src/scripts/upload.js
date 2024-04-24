import { File } from "nft.storage";
import { useToast } from "vue-toastification";
const toast = useToast();

const PINATA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMmM1MjdlNy0zYzRjLTRhMDktOWVmOC1iMTQ5ZGYxZWQ5MTIiLCJlbWFpbCI6ImZhbGx0aGVmb3gxMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ0NzY3MmUwNDE0ZTkwZWE0OTFlIiwic2NvcGVkS2V5U2VjcmV0IjoiMWRmOWM2NzI1NWUxMTk4NDVmOWVhZjFhYTE5NGE1YWY5NTc2MjQwM2EzY2UzYjJiOWQzYmE1NGE0ODkyYjAzOSIsImlhdCI6MTcxMjA1NDYxN30._uVT0NylLbrsIhbD8I6UwNiyzTQU2PAiEd2_nOpBDqA";

const ACCESS_TOKEN =
  "?pinataGatewayToken=Fqwvj59OYNoSELkLYM3U04to5YzM2R9ySsPk63nRpwHT0W6mFhSTljYXgFfXa-3h";

async function storeTextbookPinata(imgFilePath, pdfFilePath, folderName) {
  try {
    toast.info("Uploading... Please be patient");
    // folder is needed for directory name on Pinatat
    const folder = folderName;
    // assigns these variables to the files the user uploads
    const imgFile = await fileFromSystem(imgFilePath);
    const pdfFile = await fileFromSystem(pdfFilePath);

    // these are then put in a formData object
    // (needed by the API)
    const files = [imgFile, pdfFile];
    const data = new FormData();

    // for each file in 'files', it is added to the formData object
    // alongside the 'folder/filename' as the name
    Array.from(files).forEach((file) => {
      data.append("file", file, `${folder}/${file.name}`);
    });

    // this is needed to specify it is a directory
    const pinataMetadata = JSON.stringify({
      name: `${folder}`,
    });
    // appended to the formData Object
    data.append("pinataMetadata", pinataMetadata);

    // api call to pinata
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

// takes the file uploaded by the user and transforms it into a 'File' type
async function fileFromSystem(filePath) {
  const content = await readFileAsync(filePath);
  const type = filePath.type;
  console.log("file: ", content, filePath.name, type);
  return new File([content], filePath.name, { type });
}

// reads file uploaded by user
async function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(filePath);
  });
}

export { storeTextbookPinata, fileFromSystem, PINATA_KEY, ACCESS_TOKEN };
