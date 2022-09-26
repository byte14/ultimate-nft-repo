// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @dev TokenId not minted yet.
 */
error TokenNotExisted();

/**
 * @title A Basic NFT Contract
 * @author Avishek Raj Panta
 * @dev Minimalistic implementation of ERC721
 */
contract BasicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    /** State Variables **/
    Counters.Counter private s_tokenCounter;
    string private constant TOKEN_URI =
        "https://gateway.pinata.cloud/ipfs/QmQ7KnkdCefhLGkTuEfTAYWh8AXe6RhYUvv9YJjdTio1UW/01-Ingvild.jpg";

    /**
     * @dev Initializes token name and symbol.
     */
    constructor() ERC721("Warrior Club", "WRC") {}

    /**
     * @dev Mints NFT to caller address.
     * @dev Sets token URI for the tokenId.
     * @dev Increments token counter.
     */
    function mintNFT() external {
        uint256 newTokenId = s_tokenCounter.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, TOKEN_URI);
        s_tokenCounter.increment();
    }

    /**
     * @dev Returns the current tokenId.
     */
    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }

    /**
     * @dev Returns the URI for the tokenId.
     * @dev TokenId must be minted already.
     * @param tokenId uint256 TokenId whose URI to get.
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
        return TOKEN_URI;
    }
}
