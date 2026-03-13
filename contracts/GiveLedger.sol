// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GiveLedger
 * @notice Records immutable on-chain proof of donations and disbursements
 *         for the GiveLedger platform.
 *
 * Deployment: Polygon Mainnet (or Amoy testnet for staging)
 * Estimated gas per record: ~50,000–80,000 gas (~0.001 MATIC at 30 gwei)
 *
 * This contract is append-only. Records cannot be modified or deleted.
 * The platform backend (operator wallet) is the only party that can write records.
 */
contract GiveLedger {

    address public owner;
    address public operator;

    enum RecordType {
        DONATION,
        DISBURSEMENT,
        SKILL_CONTRIBUTION
    }

    struct ImpactRecord {
        RecordType recordType;
        string entityId;       // DB record ID (donation.id, disbursement.id, etc.)
        string ngoId;          // NGO DB ID
        string projectId;      // Project DB ID (may be empty)
        uint256 amountUSD;     // Amount in cents (avoid float precision issues)
        uint256 timestamp;
        string metadataUri;    // Optional: IPFS URI for extended data
    }

    // Array of all records (append-only)
    ImpactRecord[] public records;

    // Index: entityId => records array index + 1 (0 means not found)
    mapping(string => uint256) public entityIndex;

    // Total donated per NGO (in USD cents)
    mapping(string => uint256) public totalDonatedByNgo;

    // Events
    event DonationRecorded(
        uint256 indexed recordIndex,
        string entityId,
        string ngoId,
        string projectId,
        uint256 amountUSD,
        uint256 timestamp
    );

    event DisbursementRecorded(
        uint256 indexed recordIndex,
        string entityId,
        string ngoId,
        string projectId,
        uint256 amountUSD,
        uint256 timestamp
    );

    event SkillContributionRecorded(
        uint256 indexed recordIndex,
        string entityId,
        string ngoId,
        uint256 amountUSD,
        uint256 timestamp
    );

    modifier onlyOperator() {
        require(
            msg.sender == operator || msg.sender == owner,
            "GiveLedger: caller is not operator"
        );
        _;
    }

    constructor(address _operator) {
        owner = msg.sender;
        operator = _operator;
    }

    /**
     * @notice Update the operator wallet address
     * @dev Only callable by owner
     */
    function setOperator(address _operator) external {
        require(msg.sender == owner, "GiveLedger: not owner");
        operator = _operator;
    }

    /**
     * @notice Record a donation on-chain
     * @param entityId  The donation DB record ID
     * @param ngoId     The NGO DB record ID
     * @param projectId The project DB record ID
     * @param amountUSD Amount in USD cents
     * @param metadataUri Optional IPFS URI
     */
    function recordDonation(
        string calldata entityId,
        string calldata ngoId,
        string calldata projectId,
        uint256 amountUSD,
        string calldata metadataUri
    ) external onlyOperator returns (uint256 recordIndex) {
        require(entityIndex[entityId] == 0, "GiveLedger: entity already recorded");

        recordIndex = records.length;
        records.push(ImpactRecord({
            recordType: RecordType.DONATION,
            entityId: entityId,
            ngoId: ngoId,
            projectId: projectId,
            amountUSD: amountUSD,
            timestamp: block.timestamp,
            metadataUri: metadataUri
        }));

        entityIndex[entityId] = recordIndex + 1;
        totalDonatedByNgo[ngoId] += amountUSD;

        emit DonationRecorded(recordIndex, entityId, ngoId, projectId, amountUSD, block.timestamp);
    }

    /**
     * @notice Record a milestone disbursement on-chain
     */
    function recordDisbursement(
        string calldata entityId,
        string calldata ngoId,
        string calldata projectId,
        uint256 amountUSD,
        string calldata metadataUri
    ) external onlyOperator returns (uint256 recordIndex) {
        require(entityIndex[entityId] == 0, "GiveLedger: entity already recorded");

        recordIndex = records.length;
        records.push(ImpactRecord({
            recordType: RecordType.DISBURSEMENT,
            entityId: entityId,
            ngoId: ngoId,
            projectId: projectId,
            amountUSD: amountUSD,
            timestamp: block.timestamp,
            metadataUri: metadataUri
        }));

        entityIndex[entityId] = recordIndex + 1;

        emit DisbursementRecorded(recordIndex, entityId, ngoId, projectId, amountUSD, block.timestamp);
    }

    /**
     * @notice Record a verified skill contribution on-chain
     */
    function recordSkillContribution(
        string calldata entityId,
        string calldata ngoId,
        uint256 amountUSD,
        string calldata metadataUri
    ) external onlyOperator returns (uint256 recordIndex) {
        require(entityIndex[entityId] == 0, "GiveLedger: entity already recorded");

        recordIndex = records.length;
        records.push(ImpactRecord({
            recordType: RecordType.SKILL_CONTRIBUTION,
            entityId: entityId,
            ngoId: ngoId,
            projectId: "",
            amountUSD: amountUSD,
            timestamp: block.timestamp,
            metadataUri: metadataUri
        }));

        entityIndex[entityId] = recordIndex + 1;

        emit SkillContributionRecorded(recordIndex, entityId, ngoId, amountUSD, block.timestamp);
    }

    /**
     * @notice Get a record by its index
     */
    function getRecord(uint256 index) external view returns (ImpactRecord memory) {
        require(index < records.length, "GiveLedger: index out of bounds");
        return records[index];
    }

    /**
     * @notice Total number of records
     */
    function recordCount() external view returns (uint256) {
        return records.length;
    }

    /**
     * @notice Check if an entity has been recorded
     */
    function isRecorded(string calldata entityId) external view returns (bool) {
        return entityIndex[entityId] != 0;
    }
}
