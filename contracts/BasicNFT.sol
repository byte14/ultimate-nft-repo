// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error TokenNotExisted();

contract BasicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private s_tokenCounter;
    string private constant TOKEN_URI =
        "https://gateway.pinata.cloud/ipfs/QmQ7KnkdCefhLGkTuEfTAYWh8AXe6RhYUvv9YJjdTio1UW/01-Ingvild.jpg";

    constructor() ERC721("Warrior Club", "WRC") {}

    function mintNFT() external {
        uint256 newTokenId = s_tokenCounter.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, TOKEN_URI);
        s_tokenCounter.increment();
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
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
        return TOKEN_URI;
    }
}
