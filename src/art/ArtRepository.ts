import { Container, Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository, paginatedFindBy, PaginatedResult, PaginationOptions } from '~/utils';
import { NotFoundError } from '../errors';
import { PaymentRepository } from '../payment';
import { getRequestUser, User } from '../user';
import { ArtEntity } from './entities';
import { ArtLike } from './entities/ArtLike';
import { Art, ArtCreation, ArtDetails } from './models';

interface ListFilter {
  parentTokenId: number;
  owner: number;
  tags: string[];
}

@Service()
export class ArtRepository {
  constructor(
    @InjectRepository(ArtEntity) private artRepo: Repository<ArtEntity>,
    @InjectRepository(ArtLike) private artLikeRepo: Repository<ArtLike>,
  ) {}

  async mapEntityToModel(entity: ArtEntity): Promise<Art> {
    const user = getRequestUser();
    const liked = user ? (await this.artLikeRepo.countBy({ user, art: { tokenId: entity.tokenId } })) > 0 : false;
    return {
      tokenId: entity.tokenId,
      tokenMint: entity.tokenMint,
      description: entity.description,
      forSale: entity.forSale,
      liked,
      imageUrl: entity.imageUrl,
      owner: entity.owner.toModel(),
      priceInFlow: entity.priceInFlow,
      royaltyFee: entity.royaltyFee,
    };
  }

  async create(creation: ArtCreation): Promise<ArtDetails> {
    if (creation.parentTokenId) {
      const parentToken = await this.artRepo.findOneBy({ tokenId: creation.parentTokenId });
      if (!parentToken) {
        throw new NotFoundError(`parent token ${creation.parentTokenId} not found`);
      }
    }
    const art = await this.artRepo.save({
      ...creation,
      parentTokenId: creation.parentTokenId,
    });
    return this.details(art.owner, art.tokenId);
  }

  async list(filter: Partial<ListFilter> = {}, pagination?: PaginationOptions): Promise<PaginatedResult<Art>> {
    const { hasNext, results, total } = await paginatedFindBy(
      this.artRepo,
      {
        where: filter.parentTokenId ? { parentTokenId: filter.parentTokenId } : {},
        order: { createdAt: 'DESC' },
      },
      pagination,
    );
    return {
      hasNext,
      results: await Promise.all(results.map((it) => this.mapEntityToModel(it))),
      total,
    };
  }

  async countTotal(): Promise<number> {
    return this.artRepo.countBy({});
  }

  async get(tokenId: number): Promise<Art> {
    const entity = await this.artRepo.findOneBy({ tokenId });
    if (!entity) {
      throw new NotFoundError();
    }
    return this.mapEntityToModel(entity);
  }

  async details(requestor: User, tokenId: number): Promise<ArtDetails> {
    const entity = await this.artRepo.findOneBy({ tokenId });
    if (!entity) {
      throw new NotFoundError();
    }

    const parentToken = await this.artRepo.findOneBy({ tokenId: entity.parentTokenId ?? -1 });
    const derivedTokens = await this.artRepo.findBy({ parentTokenId: tokenId });

    const bought = !!(await Container.get(PaymentRepository).getPaymentOf(requestor.address, tokenId));
    const listedByMe = requestor.address === entity.owner.address;
    const openSource = entity.priceInFlow === 0;
    const hasAccessibleToRecipe = openSource || listedByMe || bought;
    const recipeStatus = listedByMe ? 'listed-by-me' : bought ? 'bought' : openSource ? 'open-source' : undefined;

    return {
      ...(await this.mapEntityToModel(entity)),
      recipe: hasAccessibleToRecipe ? entity.recipe : null,
      recipeStatus,
      parentToken: parentToken ? await this.mapEntityToModel(parentToken) : undefined,
      derivedTokens: await Promise.all(derivedTokens.map((it) => this.mapEntityToModel(it))),
    };
  }

  async like(user: User, tokenId: number, liked: boolean) {
    if (!liked) {
      await this.artLikeRepo.delete({ user, art: { tokenId } });
      return;
    }
    try {
      await this.artLikeRepo.insert({ user, art: { tokenId } });
    } catch (err) {
      if ((err as any)?.code?.includes('DUP_ENTRY')) {
        return;
      }
      throw err;
    }
  }
}
