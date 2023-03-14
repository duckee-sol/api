import { Service } from 'typedi';
import { SignInAndUpInput } from '~/auth';
import { NoAccount } from '~/auth/errors';
import { User, UserRepository } from '~/user';
import { CheckUserUsesOtherLoginChannel } from './CheckUserUsesOtherLoginChannel';
import { LoginChannels } from './social-logins';

@Service()
export class SignIn {
  constructor(
    private userRepository: UserRepository,
    private loginChannels: LoginChannels,
    private checkUserUsesOtherLoginChannel: CheckUserUsesOtherLoginChannel,
  ) {}

  // TODO: transactional
  async call({ channel, token, address }: SignInAndUpInput): Promise<User> {
    const loginChannel = this.loginChannels.getLoginChannel(channel);
    const { email } = await loginChannel.verifyToken(token);

    const user = await loginChannel.findUserByEmail(email);
    if (!user) {
      await this.checkUserUsesOtherLoginChannel.call(channel, email);
      throw new NoAccount();
    }
    await this.userRepository.update(user.id, { address });
    return user;
  }
}
