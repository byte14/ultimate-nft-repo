const { ethers } = require("hardhat");

async function mintBasicNFT() {
  const basicNFT = await ethers.getContract("BasicNFT");
  const txResponse = await basicNFT.mintNFT();
  const txReceipt = await txResponse.wait(1);
  const tokenId = txReceipt.events[0].args.tokenId;
  const tokenURI = await basicNFT.tokenURI(tokenId);
  console.log(`A Basic NFT is minted with tokenURI: ${tokenURI}`);
}

mintBasicNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
