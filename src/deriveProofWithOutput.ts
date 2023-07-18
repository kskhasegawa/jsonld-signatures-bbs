/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProofs, getTypeInfo } from "./utilities";
import jsonld from "jsonld";
import { SECURITY_PROOF_URL } from "jsonld-signatures";
import { ProofResult } from "./types";
import { ok } from "assert";

/**
 * Derives a proof from a document featuring a supported linked data proof
 *
 * NOTE - This is a temporary API extending JSON-LD signatures
 *
 * @param proofDocument A document featuring a linked data proof capable of proof derivation
 * @param revealDocument A document of the form of a JSON-LD frame describing the terms to selectively derive from the proof document
 * @param options Options for proof derivation
 */
export const deriveProofWithOutput = async (
  proofDocument: any,
  revealDocument: any,
  { suite, documentLoader, expansionMap, skipProofCompaction, nonce }: any
): Promise<any> => {
  if (!suite) {
    throw new TypeError('"options.suite" is required.');
  }

  if (Array.isArray(proofDocument)) {
    throw new TypeError("proofDocument should be an object not an array.");
  }

  const { proofs, document } = await getProofs({
    document: proofDocument,
    proofType: suite.supportedDeriveProofType,
    documentLoader,
    expansionMap,
  });

  if (proofs.length === 0) {
    throw new Error(
      `There were not any proofs provided that can be used to derive a proof with this suite.`
    );
  }
  let derivedProof;

  derivedProof = await suite.deriveProofWithOutput({
    document,
    proof: proofs[0],
    revealDocument,
    documentLoader,
    expansionMap,
    nonce,
  });

  let challenge_hash = derivedProof.challenge_hash;
  let hidden_messages = derivedProof.hidden_messages;
  let blinding_factors = derivedProof.blinding_factors;
  let correct_commit = derivedProof.correct_commit;

  if (proofs.length > 1) {
    // convert the proof property value from object ot array of objects
    derivedProof = { ...derivedProof, proof: [derivedProof.proof] };

    // drop the first proof because it's already been processed
    proofs.splice(0, 1);

    // add all the additional proofs to the derivedProof document
    for (const proof of proofs) {
      const additionalDerivedProofValue = await suite.deriveProofWithOutput({
        document,
        proof,
        revealDocument,
        documentLoader,
        expansionMap,
      });
      derivedProof.proof.push(additionalDerivedProofValue.proof);
    }
  }

  if (!skipProofCompaction) {
    /* eslint-disable prefer-const */
    let expandedProof: any = {
      [SECURITY_PROOF_URL]: {
        "@graph": derivedProof.proof,
      },
    };

    // account for type-scoped `proof` definition by getting document types
    const { types, alias } = await getTypeInfo(derivedProof.document, {
      documentLoader,
      expansionMap,
    });

    expandedProof["@type"] = types;

    const ctx = jsonld.getValues(derivedProof.document, "@context");

    const compactProof = await jsonld.compact(expandedProof, ctx, {
      documentLoader,
      expansionMap,
      compactToRelative: false,
    });

    delete compactProof[alias];
    delete compactProof["@context"];

    /**
     * removes the @included tag when multiple proofs exist because the
     * @included tag messes up the canonicalized bytes leading to a bad
     * signature that won't verify.
     **/
    if (compactProof.proof?.["@included"]) {
      compactProof.proof = compactProof.proof["@included"];
    }

    // add proof to document
    const key = Object.keys(compactProof)[0];
    jsonld.addValue(derivedProof.document, key, compactProof[key]);
  } else {
    delete derivedProof.proof["@context"];
    jsonld.addValue(derivedProof.document, "proof", derivedProof.proof);
  }
  // return derivedProof.document;
  return [
    derivedProof.document,
    challenge_hash,
    hidden_messages,
    blinding_factors,
    correct_commit,
  ];
};
