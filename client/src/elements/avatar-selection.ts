import { customElement, bindable, BindingMode } from 'aurelia';
import { ImageService } from '../services/internals';

@customElement('avatar-selection')
export class AvatarSelection {

  @bindable({mode: BindingMode.twoWay}) public profilePic: string;
  @bindable public original: string = '';

  public avatar = 'liquid1';

  private croppieElement: HTMLElement;
  public inputFileContainer: HTMLElement;

  public constructor(public imageService: ImageService) {
    this.imageService.heightRatio = 1;
    this.imageService.cropType = 'circle';
    this.imageService.onCancel = () => {
      if (this.imageService.mediumB64) {
        this.selectAvatar('liquid1');
      }
    };
    this.imageService.onSelect = () => {
      this.selectAvatar('image');
    }
  }

  public bound(): void {
    if (this.original) {
      this.avatar = 'original';
    }
  }

  public attached(): void {
    this.imageService.inputFileContainer = this.inputFileContainer;
    this.imageService.croppieElement = this.croppieElement;
  }

  public selectImage(): void {
    this.imageService.selectImage();
  }

  public removeImage(): void {
    this.imageService.removeImage();
    this.selectAvatar('liquid1');
  }

  public selectAvatar(avatar: string): void {
    this.avatar = avatar;
  }
}