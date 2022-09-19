const { expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");

network.config.chainId !== 31337
  ? describe.skip
  : describe("Basic NFT Unit test", function () {
      let deployer;
      let basicNft;
      const TOKEN_URI =
        "https://gateway.pinata.cloud/ipfs/QmNcNgWVHbdvNcL4bB2weJytmtEb2A6NtB1mmFMZVTKZTd/0.json";

      beforeEach(async function () {
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["basicNFT"]);
        basicNft = await ethers.getContract("BasicNFT");
      });

      describe("constructor", function () {
        it("initializes the basicNft correctly", async function () {
          expect(await basicNft.name()).to.equal("Warrior Club");
          expect(await basicNft.symbol()).to.equal("WRC");
        });
      });

      describe("mintNft", function () {
        it("mints an nft to the caller address", async function () {
          const mintNftTxResponse = await basicNft.mintNft();
          const mintNftTxReceipt = await mintNftTxResponse.wait(1);
          const tokenId = mintNftTxReceipt.events[0].args.tokenId;
          expect(await basicNft.ownerOf(tokenId)).to.equal(deployer.address);
        });

        it("increases the token counter by 1", async function () {
          const tokenIdBeforeMint = await basicNft.getTokenCounter();
          await basicNft.mintNft();
          const tokenIdAfterMint = await basicNft.getTokenCounter();
          expect(tokenIdAfterMint).to.equal(tokenIdBeforeMint + 1);
        });
      });

      describe("tokenURI", function () {
        it("reverts if tokenId does not exists", async function () {
          await expect(basicNft.tokenURI(0)).to.be.revertedWithCustomError(
            basicNft,
            "TokenNotExisted"
          );
        });

        it("returns token URI for the existed token Id", async function () {
          const mintNftTxResponse = await basicNft.mintNft();
          const mintNftTxReceipt = await mintNftTxResponse.wait(1);
          const tokenId = mintNftTxReceipt.events[0].args.tokenId;
          expect(await basicNft.tokenURI(tokenId)).to.equal(TOKEN_URI);
        });
      });
    });
