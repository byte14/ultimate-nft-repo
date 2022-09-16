// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

pragma solidity ^0.8.8;

error NotEnoughETH(uint256 sent, uint256 required);
error WithdrawFailed();

contract RandomNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private s_tokenCounter;
    enum Warrior {
        PRITHVI_NARAYAN_SHAH,
        BALBHADRA_KUNWAR,
        AMAR_SING_THAPA
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_mintFee;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    string[3] private s_tokenURIs;

    mapping(uint256 => address) private nftRequester;

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Warrior warrior, address minter);

    constructor(
        address vrfCoordinator,
        uint256 mintFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[3] memory tokenURIs
    ) ERC721("Warrior Club", "WRC") VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_mintFee = mintFee;
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_tokenURIs = tokenURIs;
    }

    function requestNft() external payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert NotEnoughETH(msg.value, i_mintFee);
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        nftRequester[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address nftOwner = nftRequester[requestId];
        uint256 newTokenId = s_tokenCounter.current();

        Warrior warrior = _getWarrior(randomWords);
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_tokenURIs[uint256(warrior)]);
        s_tokenCounter.increment();
        emit NftMinted(warrior, nftOwner);
    }

    function _getWarrior(uint256[] memory randomWords)
        private
        pure
        returns (Warrior warrior)
    {
        uint8[3] memory warriorRarityWeight = [15, 35, 50];
        uint256 sumOfRarityWeight = 100; // 15 + 35 + 55
        uint256 warriorRarityRange = randomWords[0] % sumOfRarityWeight;

        for (uint256 i = 0; i < warriorRarityWeight.length; i++) {
            if (warriorRarityRange < warriorRarityWeight[i]) {
                /**
                 * if warriorRarityRange:
                 * (0 - 14) get Prithvi Narayn Shah (15%),
                 * (15 - 49) get Balbhadra Kunwar (35%),
                 * (50 - 99) get Amar Singh Thapa (50%)
                 */
                warrior = Warrior(i);
                break;
            }
            warriorRarityRange -= warriorRarityWeight[i];
        }
        return warrior;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function getMintFee() external view returns (uint256) {
        return i_mintFee;
    }

    function getTokenURI(Warrior warrior)
        external
        view
        returns (string memory)
    {
        return s_tokenURIs[uint256(warrior)];
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }
}
