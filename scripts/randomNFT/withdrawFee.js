const { ethers } = require("hardhat");

async function withdrawFee() {
  const randomNFT = await ethers.getContract("RandomNFT");
  const contractBalance = await randomNFT.provider.getBalance(
    randomNFT.address
  );
  const txResponse = await randomNFT.withdraw();
  await txResponse.wait(1);
  console.log(
    `${ethers.utils.formatEther(contractBalance)} ETH has been withdrawn`
  );
}

withdrawFee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
