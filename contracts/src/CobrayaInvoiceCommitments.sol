// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// V1: no ReentrancyGuard needed — only storage writes, no external calls/transfers.
// Source of truth: story file §8 (W2.5b).

import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract CobrayaInvoiceCommitments is Ownable2Step {
    enum CommitmentStatus { None, Active, Released }

    struct Commitment {
        address committer;
        uint64 committedAt;
        CommitmentStatus status;
        bytes32 metadataPointer;
    }

    mapping(bytes32 => Commitment) public commitments;
    mapping(address => bool) public authorizedCommitters;

    // Custom errors (CD-15 — params useful).
    error ZeroAddress();
    error ZeroHash();
    error NotAuthorized(address caller);
    error AlreadyCommitted(bytes32 hash, uint64 originalTimestamp, address originalCommitter);
    error NotCommitted(bytes32 hash);
    error InvalidStatus(bytes32 hash, CommitmentStatus current);
    error NotCommitter(address caller, address actualCommitter);

    event InvoiceCommitted(bytes32 indexed hash, address indexed committer, uint64 timestamp);
    event InvoiceReleased(bytes32 indexed hash, address indexed releaser, uint64 timestamp);
    event CommitterAuthorized(address indexed committer, bool authorized);

    modifier onlyAuthorized() {
        if (!authorizedCommitters[msg.sender] && msg.sender != owner()) revert NotAuthorized(msg.sender);
        _;
    }

    constructor(address initialCommitter) Ownable(msg.sender) {
        if (initialCommitter == address(0)) revert ZeroAddress();
        authorizedCommitters[initialCommitter] = true;
        emit CommitterAuthorized(initialCommitter, true);
    }

    function setAuthorizedCommitter(address committer, bool authorized) external onlyOwner {
        if (committer == address(0)) revert ZeroAddress();
        authorizedCommitters[committer] = authorized;
        emit CommitterAuthorized(committer, authorized);
    }

    function commitInvoice(bytes32 hash, bytes32 metadataPointer) external onlyAuthorized {
        if (hash == bytes32(0)) revert ZeroHash();
        Commitment storage c = commitments[hash];
        if (c.status == CommitmentStatus.Active) {
            revert AlreadyCommitted(hash, c.committedAt, c.committer);
        }
        c.committer = msg.sender;
        c.committedAt = uint64(block.timestamp);
        c.status = CommitmentStatus.Active;
        c.metadataPointer = metadataPointer;
        emit InvoiceCommitted(hash, msg.sender, c.committedAt);
    }

    function releaseInvoice(bytes32 hash) external {
        Commitment storage c = commitments[hash];
        if (c.status == CommitmentStatus.None) revert NotCommitted(hash);
        if (c.status != CommitmentStatus.Active) revert InvalidStatus(hash, c.status);
        if (msg.sender != c.committer && msg.sender != owner()) revert NotCommitter(msg.sender, c.committer);
        c.status = CommitmentStatus.Released;
        emit InvoiceReleased(hash, msg.sender, uint64(block.timestamp));
    }

    function isCommitted(bytes32 hash) external view returns (bool active, uint64 ts, address committer) {
        Commitment storage c = commitments[hash];
        return (c.status == CommitmentStatus.Active, c.committedAt, c.committer);
    }

    function getCommitment(bytes32 hash) external view returns (Commitment memory) {
        return commitments[hash];
    }
}
