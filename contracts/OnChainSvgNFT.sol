// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract OnChainSvgNFT is ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private s_tokenCounter;
    string private s_bullImageURI;
    string private s_bearimageURI;
    string private s_neutralImageURI;

    event NftMinted(uint256 indexed tokenId, address minter);

    constructor(
        string memory bullSvg,
        string memory bearSvg,
        string memory neutralSvg
    ) ERC721("On Chain SVG", "OCN") {
        s_bullImageURI = svgToImageURI(bullSvg);
        s_bearimageURI = svgToImageURI(bearSvg);
        s_neutralImageURI = svgToImageURI(neutralSvg);
    }

    function mintNFT() external {
        uint256 newTokenId = s_tokenCounter.current();
        _safeMint(msg.sender, newTokenId);
        s_tokenCounter.increment();
        emit NftMinted(newTokenId, msg.sender);
    }

    function svgToImageURI(string memory svg)
        private
        pure
        returns (string memory)
    {
        bytes memory imageURI = abi.encodePacked(svg);
        return
            string.concat(
                "data:image/svg+xml;base64,",
                Base64.encode(imageURI)
            );
    }
}
