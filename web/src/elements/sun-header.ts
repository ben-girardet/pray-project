export class SunHeader {
  public pageScroll(anchorSelector: string) {
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
