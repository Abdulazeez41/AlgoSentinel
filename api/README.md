# AlgoSentinel API

AlgoSentinel is a Testnet Composite Entry resource server for Algorand AI agents. It returns a paid, machine-readable safety decision before an agent transfers assets, swaps, or accepts an asset.

## Product routes

The three product-facing routes use the same `AVM_ADDRESS`, so they can be grouped under one Composite Entry merchant:

- `POST /api/agent-preflight` — unified `ALLOW`, `REVIEW`, or `BLOCK` decision.
- `POST /api/verify-counterparty` — counterparty wallet activity and risk check.
- `POST /api/verify-asset` — ASA/NFT supply, metadata, and control-address check.

The original GET routes remain available as compatibility aliases:

- `GET /api/wallet-risk/:address`
- `GET /api/pool-health/:assetA/:assetB`
- `GET /api/nft-check/:assetId`

## Setup

1. Copy `.env.example` to `.env`.
2. Create or use a Testnet Algorand account and set `AVM_ADDRESS`.
3. Opt that account into Testnet USDC ASA `10458941`.
4. Fund the account with Testnet ALGO and USDC from the Algorand dispensers.
5. Start the API with `npm.cmd run api:dev` from Windows Command Prompt.

The public GoPlausible facilitator handles verification and settlement. Set `ALGORAND_NETWORK=testnet` for Testnet (`algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=`, USDC ASA `10458941`) or `ALGORAND_NETWORK=mainnet` for Mainnet (`algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=`, USDC ASA `31566704`).

## Test

With the server running, execute `npm.cmd run api:smoke`. It checks that `/health` is public and that an unpaid protected request returns HTTP 402.

For a complete payment test, use the included client:

1. Keep the API running.
2. Set `RESOURCE_URL` in `api/client.env` to the port where the API is listening.
3. Run `npm.cmd run api:pay-testnet`.

The client wallet must hold Testnet ALGO for fees and Testnet USDC ASA `10458941`. Never paste a mnemonic or private key into chat or commit either file.

## Mainnet launch checklist

Testnet proves the integration only. Before competition submission, use a separate Mainnet pay-to wallet, set `ALGORAND_NETWORK=mainnet`, use Mainnet USDC ASA `31566704`, the Mainnet CAIP-2 identifier, a deployed HTTPS API, and real external users. Do not use the Testnet address or asset configuration for the competition launch.
