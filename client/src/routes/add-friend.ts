import { AppNotification } from './../components/app-notification';
import { IRouteableComponent } from '@aurelia/router';
import { ICustomElementViewModel, inject } from 'aurelia';
import { client } from '../apollo';
import { gql } from 'apollo-boost';
import { requestFriendship } from '../commands/friendship';
import { Friend } from './friends';
import { Global } from '../global';
@inject()
export class AddFriend implements IRouteableComponent, ICustomElementViewModel {

  public found: Friend[] = [];
  public emailOrMobile: string = '';

  public constructor(private global: Global) {

  }

  public attached() {
    setTimeout(() => {
      this.emailOrMobile = '';
    }, 100)
  }

  public async search(): Promise<Friend[]> {
    const result = await client.query<{users: {id: string, firstname: string, lastname: string, picture: {fileId: string, width: number, height: number}[]}[]}>({query: gql`query {users(search: "${this.emailOrMobile}") {id, firstname, lastname, picture {fileId, width, height}, friendshipStatus}}`, fetchPolicy: 'network-only'});
    this.found = result.data.users;
    return this.found;
  }

  public async requestFriendship(userId: string): Promise<void> {
    await requestFriendship(userId);
    AppNotification.notify('Friendship requested', 'success');
    await this.search();
    this.global.notificationService.fetchFriendshipsRequests();
  }

}
