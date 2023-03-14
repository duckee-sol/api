import { Metaplex, toBigNumber } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { ArtCreationRequest } from '../ArtController';
import { ArtRepository } from '../ArtRepository';

@Service()
export class CreateArtNFT {
  constructor(private artRepository: ArtRepository, private metaplex: Metaplex, private connection: Connection) {}

  async call(recipient: string, creation: ArtCreationRequest, tokenIndex?: number): Promise<string> {
    const tokenId = tokenIndex ?? (await this.artRepository.countTotal().then((it) => it + 1));
    const name = `Duckee Art #${tokenId}`;
    const description = `${
      creation.description ? creation.description + '\n\n' : ''
    }Created from Duckee, A Tokenized Generative AI Art Playground to Create, Share, and Monetize the Prompt as NFT.`;

    const { uri } = await this.metaplex.nfts().uploadMetadata({
      name,
      description,
      image: creation.imageUrl,
      attributes: [
        { trait_type: 'Generation', value: `${creation.parentTokenId ? 2 : 1}` },
        { trait_type: 'Type', value: 'Art' },
      ],
      properties: {
        creators: [{ address: recipient, share: 100 }],
        files: [{ type: 'image/png', uri: creation.imageUrl }],
      },
      collection: {
        name: 'Duckee Art',
      },
    });
    log.trace('uploaded metadata', { uri });
    const { nft } = await this.metaplex.nfts().create(
      {
        uri,
        name,
        symbol: 'DUCKEEART',
        maxSupply: toBigNumber(1),
        isMutable: false,
        tokenOwner: new PublicKey(recipient),
        sellerFeeBasisPoints: 0,
      },
      { commitment: 'finalized' },
    );
    log.trace('minted NFT', {
      recipient,
      mintAddress: nft.address.toBase58(),
      ref: `https://explorer.solana.com/address/${nft.address}?cluster=devnet`,
    });

    return nft.address.toBase58();
  }
}
