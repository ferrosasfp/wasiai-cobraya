// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CobrayaInvoiceCommitments} from "../src/CobrayaInvoiceCommitments.sol";

contract CobrayaInvoiceCommitmentsTest is Test {
    CobrayaInvoiceCommitments internal commitments;
    address internal owner = address(0xA11CE);
    address internal initialCommitter = address(0xB0B);
    address internal stranger = address(0xC0DE);

    bytes32 internal sampleHash = keccak256(abi.encodePacked("invoice-A"));
    bytes32 internal sampleMeta = keccak256(abi.encodePacked("metadata-A"));

    function setUp() public {
        vm.prank(owner);
        commitments = new CobrayaInvoiceCommitments(initialCommitter);
    }

    // 1
    function test_Constructor_AutoAuthorizesInitial() public view {
        assertTrue(commitments.authorizedCommitters(initialCommitter));
    }

    // 2
    function test_Constructor_RevertsZeroAddress() public {
        vm.expectRevert(CobrayaInvoiceCommitments.ZeroAddress.selector);
        new CobrayaInvoiceCommitments(address(0));
    }

    // 3
    function test_CommitInvoice_HappyPath() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);

        (bool active, uint64 ts, address committer) = commitments.isCommitted(sampleHash);
        assertTrue(active);
        assertEq(committer, initialCommitter);
        assertGt(ts, 0);
    }

    // 4
    function test_CommitInvoice_RevertsAlreadyCommitted() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);

        uint64 ts = uint64(block.timestamp);

        vm.prank(initialCommitter);
        vm.expectRevert(
            abi.encodeWithSelector(
                CobrayaInvoiceCommitments.AlreadyCommitted.selector,
                sampleHash,
                ts,
                initialCommitter
            )
        );
        commitments.commitInvoice(sampleHash, sampleMeta);
    }

    // 5
    function test_CommitInvoice_RevertsNotAuthorized() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(CobrayaInvoiceCommitments.NotAuthorized.selector, stranger)
        );
        commitments.commitInvoice(sampleHash, sampleMeta);
    }

    // 6
    function test_CommitInvoice_RevertsZeroHash() public {
        vm.prank(initialCommitter);
        vm.expectRevert(CobrayaInvoiceCommitments.ZeroHash.selector);
        commitments.commitInvoice(bytes32(0), sampleMeta);
    }

    // 7
    function test_CommitInvoice_OwnerCanCommit() public {
        vm.prank(owner);
        commitments.commitInvoice(sampleHash, sampleMeta);
        (bool active, , address committer) = commitments.isCommitted(sampleHash);
        assertTrue(active);
        assertEq(committer, owner);
    }

    // 8
    function test_ReleaseInvoice_HappyPath() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);

        vm.prank(initialCommitter);
        commitments.releaseInvoice(sampleHash);

        // status moves to Released → isCommitted reports active=false
        (bool active, , ) = commitments.isCommitted(sampleHash);
        assertFalse(active);
    }

    // 9
    function test_ReleaseInvoice_RevertsNotCommitted() public {
        bytes32 unknownHash = keccak256("never-committed");
        vm.prank(initialCommitter);
        vm.expectRevert(
            abi.encodeWithSelector(CobrayaInvoiceCommitments.NotCommitted.selector, unknownHash)
        );
        commitments.releaseInvoice(unknownHash);
    }

    // 10
    function test_ReleaseInvoice_RevertsNotCommitter() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);

        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(
                CobrayaInvoiceCommitments.NotCommitter.selector,
                stranger,
                initialCommitter
            )
        );
        commitments.releaseInvoice(sampleHash);
    }

    // 11
    function test_SetAuthorizedCommitter_OnlyOwner() public {
        vm.prank(stranger);
        // OZ v5 Ownable throws OwnableUnauthorizedAccount(address)
        vm.expectRevert(
            abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", stranger)
        );
        commitments.setAuthorizedCommitter(address(0xD00D), true);
    }

    // 12 CD-11 gas budget
    function test_GasBudget_CommitInvoice() public {
        vm.prank(initialCommitter);
        uint256 g0 = gasleft();
        commitments.commitInvoice(sampleHash, sampleMeta);
        uint256 used = g0 - gasleft();
        emit log_named_uint("commitInvoice gas used", used);
        assertLt(used, 80_000);
    }

    // 13 setAuthorizedCommitter happy path (extra coverage for owner add/remove)
    function test_SetAuthorizedCommitter_Toggles() public {
        address newCommitter = address(0xDEAD);
        vm.prank(owner);
        commitments.setAuthorizedCommitter(newCommitter, true);
        assertTrue(commitments.authorizedCommitters(newCommitter));

        vm.prank(owner);
        commitments.setAuthorizedCommitter(newCommitter, false);
        assertFalse(commitments.authorizedCommitters(newCommitter));
    }

    // 14 setAuthorizedCommitter revert zero address
    function test_SetAuthorizedCommitter_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(CobrayaInvoiceCommitments.ZeroAddress.selector);
        commitments.setAuthorizedCommitter(address(0), true);
    }

    // 15b releaseInvoice already-Released → InvalidStatus
    function test_ReleaseInvoice_RevertsInvalidStatus() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);
        vm.prank(initialCommitter);
        commitments.releaseInvoice(sampleHash);

        vm.prank(initialCommitter);
        vm.expectRevert(
            abi.encodeWithSelector(
                CobrayaInvoiceCommitments.InvalidStatus.selector,
                sampleHash,
                CobrayaInvoiceCommitments.CommitmentStatus.Released
            )
        );
        commitments.releaseInvoice(sampleHash);
    }

    // 16 getCommitment returns struct
    function test_GetCommitment_PostCommit() public {
        vm.prank(initialCommitter);
        commitments.commitInvoice(sampleHash, sampleMeta);
        CobrayaInvoiceCommitments.Commitment memory c = commitments.getCommitment(sampleHash);
        assertEq(c.committer, initialCommitter);
        assertEq(c.metadataPointer, sampleMeta);
        assertEq(uint8(c.status), uint8(CobrayaInvoiceCommitments.CommitmentStatus.Active));
    }
}
