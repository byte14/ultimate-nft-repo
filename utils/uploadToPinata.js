const pinataSDK = require("@pinata/sdk");

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function uploadImagesFolder(sourcePath) {
  let imagesBaseURI;
  try {
    const response = await pinata.pinFromFS(sourcePath);
    imagesBaseURI = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}/`;
  } catch (error) {
    console.log(error);
  }
  return imagesBaseURI;
}

async function uploadMetadataFolder(sourcePath) {
  let metadataBaseURI;
  try {
    const response = await pinata.pinFromFS(sourcePath);
    metadataBaseURI = `https://gateway.pinata.cloud/ipfs/${response.IpfsHash}/`;
  } catch (error) {
    console.log(error);
  }
  return metadataBaseURI;
}

module.exports = { uploadImagesFolder, uploadMetadataFolder };
