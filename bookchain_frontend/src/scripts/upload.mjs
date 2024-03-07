import { NFTStorage, File } from "nft.storage";

const NFT_STORAGE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyODBBQUIxZjhCZjc2NzI1ODRhODZCMEY0NjRiQTIwODNmODc5ODQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwOTQ3MzczMDAyNiwibmFtZSI6ImJvb2tjaGFpbiJ9.YBBOm8C-xfOBE5qZ1l7u332cxMfznJLu2DVODGpQSiM";

async function storeTextbook(imgFilePath, pdfFilePath) {
  const imgFile = await fileFromSystem(imgFilePath);
  const pdfFile = await fileFromSystem(pdfFilePath);
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  //   const meta = nftstorage.storeDirectory({
  //     name: pdfFilePath.name,
  //     description: description,
  //     image: imgFile,
  //     properties: {
  //       file: pdfFile,
  //     },
  //   });

  const meta = nftstorage.storeDirectory([imgFile, pdfFile], "metadata.json");

  //   console.log("IPFS URL for the metadata:", meta.name);
  //   console.log("metadata.json contents:\n", meta.properties);
  console.log("cid: ", meta.cid);
  return meta;
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

// Advanced Modern Engineering Mathematics
// A textbook minted by Bookchain!
