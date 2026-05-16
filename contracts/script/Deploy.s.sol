// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CobrayaInvoiceCommitments} from "../src/CobrayaInvoiceCommitments.sol";

contract DeployCommitments is Script {
    function run() external returns (address) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address initialCommitter = vm.envAddress("FRAUD_DETECTOR_AGENT_WALLET");

        vm.startBroadcast(deployerKey);
        CobrayaInvoiceCommitments c = new CobrayaInvoiceCommitments(initialCommitter);
        vm.stopBroadcast();

        console.log("CobrayaInvoiceCommitments deployed at:", address(c));
        return address(c);
    }
}
