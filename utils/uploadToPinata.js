const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesPath) {
  const absolutePath = path.resolve(imagesPath);
  const files = fs.readdirSync(absolutePath);
  let imageResponses = [];

  for (const value of files) {
    const readableStreamForFile = fs.createReadStream(
      `${absolutePath}/${value}`
    );
    console.log(`Uploading ${value} to IPFS...`);
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      imageResponses.push(response);
    } catch (error) {
      console.log(error);
    }
  }
  return { imageResponses, files };
}

async function storeMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storeImages, storeMetadata };
