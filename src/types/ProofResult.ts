/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Options for derive proof value
 */
export interface ProofResult {
  proof: Uint8Array;
  challenge_hash: String;
  hidden_messages: any[];
  hidden_message_hash: any[];
  blinding_factors: any[];
  correct_commit: any[];
}
