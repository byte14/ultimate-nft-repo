// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

pragma solidity ^0.8.8;

error TokenNotExisted();

contract BasicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;

    string private constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Warrior Club", "WRC") {}

    function mintNft() external {
        uint256 newTokenId = s_tokenCounter.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, TOKEN_URI);
        s_tokenCounter.increment();
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

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter.current();
    }
}
