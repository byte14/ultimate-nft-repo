const { deployments, ethers, network } = require("hardhat");
const { expect } = require("chai");

network.config.chainId !== 31337
  ? describe.skip
  : describe("BasicNFT Unit Test", function () {
      let deployer;
      let basicNFT;
      const TOKEN_URI =
        "https://gateway.pinata.cloud/ipfs/QmQ7KnkdCefhLGkTuEfTAYWh8AXe6RhYUvv9YJjdTio1UW/01-Ingvild.jpg";

      beforeEach(async function () {
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["basicNFT"]);
        basicNFT = await ethers.getContract("BasicNFT");
      });

      describe("constructor", function () {
        it("initializes the name correctly", async function () {
          expect(await basicNFT.name()).to.equal("Warrior Club");
        });

        it("initializes the symbol correctly", async function () {
          expect(await basicNFT.symbol()).to.equal("WRC");
        });
      });

      describe("mintNFT", function () {
        it("mints a nft to the caller address", async function () {
          const txResponse = await basicNFT.mintNFT();
          const txReceipt = await txResponse.wait(1);
          const tokenId = txReceipt.events[0].args.tokenId;
          expect(await basicNFT.ownerOf(tokenId)).to.equal(deployer.address);
        });

        it("increases the token counter by 1", async function () {
          const tokenIdBeforeMint = await basicNFT.getTokenCounter();
          await basicNFT.mintNFT();
          const tokenIdAfterMint = await basicNFT.getTokenCounter();
          expect(tokenIdAfterMint).to.equal(tokenIdBeforeMint + 1);
        });
      });

      describe("tokenURI", function () {
        it("reverts if tokenId does not exists", async function () {
          await expect(basicNFT.tokenURI(0)).to.be.revertedWithCustomError(
            basicNFT,
            "TokenNotExisted"
          );
        });

        it("returns token URI for the existed token Id", async function () {
          const txResponse = await basicNFT.mintNFT();
          const txReceipt = await txResponse.wait(1);
          const tokenId = txReceipt.events[0].args.tokenId;
          expect(await basicNFT.tokenURI(tokenId)).to.equal(TOKEN_URI);
        });
      });
    });
