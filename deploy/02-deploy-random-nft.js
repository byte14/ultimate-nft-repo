const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { generateMetadata } = require("../utils/generateMetadata");
const {
  uploadImagesFolder,
  uploadMetadataFolder,
} = require("../utils/uploadToPinata");

const FUND_AMOUNT = ethers.utils.parseEther("2");
const imagesPath = "./build/images";
const metadataPath = "./build/metadata";
let baseURI;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address;
  let subscriptionId;

  if (process.env.UPLOAD_TO_PINATA === "true") {
    console.log("Uploading images folder to IPFS...");
    baseURI = await uploadImagesFolder(imagesPath);
    console.log("Generating metadata for the images...");
    generateMetadata(baseURI, imagesPath, metadataPath);
    console.log("Uploading metadata folder to IPFS...");
    await uploadMetadataFolder(metadataPath);
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
    baseURI,
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
