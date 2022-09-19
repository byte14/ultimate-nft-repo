const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { generateMetadata } = require("../utils/generateMetadata");
const {
  uploadImagesFolder,
  uploadMetadataFolder,
} = require("../utils/uploadToPinata");

const FUND_AMOUNT = ethers.utils.parseEther("2");
const imagesFolderPath = "./build/images";
const metadataFolderPath = "./build/metadata";
let metadataBaseURI =
  "https://gateway.pinata.cloud/ipfs/QmNcNgWVHbdvNcL4bB2weJytmtEb2A6NtB1mmFMZVTKZTd/";

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address;
  let subscriptionId;

  /**
   * @dev 'metadataBaseURI' can be hardcoded and
   * 'UPLOAD_TO_PINATA' can be set to false in '.env',
   * after running this deploy script once.
   */
  if (process.env.UPLOAD_TO_PINATA === "true") {
    console.log("Uploading images folder to IPFS...");
    const imagesBaseURI = await uploadImagesFolder(imagesFolderPath);
    console.log("Generating metadata for the images...");
    generateMetadata(imagesBaseURI, imagesFolderPath, metadataFolderPath);
    console.log("Uploading metadata folder to IPFS...");
    metadataBaseURI = await uploadMetadataFolder(metadataFolderPath);
    console.log(metadataBaseURI);
  }

  if (chainId === 31337) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
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

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(randomNFT.address, arguments);
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "randomNFT"];
