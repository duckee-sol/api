import { bundlrStorage, keypairIdentity, Metaplex } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import axios, { Axios } from 'axios';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { Config } from './config';
import { initializeDatabase } from './database';
import { loadConfig, registerForInjectRepository } from './utils';

export async function initializeDependency() {
  const config = loadConfig(Config, {
    iocHook: (type, object) => Container.set(type, object),
  });
  const database = await initializeDatabase(config.database);
  Container.set(DataSource, database);
  registerForInjectRepository(database);

  const connection = new Connection(clusterApiUrl('devnet'));
  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(config.blockchain.adminPrivateKey)));
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(adminKeypair))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: clusterApiUrl('devnet'),
        timeout: 60000,
      }),
    );

  Container.set(Connection, connection);
  Container.set(Keypair, adminKeypair);
  Container.set(Metaplex, metaplex);

  Container.set(
    Axios,
    axios.create({
      timeout: 5000,
      validateStatus: () => true,
    }),
  );

  return { config };
}
