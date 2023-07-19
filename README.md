Fork from [mattrglobal's library](https://github.com/mattrglobal/jsonld-signatures-bbs).  
Do not use this repository as it is for experimental purposes.

## Getting started

To use this package within your project simply run

```
npm install @kskhasegawa/jsonld-signatures-bbs
```

Or with [Yarn](https://yarnpkg.com/)

```
yarn add @kskhasegawa/jsonld-signatures-bbs
```

## Sample

See the [sample](./sample) directory for a runnable demo.

## Examples

The following is an example of a signed JSON-LD document featuring a `BbsBlsSignature2020` type signature.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
  "type": ["VerifiableCredential", "PermanentResidentCard"],
  "issuer": "did:example:489398593",
  "identifier": "83627465",
  "name": "Permanent Resident Card",
  "description": "Government of Example Permanent Resident Card.",
  "issuanceDate": "2019-12-03T12:19:52Z",
  "expirationDate": "2029-12-03T12:19:52Z",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["PermanentResident", "Person"],
    "givenName": "JOHN",
    "familyName": "SMITH",
    "gender": "Male",
    "image": "data:image/png;base64,iVBORw0KGgokJggg==",
    "residentSince": "2015-01-01",
    "lprCategory": "C09",
    "lprNumber": "999-999-999",
    "commuterClassification": "C1",
    "birthCountry": "Bahamas",
    "birthDate": "1958-07-17"
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2020-04-26T04:21:07Z",
    "verificationMethod": "did:example:489398593#test",
    "proofPurpose": "assertionMethod",
    "proofValue": "jx2VhjyZqUT91e2OhzweJA7G2u2UvmiDtIfmr+wUWNHWno+UOAh0FaNpM8Br+5j2JBkH981/nO1I7/9PFaRrng6NXu7vzDroKtuyj6nHGkMmGq4OMmBzIqRnG3ybin/Sxmu5YwqOxPMRsWH3H+2wSA=="
  }
}
```

Whereby a zero knowledge proof disclosing only `givenName`, `familyName` and `gender` can be derived, from the above assertion using the following as the reveal document
which is a [JSON-LD frame](https://www.w3.org/TR/json-ld11-framing/).

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "type": ["VerifiableCredential", "PermanentResidentCard"],
  "credentialSubject": {
    "type": ["PermanentResident", "Person"],
    "@explicit": true,
    "givenName": {},
    "familyName": {},
    "gender": {}
  }
}
```

That gives rise to the output zero knowledge proof

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
  "type": ["PermanentResidentCard", "VerifiableCredential"],
  "description": "Government of Example Permanent Resident Card.",
  "identifier": "83627465",
  "name": "Permanent Resident Card",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["Person", "PermanentResident"],
    "familyName": "SMITH",
    "gender": "Male",
    "givenName": "JOHN"
  },
  "expirationDate": "2029-12-03T12:19:52Z",
  "issuanceDate": "2019-12-03T12:19:52Z",
  "issuer": "did:example:489398593",
  "proof": {
    "type": "BbsBlsSignatureProof2020",
    "created": "2020-05-25T23:07:10Z",
    "verificationMethod": "did:example:489398593#test",
    "proofPurpose": "assertionMethod",
    "proofValue": "ABgA/4N3qygQRJlX3gmQOlJRGbO1KTXKQUmaN02xl+FiNZUDmGfa5OoKtg0RJ4wxxA08t3Vut61G/pq4yN0bygaFk5EJF6j7zFXmz9Vc7EdlDAvUkXqPaKA8inSBNv97HiZ1o5hIpoRnepW89p4JXPVrFi8XbDARSZpCg18GUuUMaPQLHKU82M/9l8tqqG1lKBOs+sRAAAAAdKRrRPj6zAz5LPZgDZJ0J2rNJjQI+JNYbV4AYEVwW37sxQ99aGGvmBk3DL0sod1V/gAAAAJMLYjmrb92zV087wO8UtFLwMj7qJuqV9VkMDghdrrc3BGtJuQgKx2GTrOb4CQxI1bf+iG0USjTktcjTlKv3X5spg3+ihOnyve0HnMWWggAW22j8b78jbl7lkYGJvzIXTzrVJ5KdYp3tXMDTAX7CLEXAAAACVY8oocA9Bz1w42F8Yv7UAPHv4pSvunXqndFOet3kWtzYHYEbO5gc42wPQtLmTtmqP6kUbQv6ruxzRmANulB8fUfy2jah/QeHKvsp907YDnSfo2wofRxa/vzsZnVriw0UmZnP0sYjbhmCkhoQZkxhqel3IkOF+H80wzvCKCl6eq5biEFMYA4bXpDX6Ap5/6WS5SSFaJRWxW+hpR/9EuQE11sGtk2W2Wn4eBrQUgVqYgPLI+U/ONaUJrh+GVJ/XXx7xxbAUf/NeQ/13AkTnYNn1fUdiOJ2oKl1lGr59udFq2tBBsyC3msTtQPYJS084355GRBur5jnzPNJ2W6Gu3ZqqQeRrVyw1gzdhVDNOE8KUm9OQ3AvCuxo8PHNrqzNvc6VA==",
    "nonce": "37pdwue1a8FWLqgwCd0QJ0IJTFhp609KtxeCTWZGnfAVE+sOBDffYez+TY/bmVy+6z4="
  }
}
```

## Getting started as a contributor

The following describes how to get started as a contributor to this project

### Prerequisites

The following is a list of dependencies you must install to build and contribute to this project

- [Yarn](https://yarnpkg.com/)

For more details see our [contribution guidelines](./docs/CONTRIBUTING.md)

#### Install

To install the package dependencies run:

```
yarn install --frozen-lockfile
```

#### Build

To build the project run:

```
yarn build
```

#### Test

To run the test in the project run:

```
yarn test
```
