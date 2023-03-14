import { clusterApiUrl, Connection } from '@solana/web3.js';
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
  // const adminKeypair = Keypair.fromSecretKey(JSON.parse(config.blockchain.adminPrivateKey));

  Container.set(
    Axios,
    axios.create({
      timeout: 5000,
      validateStatus: () => true,
    }),
  );

  return { config };
}
