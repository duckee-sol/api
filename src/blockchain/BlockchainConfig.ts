import { ConfigKey } from '../utils';

export class BlockchainConfig {
  @ConfigKey({ env: 'SOLANA_NETWORK', default: 'testnet' })
  solanaNetwork: 'testnet';

  @ConfigKey({ env: 'ADMIN_ADDRESS', default: '' })
  adminAddress: string;

  @ConfigKey({ env: 'ADMIN_PRIVATE_KEY', warnIfNotGiven: true })
  adminPrivateKey: string;
}
