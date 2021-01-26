export class SunNavigation {

  private navbar: HTMLElement;

  public attaching() {
    window.addEventListener('scroll', this);
    this.handleEvent();
  }

  public detaching() {
    window.removeEventListener('scroll', this);
  }

  public handleEvent() {
    
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
