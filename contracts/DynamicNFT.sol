// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @dev TokenId not minted yet.
 */
error TokenNotExisted();

/**
 * @title A Dynamic NFT Contract
 * @author Avishek Raj Panta
 * @dev Implementation of dynamic ERC721 fully on chain.
 */
contract DynamicNFT is ERC721 {
    using Counters for Counters.Counter;

    /** Type Declaration **/
    struct TokenValue {
        int256 bullValue;
        int256 bearValue;
    }

    /** State Variables **/
    AggregatorV3Interface private immutable i_priceFeed;
    Counters.Counter private s_tokenCounter;
    string[] private s_imagesURIs;

    /** Mapping from token Id to token's bull & bear value **/
    mapping(uint256 => TokenValue) private s_tokenValues;

    /**
     * @dev Initializes token name, symbol and i_priceFeed.
     * @dev Converts svg to URI and stores it in s_imagesURIs.
     */
    constructor(address priceFeedAddress, string[3] memory svgs)
        ERC721("Bull Bear Neutral", "BBN")
    {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        svgToImageURI(svgs);
    }

    /**
     * @dev Sets bull & bear value for the tokenId.
     * @dev Mints NFT to caller address.
     * Wdev Increments token counter.
     * @param bullValue int256 Bull price of the token.
     * @param bearValue int256 Bear price of the token.
     */
    function mintNFT(int256 bullValue, int256 bearValue) external {
        uint256 newTokenId = s_tokenCounter.current();
        s_tokenValues[newTokenId] = TokenValue(bullValue, bearValue);
        _safeMint(msg.sender, newTokenId);
        s_tokenCounter.increment();
    }

    /**
     * @dev Returns the current tokenId
     */
    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }

    /**
     * @dev Returns ETH/USD price feed address.
     */
    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    /**
     * @dev Returns URI for the image.
     * @param index the index of s_imageURIs for getting image URI.
     */
    function getImageURI(uint256 index) external view returns (string memory) {
        return s_imagesURIs[index];
    }

    /**
     * @dev Returns bull & bear value of the tokenId.
     * @param tokenId the tokenId whose value to be fetched.
     */
    function getTokenBullBearValue(uint256 tokenId)
        external
        view
        returns (TokenValue memory)
    {
        return s_tokenValues[tokenId];
    }

    /**
     * @dev Returns the URI for the tokenId.
     * @dev Gets live ETH/USD price and returns tokenURI by comparing
     * price to the Bull, Bear & Neutral value of the token.
     * @dev TokenId must be minted already.
     * @param tokenId the tokenId whose URI to be fetched.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert TokenNotExisted();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        TokenValue memory token = s_tokenValues[tokenId];
        string memory name;
        string memory description;
        string memory imageURI;
        string[] memory imagesURIs = s_imagesURIs;

        if (price >= token.bullValue) {
            name = "Bull";
            description = "You are in a Bull market";
            imageURI = imagesURIs[0];
        } else if (price <= token.bearValue) {
            name = "Bear";
            description = "You are in a Bear market";
            imageURI = imagesURIs[1];
        } else {
            name = "Neutral";
            description = "You are in a Neutral market";
            imageURI = imagesURIs[2];
        }

        bytes memory dataURI = abi.encodePacked(
            '{"name":"',
            name,
            '","description":"',
            description,
            '","image":"',
            imageURI,
            '"}'
        );
        return string.concat(_baseURI(), Base64.encode(dataURI));
    }

    /**
     * @dev Returns baseURI for computing tokenURI.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    /**
     * @dev Converts svg to URI and pushes to s_imagesURIs.
     * @param svgs array of svgs XML.
     */
    function svgToImageURI(string[3] memory svgs) private {
        for (uint256 i = 0; i < svgs.length; i++) {
            string memory imageURI = string.concat(
                "data:image/svg+xml;base64,",
                Base64.encode(abi.encodePacked(svgs[i]))
            );
            s_imagesURIs.push(imageURI);
        }
    }
}
