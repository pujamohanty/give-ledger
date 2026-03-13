/**
 * GiveLedger Blockchain Client
 *
 * Writes impact records to the GiveLedger smart contract on Polygon.
 *
 * Activation:
 *   Set the following environment variables to enable real on-chain writes:
 *   - POLYGON_RPC_URL      e.g. https://polygon-mainnet.infura.io/v3/YOUR_KEY
 *   - POLYGON_PRIVATE_KEY  hex private key of the operator wallet (with MATIC for gas)
 *   - POLYGON_CONTRACT_ADDRESS  deployed GiveLedger.sol address
 *
 *   If any variable is missing, all functions fall back to generateMockTxHash().
 *
 * Contract ABI (GiveLedger.sol):
 *   recordDonation(entityId, ngoId, projectId, amountUSD, metadataUri) → tx
 *   recordDisbursement(entityId, ngoId, projectId, amountUSD, metadataUri) → tx
 *   recordSkillContribution(entityId, ngoId, amountUSD, metadataUri) → tx
 */

import { ethers } from "ethers";
import { generateMockTxHash } from "./utils";

const CONTRACT_ABI = [
  "function recordDonation(string entityId, string ngoId, string projectId, uint256 amountUSD, string metadataUri) returns (uint256)",
  "function recordDisbursement(string entityId, string ngoId, string projectId, uint256 amountUSD, string metadataUri) returns (uint256)",
  "function recordSkillContribution(string entityId, string ngoId, uint256 amountUSD, string metadataUri) returns (uint256)",
  "function isRecorded(string entityId) view returns (bool)",
  "function recordCount() view returns (uint256)",
];

function isBlockchainConfigured(): boolean {
  return (
    Boolean(process.env.POLYGON_RPC_URL) &&
    Boolean(process.env.POLYGON_PRIVATE_KEY) &&
    Boolean(process.env.POLYGON_CONTRACT_ADDRESS)
  );
}

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
  return new ethers.Contract(process.env.POLYGON_CONTRACT_ADDRESS!, CONTRACT_ABI, wallet);
}

export type BlockchainResult = {
  txHash: string;
  isReal: boolean; // false = mock hash
};

/**
 * Record a donation on-chain
 * @param entityId   donation.id from DB
 * @param ngoId      ngo.id from DB
 * @param projectId  project.id from DB
 * @param amountUSD  donation amount in USD (will be converted to cents on-chain)
 */
export async function recordDonation(
  entityId: string,
  ngoId: string,
  projectId: string,
  amountUSD: number
): Promise<BlockchainResult> {
  if (!isBlockchainConfigured()) {
    return { txHash: generateMockTxHash(), isReal: false };
  }
  try {
    const contract = getContract();
    const amountCents = Math.round(amountUSD * 100);
    const tx = await contract.recordDonation(entityId, ngoId, projectId, amountCents, "");
    const receipt = await tx.wait();
    return { txHash: receipt.hash, isReal: true };
  } catch (err) {
    console.error("[blockchain] recordDonation failed, falling back to mock:", err);
    return { txHash: generateMockTxHash(), isReal: false };
  }
}

/**
 * Record a milestone disbursement on-chain
 * @param entityId   disbursement.id from DB
 * @param ngoId      ngo.id from DB
 * @param projectId  project.id from DB
 * @param amountUSD  approved disbursement amount
 */
export async function recordDisbursement(
  entityId: string,
  ngoId: string,
  projectId: string,
  amountUSD: number
): Promise<BlockchainResult> {
  if (!isBlockchainConfigured()) {
    return { txHash: generateMockTxHash(), isReal: false };
  }
  try {
    const contract = getContract();
    const amountCents = Math.round(amountUSD * 100);
    const tx = await contract.recordDisbursement(entityId, ngoId, projectId, amountCents, "");
    const receipt = await tx.wait();
    return { txHash: receipt.hash, isReal: true };
  } catch (err) {
    console.error("[blockchain] recordDisbursement failed, falling back to mock:", err);
    return { txHash: generateMockTxHash(), isReal: false };
  }
}

/**
 * Record an approved skill contribution on-chain
 * @param entityId      skillContribution.id from DB
 * @param ngoId         ngo.id from DB
 * @param monetaryValue optional monetary value assigned by NGO (USD)
 */
export async function recordSkillContribution(
  entityId: string,
  ngoId: string,
  monetaryValue: number = 0
): Promise<BlockchainResult> {
  if (!isBlockchainConfigured()) {
    return { txHash: generateMockTxHash(), isReal: false };
  }
  try {
    const contract = getContract();
    const amountCents = Math.round(monetaryValue * 100);
    const tx = await contract.recordSkillContribution(entityId, ngoId, amountCents, "");
    const receipt = await tx.wait();
    return { txHash: receipt.hash, isReal: true };
  } catch (err) {
    console.error("[blockchain] recordSkillContribution failed, falling back to mock:", err);
    return { txHash: generateMockTxHash(), isReal: false };
  }
}

/**
 * Check if an entity has already been recorded on-chain
 */
export async function isRecordedOnChain(entityId: string): Promise<boolean> {
  if (!isBlockchainConfigured()) return false;
  try {
    const contract = getContract();
    return await contract.isRecorded(entityId);
  } catch {
    return false;
  }
}

/**
 * Get total number of on-chain records
 */
export async function getOnChainRecordCount(): Promise<number> {
  if (!isBlockchainConfigured()) return 0;
  try {
    const contract = getContract();
    const count = await contract.recordCount();
    return Number(count);
  } catch {
    return 0;
  }
}
