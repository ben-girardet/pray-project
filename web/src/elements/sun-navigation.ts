import { IRouter, IPlatform } from 'aurelia';
export class SunNavigation {

  private navbar: HTMLElement;

  public constructor(@IRouter private router: IRouter, @IPlatform private platform: IPlatform) {

  }

  public attaching() {
    window.addEventListener('scroll', this);
    this.handleEvent();
  }

  public attached() {
    // closes the responsive menu on menu item click
    document.querySelectorAll('.navbar-nav li a').forEach(e => e.addEventListener('click', this));
  }

  public detaching() {
    window.removeEventListener('scroll', this);
    document.querySelectorAll('.navbar-nav li a').forEach(e => e.removeEventListener('click', this));
  }

  public handleEvent(event?: MouseEvent | Event) {
    if (event && event.type === 'click') {
      if (event.target instanceof Element && event.target.parentElement.classList.contains('dropdown')) {
        return;
      }
      const toggler = document.querySelector('.navbar-toggler')
      if (toggler instanceof HTMLElement) {
        toggler.click();
      }
    } else if (!event || event.type === 'scroll') {
      const offset = getOffset(this.navbar);
      if (offset.top > 60) {
        document.querySelectorAll('.fixed-top').forEach((e) => {
          e.classList.add('top-nav-collapse');
        });
      } else {
        document.querySelectorAll('.fixed-top').forEach((e) => {
          e.classList.remove('top-nav-collapse');
        });
      }
    } else {
      console.warn('Unhandled event type', event.type);
    }
  }

  public home() {
    if (this.router.activeComponents.filter(vi => vi.componentName === 'home').length > 0) {
      // we are on the home page
      this.pageScroll('#header');
    } else {
      this.router.load('../home');
    }
  }

  public async goto(anchorSelector: string) {
    if (this.router.activeComponents.filter(vi => vi.componentName === 'home').length > 0) {
      // we are on the home page
      this.pageScroll(anchorSelector);
    } else {
      await this.router.load(`../home(${anchorSelector})`);
      this.platform.domReadQueue.queueTask(() => {
        // this.pageScroll(anchorSelector);
      });
    }
  }

  public async pageScroll(anchorSelector: string) {
    

    const anchor = document.querySelector(anchorSelector);
    if (!anchor) { 
      return;
    }
    anchor.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
}


function getOffset(element)
{
    if (!element.getClientRects().length)
    {
      return { top: 0, left: 0 };
    }

    let rect = element.getBoundingClientRect();
    let win = element.ownerDocument.defaultView;
    return (
    {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    });   
}
