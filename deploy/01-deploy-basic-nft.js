const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const arguments = [];
  const basicNft = await deploy("BasicNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(basicNft.address, arguments);
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "basicNft"];
