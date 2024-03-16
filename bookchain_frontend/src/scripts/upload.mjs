import { NFTStorage, File } from "nft.storage";

const NFT_STORAGE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyODBBQUIxZjhCZjc2NzI1ODRhODZCMEY0NjRiQTIwODNmODc5ODQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDYwOTAyMjIyMiwibmFtZSI6Im5ldyBCb29rY2hhaW4ifQ.CiNtkdzqF_0d2unBq3sZfw6X0h9oCGcMchjsnAMgI1g";

async function storeTextbook(imgFilePath, pdfFilePath) {
  const imgFile = await fileFromSystem(imgFilePath);
  const pdfFile = await fileFromSystem(pdfFilePath);
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  const meta = nftstorage.storeDirectory([imgFile, pdfFile], "metadata.json");

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

export { storeTextbook, fileFromSystem, NFT_STORAGE_KEY };
