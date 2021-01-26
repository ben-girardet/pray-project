export class SunDetails1 {
  
  public dialog: HTMLElement;

  public toggleDialog() {
    if (this.dialog.hasAttribute('hidden')) {
      this.dialog.removeAttribute('hidden');
    } else {
      this.dialog.setAttribute('hidden', 'hidden');
    }
  }
}
