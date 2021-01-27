import { IPlatform } from 'aurelia';
export class Terms {

  public constructor(@IPlatform private platform: IPlatform) {

  }

  public attached() {
    this.platform.domReadQueue.queueTask(() => {
      const header = document.querySelector('header');
      if (header) {
        header.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    });
  }
}
