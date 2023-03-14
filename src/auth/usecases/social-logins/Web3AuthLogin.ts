import { randomUUID } from 'crypto';
import { decodeJwt } from 'jose';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { User, UserRepository } from '~/user';
import { ValidationError } from '../../../errors';
import { AuthConfig } from '../../AuthConfig';
import { SocialLoginChannel, SocialLoginVerifyResult } from './types';

@Service()
export class Web3AuthLogin implements SocialLoginChannel {
  constructor(private authConfig: AuthConfig, private userRepository: UserRepository) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ email });
  }

  /**
   */
  async verifyToken(token: string): Promise<SocialLoginVerifyResult> {
    /*
    {
      "iat": 1655835494,
      "aud": "BCtbnOamqh0cJFEUYA0NB5YkvBECZ3HLZsKfvSRBvew2EiiKW3UxpyQASSR0artjQkiUOCHeZ_ZeygXpYpxZjOs",
      "iss": "https://api.openlogin.com/",
      "email": "xyz@xyz.com",
      "name": "John Doe",
      "profileImage": "https://lh3.googleusercontent.com/a/AATXAJx3lnGmHiM4K97uLo9Rb0AxOceH-dQCBSRqGbck=s96-c",
      "verifier": "torus",
      "verifierId": "xyz@xyz.com",
      "aggregateVerifier": "tkey-google-lrc",
      "exp": 1655921894,
      "wallets": [
        {
          "public_key": "035143318b83eb5d31611f8c03582ab1200494f66f5e11a67c34f5581f48c1b70b",
          "type": "web3auth_key",
          "curve": "secp256k1"
        }
      ]
    }
     */
    try {
      const { email, profileImage, iss } = decodeJwt(token);
      // TODO: pubkey auth
      return {
        userId: 'torus:' + randomUUID(),
        email: email as string,
        credentials: '',
      };
    } catch (err) {
      log.error('failed to validate ID token', err as Error, { token });
      throw new ValidationError('invalid ID token');
    }
  }

  async saveCredential(user: User, { email, userId, credentials }: SocialLoginVerifyResult) {}
}
