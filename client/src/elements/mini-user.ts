// TODO: fix missing User model
import { bindable } from 'aurelia';

export class MiniUser {
  @bindable userId: string;

  private avatarSrc: string;
  private firstname: string;
  private lastname: string;
  @bindable private onlyAvatar = false;
  @bindable private size: 'small' | 'medium' | 'large' = 'medium';

  public constructor() {

  }

  public afterBind(): void {
    console.log('afterBind');
    this.userIdChanged();
  }

  public async userIdChanged(): Promise<void> {
    console.log('userIdChanged', this.userId);
    if (this.userId) {
      const user = null as any; // TODO: fix get user here await this.gunUser.getUser(this.userId);
      console.log('user', user);
      this.firstname = user.firstname;
      this.lastname = user.lastname;
      this.avatarSrc = user.profilePicSmallB64;
    }
  }
}