const { ethers, network } = require("hardhat");
const { expect } = require("chai");

const TOKEN_URI =
  "https://gateway.pinata.cloud/ipfs/QmQ7KnkdCefhLGkTuEfTAYWh8AXe6RhYUvv9YJjdTio1UW/01-Ingvild.jpg";

network.config.chainId === 31337
  ? describe.skip
  : describe("BasicNFT Staging Test", async function () {
      it("it mints NFT to caller, sets tokenURI, increments token counter", async function () {
        const [deployer] = await ethers.getSigners();
        const basicNFT = await ethers.getContract("BasicNFT");
        const tokenId = await basicNFT.getTokenCounter();

        await new Promise(async function (resolve, reject) {
          basicNFT.once("Transfer", async function () {
            console.log("Transfer event is fired!");
            try {
              const nftOwner = await basicNFT.ownerOf(tokenId);
              const tokenURI = await basicNFT.tokenURI(tokenId);
              const tokenIdAfterMint = await basicNFT.getTokenCounter();

              expect(nftOwner).to.equal(deployer.address);
              expect(tokenURI).to.equal(TOKEN_URI);
              expect(tokenIdAfterMint).to.equal(tokenId.add(1));
              resolve();
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
          console.log("Minting NFT...");
          const txResponse = await basicNFT.mintNFT();
          await txResponse.wait(1);
        });
      });
    });
