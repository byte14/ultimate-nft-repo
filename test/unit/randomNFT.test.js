const { expect } = require("chai");
const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const chainId = network.config.chainId;

chainId !== 31337
  ? describe.skip
  : describe("Random NFT Unit test", function () {
      let deployer;
      let randomNFT;
      const mintFee = networkConfig[chainId].mintFee;

      beforeEach(async function () {
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["mocks", "randomNFT"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        randomNFT = await ethers.getContract("RandomNFT");
      });

      describe("constructor", function () {
        it("initializes the mint fee correctly", async function () {
          expect(await randomNFT.getMintFee()).to.equal(mintFee);
        });

        it("initializes the token URIs correctly", async function () {
          expect(await randomNFT.getTokenURI(0)).to.include("ipfs://");
        });
      });

      describe("requestNft", function () {
        it("reverts if mint fee is not enough", async function () {
          const sentFee = mintFee.sub(ethers.utils.parseEther("0.001"));
          await expect(
            randomNFT.requestNft({
              value: sentFee,
            })
          )
            .to.be.revertedWithCustomError(randomNFT, "NotEnoughETH")
            .withArgs(sentFee, mintFee);
        });

        it("emits 'NftRequested' event", async function () {
          const txResponse = await randomNFT.requestNft({ value: mintFee });
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;
          await expect(txResponse)
            .to.emit(randomNFT, "NftRequested")
            .withArgs(requestId, deployer.address);
        });
      });

      describe("fulfillRandomWords", function () {
        let requestId;
        beforeEach(async function () {
          const txResponse = await randomNFT.requestNft({
            value: mintFee,
          });
          const txReceipt = await txResponse.wait(1);
          requestId = txReceipt.events[1].args.requestId;
        });

        it("mints a NFT to the requestor address", async function () {
          const tokenId = await randomNFT.getTokenCounter();
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestId,
            randomNFT.address
          );
          expect(await randomNFT.ownerOf(tokenId)).to.equal(deployer.address);
        });

        it("sets the token URI for the minted NFT", async function () {
          const tokenId = await randomNFT.getTokenCounter();
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestId,
            randomNFT.address
          );
          const tokenURI = await randomNFT.tokenURI(tokenId);
          expect(tokenURI).to.include("ipfs://");
        });

        it("increases the token counter by 1", async function () {
          const tokenIdBeforeMint = await randomNFT.getTokenCounter();
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestId,
            randomNFT.address
          );
          const tokenIdAfterMint = await randomNFT.getTokenCounter();
          expect(tokenIdAfterMint).to.equal(tokenIdBeforeMint.add(1));
        });

        it("emits 'NftMinted' event", async function () {
          await expect(
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              requestId,
              randomNFT.address
            )
          )
            .to.emit(randomNFT, "NftMinted")
            .withArgs(anyValue, deployer.address);
        });
      });

      describe("withdraw", function () {
        it("withdraws collected fee to the deployer address", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 5; i++) {
            await randomNFT.connect(accounts[i]).requestNft({ value: mintFee });
          }
          const randomNFTStartingBalance = await randomNFT.provider.getBalance(
            randomNFT.address
          );
          const deployerStartingBalance = await randomNFT.provider.getBalance(
            deployer.address
          );

          const txResponse = await randomNFT.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const randomNFTEndingBalance = await randomNFT.provider.getBalance(
            randomNFT.address
          );
          const deployerEndingBalance = await randomNFT.provider.getBalance(
            deployer.address
          );
          expect(randomNFTEndingBalance).to.equal(0);
          expect(deployerEndingBalance).to.equal(
            deployerStartingBalance.add(randomNFTStartingBalance).sub(gasCost)
          );
        });

        it("reverts if withdrawer is not the deployer", async function () {
          const accounts = await ethers.getSigners();
          await expect(
            randomNFT.connect(accounts[1]).withdraw()
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });