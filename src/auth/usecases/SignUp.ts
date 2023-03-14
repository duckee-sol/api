import { generateSlug } from 'random-word-slugs';
import { Service } from 'typedi';
import { User, UserRepository } from '~/user';
import { SignInAndUpInput } from '../types';
import { CheckUserUsesOtherLoginChannel } from './CheckUserUsesOtherLoginChannel';
import { LoginChannels } from './social-logins';

@Service()
export class SignUp {
  constructor(
    private userRepository: UserRepository,
    private loginChannels: LoginChannels,
    private checkUserUsesOtherLoginChannel: CheckUserUsesOtherLoginChannel,
  ) {}

  // TODO: transactional
  async call({ channel, token }: SignInAndUpInput): Promise<User> {
    const loginChannel = this.loginChannels.getLoginChannel(channel);
    const socialLoginResult = await loginChannel.verifyToken(token);

    // to check duplicated user
    await this.checkUserUsesOtherLoginChannel.call(channel, socialLoginResult.email);

    // const wallet = await this.createWallet.call();

    const user = await this.userRepository.create({
      nickname: generateSlug(2),
      email: socialLoginResult.email,
      profileImage: socialLoginResult.profileImage,
      address: wallet.address,
    });
    await loginChannel.saveCredential(user, socialLoginResult);
    return user;
  }
}
