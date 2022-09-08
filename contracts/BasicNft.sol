// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.8;

contract BasicNft is ERC721 {
    error NotExisted();

    string public constant = TOKEN_URI = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    uint256 private s_tokenCounter;

    constructor() ERC721("Dogie", "DOG") {}

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert NotExisted();
        }
        return TOKEN_URI;
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter;
    }
}
