const { ethers } = require("hardhat");

const BULL_VALUE = ethers.utils.parseUnits("3000", 8);
const BEAR_VALUE = ethers.utils.parseUnits("1000", 8);

async function mintDynamicNFT() {
  const dynamicNFT = await ethers.getContract("DynamicNFT");
  const txResponse = await dynamicNFT.mintNFT(BULL_VALUE, BEAR_VALUE);
  const txReceipt = await txResponse.wait(1);
  const tokenId = txReceipt.events[0].args.tokenId;
  const tokenURI = await dynamicNFT.tokenURI(tokenId);
  console.log(`A Dynamic NFT is minted with tokenURI: ${tokenURI}`);
}

mintDynamicNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
