const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = require("ethers/lib/utils");
const { svgToBase64 } = require("../../utils/svgToBase64");
const fs = require("fs");

const BULL_VALUE = parseUnits("3000", 8);
const BEAR_VALUE = parseUnits("1000", 8);

const svgImagePath = "./build/dynamicNFT/";
const { svgImageURIs, svgTokenURIs } = svgToBase64(svgImagePath);

network.config.chainId !== 31337
  ? describe.skip
  : describe("DynamicNFT Unit Test", function () {
      let deployer;
      let mockV3Aggregator;
      let dynamicNFT;

      beforeEach(async function () {
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["mocks", "dynamicNFT"]);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
        dynamicNFT = await ethers.getContract("DynamicNFT");
      });

      describe("constructor", function () {
        it("initializes the name correctly", async function () {
          const name = await dynamicNFT.name();
          expect(name).to.equal("Bull Bear Neutral");
        });

        it("initializes the symbol correctly", async function () {
          const symbol = await dynamicNFT.symbol();
          expect(symbol).to.equal("BBN");
        });

        it("initializes the price feed correctly", async function () {
          const priceFeed = await dynamicNFT.getPriceFeed();
          expect(priceFeed).to.equal(mockV3Aggregator.address);
        });

        it("inititalizes the image URIs correctly", async function () {
          const bullImageURI = await dynamicNFT.getImageURI(0);
          const bearImageURI = await dynamicNFT.getImageURI(1);
          const neutralImageURI = await dynamicNFT.getImageURI(2);
          expect(bullImageURI).to.equal(svgImageURIs[0]);
          expect(bearImageURI).to.equal(svgImageURIs[1]);
          expect(neutralImageURI).to.equal(svgImageURIs[2]);
        });
      });

      describe("mintNFT", async function () {
        let tokenId;
        beforeEach(async function () {
          const txResponse = await dynamicNFT.mintNFT(BULL_VALUE, BEAR_VALUE);
          const txReceipt = await txResponse.wait(1);
          tokenId = txReceipt.events[1].args.tokenId;
        });

        it("sets the token's bull & bear value correctly", async function () {
          const tokenValue = await dynamicNFT.getTokenBullBearValue(tokenId);
          expect(tokenValue.bullValue).to.equal(BULL_VALUE);
          expect(tokenValue.bearValue).to.equal(BEAR_VALUE);
        });

        it("mints a NFT to the caller address", async function () {
          const nftOwner = await dynamicNFT.ownerOf(tokenId);
          expect(nftOwner).to.equal(deployer.address);
        });

        it("increases the token counter by 1", async function () {
          const tokenIdAfterMint = await dynamicNFT.getTokenCounter();
          expect(tokenIdAfterMint).to.equal(tokenId.add(1));
        });

        it("emits 'NftMinted' event", async function () {
          await expect(dynamicNFT.mintNFT(BULL_VALUE, BEAR_VALUE))
            .to.emit(dynamicNFT, "NftMinted")
            .withArgs(tokenId.add(1), deployer.address);
        });
      });

      describe("tokenURI", function () {
        let tokenId;
        beforeEach(async function () {
          const txResponse = await dynamicNFT.mintNFT(BULL_VALUE, BEAR_VALUE);
          const txReceipt = await txResponse.wait(1);
          tokenId = txReceipt.events[1].args.tokenId;
        });

        it("returns bull token URI if the price reach bull value of the token", async function () {
          await mockV3Aggregator.updateAnswer(BULL_VALUE);
          const bullTokenURI = await dynamicNFT.tokenURI(tokenId);
          expect(bullTokenURI).to.equal(svgTokenURIs[0]);
        });

        it("returns bear token URI if the price reach bear value of the token", async function () {
          await mockV3Aggregator.updateAnswer(BEAR_VALUE);
          const bearTokenURI = await dynamicNFT.tokenURI(tokenId);
          expect(bearTokenURI).to.equal(svgTokenURIs[1]);
        });

        it("returns neutral token URI if the price is between bull & bear value of the token", async function () {
          await mockV3Aggregator.updateAnswer(
            BULL_VALUE.sub(parseUnits("100", 8))
          );
          const neutralTokenURI = await dynamicNFT.tokenURI(tokenId);
          expect(neutralTokenURI).to.equal(svgTokenURIs[2]);
        });

        it("reverts if token id does not exist", async function () {
          await expect(
            dynamicNFT.tokenURI(tokenId.add(1))
          ).to.be.revertedWithCustomError(dynamicNFT, "TokenNotExisted");
        });
      });
    });
