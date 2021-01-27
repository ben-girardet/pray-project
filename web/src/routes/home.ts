import { IPlatform, IRouter } from 'aurelia';
export class Home {

  static parameters = ['selector'];

  public loadingSelector: string = 'sun-header';

  public constructor(@IPlatform private platform: IPlatform, @IRouter private router: IRouter) {

  }

  public load(params: {selector: string}) {
    this.loadingSelector = params.selector || 'sun-header';
  }

  public attached() {
    this.platform.domReadQueue.queueTask(() => {
      const header = document.querySelector(this.loadingSelector);
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
