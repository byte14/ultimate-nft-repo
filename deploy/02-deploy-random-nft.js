const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeMetadata } = require("../utils/uploadToPinata");

const FUND_AMOUNT = ethers.utils.parseEther("2");
const imagesLocation = "images/randomNFT";
let tokenURIs = [
  "ipfs://Qmb8PvWReEe8a5ViHQgNnB7ojCrn8yxxPWLkGdYc2spvg1",
  "ipfs://QmenjrBys2xVVbCwKrkFdQKwgUzJo7frynmwEwbqXXDCHQ",
  "ipfs://QmRoFCAE9VQGZejwY8VkHah6pJ3DVvRhZZAKbBWcBusjRx",
];

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Powerful",
      value: 100,
    },
  ],
};

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address;
  let subscriptionId;

  if (process.env.UPLOAD_TO_PINATA === "true") {
    tokenURIs = await handleTokenURIs();
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
    tokenURIs,
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

  async function handleTokenURIs() {
    tokenURIs = [];
    const { imageResponses, files } = await storeImages(imagesLocation);
    for (const index in imageResponses) {
      let metadata = { ...metadataTemplate };
      metadata.name = files[index].replace(".png", "");
      metadata.description = `A fierce warrior: ${metadata.name}`;
      metadata.image = `ipfs://${imageResponses[index].IpfsHash}`;

      console.log(`Uploading metadata of ${metadata.name}`);
      const metadataResponse = await storeMetadata(metadata);
      tokenURIs.push(`ipfs://${metadataResponse.IpfsHash}`);
    }
    console.log(`Token URIs stored! They are:`);
    console.log(tokenURIs);
    return tokenURIs;
  }
};

module.exports.tags = ["all", "randomNFT"];
