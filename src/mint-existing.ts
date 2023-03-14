import 'reflect-metadata';
import './api';
import { Container } from 'typedi';
import { ArtRepository, CreateArtNFT } from './art';
import { initializeDependency } from './initializeDependency';

async function main() {
  await initializeDependency();

  const artRepo = Container.get(ArtRepository);

  const tokenId = Number(process.argv[2]);
  if (isNaN(tokenId)) {
    console.log(`usage: ts-node scripts/mint-existing.ts <tokenID>`);
    process.exit(1);
  }
  const art = await artRepo.get(tokenId);
  if (!art) {
    throw new Error(`art ${tokenId} not found`);
  }
  if (art.owner.address.length < 40) {
    console.log(`owner's address ${art.owner.address} is not a valid solana address.`);
    process.exitCode = 1;
  }
  await Container.get(CreateArtNFT).call(art.owner.address, {
    ...art,
    recipe: { model: { type: 'imported' }, prompt: '', size: { width: 0, height: 0 } },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
