const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUSDPriceFeedAddress;

  if (chainId === 31337) {
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    ethUSDPriceFeedAddress = mockV3Aggregator.address;
  } else {
    ethUSDPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const svgsPath = "./build/onChainSvgNFT/";
  let svgs = [];
  const files = fs.readdirSync(svgsPath);
  for (const svg of files) {
    const rawSvg = fs.readFileSync(svgsPath + svg, "utf-8");
    svgs.push(rawSvg);
  }

  const arguments = [ethUSDPriceFeedAddress, svgs];
  const onChainSvgNFT = await deploy("OnChainSvgNFT", {
    from: deployer,
    args: arguments,
    log: true,
  });

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(onChainSvgNFT.address, arguments);
  }
  log("______________________________________________________");
};

module.exports.tags = ["all", "onChainSvgNFT"];
