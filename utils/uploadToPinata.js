const pinataSDK = require("@pinata/sdk");

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function uploadImagesFolder(sourcePath) {
  let baseURI;
  try {
    const response = await pinata.pinFromFS(sourcePath);
    baseURI = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`;
  } catch (error) {
    console.log(error);
  }
  return baseURI;
}

async function uploadMetadataFolder(sourcePath) {
  try {
    const response = await pinata.pinFromFS(sourcePath);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { uploadImagesFolder, uploadMetadataFolder };
