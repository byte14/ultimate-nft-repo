// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error TokenNotExisted();

contract OnChainSvgNFT is ERC721 {
    using Counters for Counters.Counter;

    struct TokenValue {
        int256 bullValue;
        int256 bearValue;
    }

    AggregatorV3Interface private immutable i_priceFeed;
    Counters.Counter private s_tokenCounter;
    string[] private s_imagesURIs;

    mapping(uint256 => TokenValue) private s_tokenValues;

    event NftMinted(uint256 indexed tokenId, address minter);

    constructor(address priceFeedAddress, string[3] memory svgs)
        ERC721("Bull Bear Neutral", "BBN")
    {
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        svgToImageURI(svgs);
    }

    function mintNFT(int256 bullValue, int256 bearValue) external {
        uint256 newTokenId = s_tokenCounter.current();
        s_tokenValues[newTokenId] = TokenValue(bullValue, bearValue);
        _safeMint(msg.sender, newTokenId);
        s_tokenCounter.increment();
        emit NftMinted(newTokenId, msg.sender);
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }

    function getImageURI(uint256 index) external view returns (string memory) {
        return s_imagesURIs[index];
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenBullBearValue(uint256 tokenId)
        external
        view
        returns (TokenValue memory)
    {
        return s_tokenValues[tokenId];
    }

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
            description = "Market is bullish";
            imageURI = imagesURIs[0];
        } else if (price <= token.bearValue) {
            name = "Bear";
            description = "Market is bearish";
            imageURI = imagesURIs[1];
        } else {
            name = "Neutral";
            description = "Market is neutral";
            imageURI = imagesURIs[2];
        }

        bytes memory dataURI = abi.encodePacked(
            '{"name":"',
            name,
            '", "description":"',
            description,
            '", "image":"',
            imageURI,
            '"}'
        );
        return string.concat(_baseURI(), Base64.encode(dataURI));
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

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
