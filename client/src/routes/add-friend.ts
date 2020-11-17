// TODO: fix missing interfaces and esrvice
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';
import { client } from '../apollo';
import { gql } from 'apollo-boost';
import { User } from 'shared/types/user';
import { requestFriendship } from '../commands/friendship';
@inject()
export class AddFriend implements IRouteableComponent, IViewModel {

  public found: Partial<User>[] = [];
  public emailOrMobile: string;

  public async search(): Promise<Partial<User>[]> {
    const result = await client.query<{users: {id: string, firstname: string, lastname: string, picture: {fileId: string, width: number, height: number}[]}[]}>({query: gql`query {users(search: "${this.emailOrMobile}") {id, firstname, lastname, picture {fileId, width, height}, friendshipStatus}}`, fetchPolicy: 'network-only'});
    this.found = result.data.users;
    return this.found;
  }

  public async requestFriendship(userId: string): Promise<void> {
    const friendship = await requestFriendship(userId);
    await this.search();
  }

}