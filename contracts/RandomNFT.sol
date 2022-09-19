// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

pragma solidity ^0.8.12;

error NotEnoughETH(uint256 sent, uint256 required);
error WithdrawFailed();

contract RandomNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private s_tokenCounter;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_mintFee;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    string private constant BASE_EXTENSION = ".json";
    string private s_baseURI;

    mapping(uint256 => address) private nftRequester;

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(uint256 tokenId, address minter);

    constructor(
        address vrfCoordinator,
        uint256 mintFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string memory baseURI
    ) ERC721("Warrior Club", "WRC") VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_mintFee = mintFee;
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_baseURI = baseURI;
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
        string memory warrior = _getWarrior(randomWords);
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, warrior);
        s_tokenCounter.increment();
        emit NftMinted(newTokenId, nftOwner);
    }

    function _getWarrior(uint256[] memory randomWords)
        public
        pure
        returns (string memory warrior)
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
                warrior = string.concat(i.toString(), BASE_EXTENSION);
                break;
            }
            warriorRarityRange -= warriorRarityWeight[i];
        }
        return warrior;
    }

    function _baseURI() internal view override returns (string memory) {
        return s_baseURI;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function getMintFee() external view returns (uint256) {
        return i_mintFee;
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }
}
