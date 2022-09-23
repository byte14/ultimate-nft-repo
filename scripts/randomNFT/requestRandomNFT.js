const { ethers, network } = require("hardhat");

const chainId = network.config.chainId;

async function requestRandomNFT() {
  const randomNFT = await ethers.getContract("RandomNFT");
  const mintFee = await randomNFT.getMintFee();
  const tokenId = await randomNFT.getTokenCounter();
  const txResponse = await randomNFT.requestNFT({ value: mintFee });
  const txReceipt = await txResponse.wait(1);
  console.log(txReceipt);
  if (chainId === 31337) {
    const requestId = txReceipt.events[1].args.requestId;
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNFT.address);
  }
  const tokenURI = await randomNFT.tokenURI(tokenId);
  console.log(`A Random NFT is minted with tokenURI: ${tokenURI}`);
}

requestRandomNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
