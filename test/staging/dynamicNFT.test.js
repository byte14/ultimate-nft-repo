const { ethers, network } = require("hardhat");
const { expect } = require("chai");

const BULL_VALUE = ethers.utils.parseUnits("3000", 8);
const BEAR_VALUE = ethers.utils.parseUnits("1000", 8);

network.config.chainId === 31337
  ? describe.skip
  : describe("DynamicNFT Staging Test", async function () {
      it("it mints NFT to caller, sets bull & bear value, increments token counter", async function () {
        const [deployer] = await ethers.getSigners();
        const dynamicNFT = await ethers.getContract("DynamicNFT");
        const tokenId = await dynamicNFT.getTokenCounter();

        await new Promise(async function (resolve, reject) {
          dynamicNFT.once("Transfer", async function () {
            console.log("Transfer event is fired!");
            try {
              const nftOwner = await dynamicNFT.ownerOf(tokenId);
              const tokenValue = await dynamicNFT.getTokenBullBearValue(
                tokenId
              );
              const tokenIdAfterMint = await dynamicNFT.getTokenCounter();

              expect(nftOwner).to.equal(deployer.address);
              expect(tokenValue.bullValue).to.equal(BULL_VALUE);
              expect(tokenValue.bearValue).to.equal(BEAR_VALUE);
              expect(tokenIdAfterMint).to.equal(tokenId.add(1));
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          console.log("Minting NFT...");
          const txResponse = await dynamicNFT.mintNFT(BULL_VALUE, BEAR_VALUE);
          await txResponse.wait(1);
        });
      });
    });
