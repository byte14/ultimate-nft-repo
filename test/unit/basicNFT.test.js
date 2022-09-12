const { expect } = require("chai");
const { deployments, getNamedAccounts, ethers, network } = require("hardhat");

network.config.chainId !== 31337
  ? describe.skip
  : describe("Basic NFT Unit test", function () {
      let deployer;
      let basicNft;
      const TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        basicNft = await ethers.getContract("BasicNFT", deployer);
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
          expect(await basicNft.ownerOf(tokenId)).to.equal(deployer);
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
