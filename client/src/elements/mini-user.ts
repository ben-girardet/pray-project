// TODO: fix missing User model
import { gql } from 'apollo-boost';
import { bindable } from 'aurelia';
import { client } from '../apollo';

export class MiniUser {
  @bindable userId: string;

  private picture: {fileId: string, width: number, height: number}[];
  private firstname: string;
  private lastname: string;
  @bindable private onlyAvatar = false;
  @bindable private size: 'small' | 'medium' | 'large' = 'medium';

  public constructor() {

  }

  public attached(): void {
    this.userIdChanged();
  }

  public async userIdChanged(): Promise<void> {
    if (this.userId) {
      const user = await this.getUser();
      this.firstname = user.firstname;
      this.lastname = user.lastname;
      this.picture = user.picture;
    }
  }

  public async getUser(): Promise<{firstname: string, lastname: string, picture:{fileId: string, width: number, height: number}[]}> {
    if (!this.userId) {
      return null
    }
    const result = await client.query<{user: {firstname: string, lastname: string, picture: {fileId: string, width: number, height: number}[]}}>({query: gql`query User($userId: String!) {
user(id: $userId) {
  id,
  firstname,
  lastname,
  picture {
    fileId,
    width,
    height
  }
}
    }`, variables: {userId: this.userId}});
    return result.data.user;
  }
}