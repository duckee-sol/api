# 💻 Duckee API

This is API server implementation of Duckee, an generative art exchange platform on [Solana](https://solana.com/).

* Testnet API Endpoint: [**api-solana.duckee.xyz**](https://api-solana.duckee.xyz)
* [Swagger API Documentation](https://api-solana.duckee.xyz/swagger)

## Getting Started

### Prerequisites

* Node.JS >= 16 or higher
* [`pnpm`](https://pnpm.io) Package Manager

### Setting Up Dependencies

Duckee API uses [pnpm](https://pnpm.io) as dependency manager. Before installing use corepack to activate it:

```
 $ corepack enable  # this installs pnpm
 $ pnpm install
```

### Configuring API

You need to prepare the configuration as environment variables. For details, please refer
to [`src/config.ts`](./src/config.ts). We recommend setting up `.env` file
with [autoenv](https://github.com/hyperupcall/autoenv):

```
 $ cat .env.local
 DB_HOST=localhost:3306
 DB_USER=duckee
 ADMIN_PRIVATE_KEY=...
```

Private keys are in JSON array format (Unencrypted Solana keypair). You can easily generate it with `solana-keygen`:

```
$ solana-keygen new
$ export ADMIN_PRIVATE_KEY=`cat ~/.config/solana/id.json`
```

## Deploying API

We use AWS Lambda for deploying API.
If you want to deploy in your own AWS account, please refer to serverless.yml for details.
