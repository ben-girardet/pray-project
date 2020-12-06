import { AvatarSelection } from './../elements/avatar-selection';
import { AppNotification } from './../components/app-notification';
import { ImageService } from './../services/internals';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject, EventAggregator } from 'aurelia';
import Croppie from 'croppie';
import { apolloAuth, client } from './../apollo';
// TODO: remove all instances of /server/ in shared or client
import { Image } from '../../../server/src/models/image';
import { editMe } from '../commands/user';
import { gql } from 'apollo-boost';

@inject()
export class EditProfile implements IRouteableComponent, IViewModel {

  public firstname: string;
  public lastname: string;
  public preview: string;
  private avatar: AvatarSelection;

  public cropping = false;
  private croppieElement: HTMLElement;
  public inputFileContainer: HTMLElement;
  public originalImageUrl: string;
  public croppie: Croppie;
  
  public constructor(@IRouter private router: IRouter, private imageService: ImageService, private eventAggregator: EventAggregator) {
    this.imageService.heightRatio = 1;
    this.imageService.cropType = 'square';
    this.imageService.onCancel = () => {
      
    };
    this.imageService.onSelect = () => {
      
    }
  }

  public async binding(): Promise<void> {
    const user = await this.getUser();
    this.preview = user.picture && user.picture.length ? user.picture.find(i => i.height > 50 && i.width > 50).fileId : '';
    setTimeout(() => {
      this.firstname = user.firstname;
      this.lastname = user.lastname;
    }, 150);
  }

  public async getUser(): Promise<{id: string, firstname: string, lastname: string, email: string, mobile: string, picture:{fileId: string, width: number, height: number}[]}> {
    if (!apolloAuth.getUserId()) {
      return null
    }
    const result = await client.query<{user: {
      id: string,
      firstname: string, 
      lastname: string, 
      email: string,
      mobile: string,
      picture: {fileId: string, width: number, height: number}[]}}>({query: gql`query User($userId: String!) {
user(id: $userId) {
  id,
  firstname,
  lastname,
  email,
  mobile,
  picture {
    fileId,
    width,
    height
  },
  nbFriends
}
    }`, variables: {userId: apolloAuth.getUserId()}});
    return result.data.user;
  }

  public attached(): void {
    this.imageService.inputFileContainer = this.inputFileContainer;
    this.imageService.croppieElement = this.croppieElement;
  }

  public async save(): Promise<void> {
    const editUserData: {firstname?: string, lastname?: string, picture?: Image[]} = {};
    editUserData.firstname = this.firstname;
    editUserData.lastname = this.lastname;
    if (this.avatar && this.avatar.avatar !== 'original') {
      if (this.avatar.avatar === 'image') {
        const imageData = await this.avatar.imageService.publish();
        if (imageData !== 'no-change') {
          editUserData.picture = [
            {fileId: imageData.small, width: 40, height: 40},
            {fileId: imageData.medium, width: 100, height: 1000},
            {fileId: imageData.large, width: 1000, height: 1000},
          ]
        }
      } else {
        editUserData.picture = [
          {fileId: `static:${this.avatar.avatar}.gif`, width: 40, height: 40},
          {fileId: `static:${this.avatar.avatar}.gif`, width: 100, height: 100},
          {fileId: `static:${this.avatar.avatar}.gif`, width: 1000, height: 1000},
        ];
      }
    }
    try {
      await editMe(editUserData.firstname, editUserData.lastname, editUserData.picture);
      console.log('user:changed', apolloAuth.getUserId());
      this.eventAggregator.publish('user:changed', apolloAuth.getUserId());
      this.router.load('../-@bottom');
    } catch (error) {
      AppNotification.notify(error.message, 'info');
    }
  }
  
  public cancel(): void {
    this.router.load('../-@bottom');
  }

  public removeImage(): void {
    this.imageService.removeImage();
  }

  

}