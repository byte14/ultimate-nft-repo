const { network, ethers } = require("hardhat");

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;
const DECIMALS = 8;
const INITIAL_ANSWER = 2000e8;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId === 31337) {
    log("Local network detected! Deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
    });

    await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log("Mocks Deployed!");
    log("______________________________________________________");
  }
};

module.exports.tags = ["all", "mocks"];
