const { ethers, network } = require("hardhat");
const { expect } = require("chai");

const BASE_URI =
  "https://gateway.pinata.cloud/ipfs/QmWWPBxCvze7SKNRHLjs4m5Ekdf2rWFTHaYHLjxdJrQqMF/";

network.config.chainId === 31337
  ? describe.skip
  : describe("RandomNFT Staging Test", async function () {
      it("it mints NFT to requestor, sets tokenURI, increments token counter", async function () {
        const [deployer] = await ethers.getSigners();
        const randomNFT = await ethers.getContract("RandomNFT");
        const mintFee = await randomNFT.getMintFee();
        const tokenId = await randomNFT.getTokenCounter();

        await new Promise(async function (resolve, reject) {
          randomNFT.once("NftMinted", async function () {
            console.log("NftMinted event is fired!");
            try {
              const nftOwner = await randomNFT.ownerOf(tokenId);
              const tokenURI = await randomNFT.tokenURI(tokenId);
              const tokenIdAfterMint = await randomNFT.getTokenCounter();

              expect(nftOwner).to.equal(deployer.address);
              expect(tokenURI).to.include(BASE_URI);
              expect(tokenIdAfterMint).to.equal(tokenId.add(1));
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          console.log("Requesting NFT...");
          const txResponse = await randomNFT.requestNFT({ value: mintFee });
          await txResponse.wait(1);
          console.log("Waiting for Chainlink VRF to get random warrior...");
        });
      });
    });
