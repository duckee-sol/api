import { Service } from 'typedi';
import { ValidationError } from '~/errors';
import { User } from '../../../user';
import { SocialLoginType } from '../../types';
import { FirebaseLogin } from './FirebaseLogin';
import { TestLogin } from './TestLogin';
import { SocialLoginChannel } from './types';
import { Web3AuthLogin } from './Web3AuthLogin';

/**
 * Aggregates all available login channels.
 */
@Service()
export class LoginChannels {
  private readonly loginChannels: { [channel in SocialLoginType]: SocialLoginChannel };

  constructor(
    private firebaseLogin: FirebaseLogin,
    private web3authLogin: Web3AuthLogin,
    private testLogin: TestLogin,
  ) {
    this.loginChannels = {
      firebase: firebaseLogin,
      web3auth: web3authLogin,
      test: testLogin,
    };
  }

  getLoginChannel(channelType: SocialLoginType): SocialLoginChannel {
    const channel = this.loginChannels[channelType];
    if (!channel) {
      throw new ValidationError(`invalid channel type: ${channelType}`, { available: Object.keys(this.loginChannels) });
    }
    return channel;
  }

  findUserByEmail(email: string): Promise<{ user: User; channelType: SocialLoginType } | undefined> {
    return Promise.race(
      Object.entries(this.loginChannels).map(async ([channelType, channel]) => {
        const user = await channel.findUserByEmail(email);
        if (!user) {
          return;
        }
        return { user, channelType: channelType as SocialLoginType };
      }),
    );
  }
}
