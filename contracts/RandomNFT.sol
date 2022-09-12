// SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

pragma solidity ^0.8.8;

contract RandomNFT is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    constructor(address vrfCoordinator) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
    }

    function requestNFT() external returns (uint256) {}

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {}
}
