const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { generateMetadata } = require("../utils/generateMetadata");
const {
  uploadImagesFolder,
  uploadMetadataFolder,
} = require("../utils/uploadToPinata");

const FUND_AMOUNT = ethers.utils.parseEther("2");
const imagesFolderPath = "./build/randomNFT/images";
const metadataFolderPath = "./build/randomNFT/metadata";
let metadataBaseURI =
  "https://gateway.pinata.cloud/ipfs/QmWWPBxCvze7SKNRHLjs4m5Ekdf2rWFTHaYHLjxdJrQqMF/";

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Mock;
  let vrfCoordinatorV2Address;
  let subscriptionId;

  /**
   * 'metadataBaseURI' can be hardcoded and
   * 'UPLOAD_TO_PINATA' can be set to false in '.env',
   * after running this deploy script once.
   */
  if (process.env.UPLOAD_TO_PINATA === "true") {
    log("Uploading images folder to IPFS...");
    const imagesBaseURI = await uploadImagesFolder(imagesFolderPath);
    log("Generating metadata for the images...");
    generateMetadata(imagesBaseURI, imagesFolderPath, metadataFolderPath);
    log("Uploading metadata folder to IPFS...");
    metadataBaseURI = await uploadMetadataFolder(metadataFolderPath);
    log(`metadataBaseURI: ${metadataBaseURI}`);
    log("______________________________________________________");
  }

  if (chainId === 31337) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const txResponse = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await txResponse.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const mintFee = networkConfig[chainId].mintFee;
  const keyHash = networkConfig[chainId].keyHash;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;

  const arguments = [
    vrfCoordinatorV2Address,
    mintFee,
    keyHash,
    subscriptionId,
    callbackGasLimit,
    metadataBaseURI,
  ];

  const randomNFT = await deploy("RandomNFT", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  if (chainId === 31337) {
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomNFT.address);
  }

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(randomNFT.address, arguments);
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "randomNFT"];
