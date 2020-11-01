/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr, DOM } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<PrayGridItem>`
  <div class="content">
    <slot part="content"></slot>
  </div>
`;

const styles = css`
  :host {
    contain: content;
    display: flex;
    flex-direction: column;
    grid-row-end: span 3;
    border: 1px solid red;
  }
  .content {
    
  }
  ::slotted(img) {
    width: 100%;
  }
`;

@customElement({name: 'pray-grid-item', template, styles})
export class PrayGridItem extends FASTElement {

  @attr()
  public selected = false;

  public connectedCallback() {
    super.connectedCallback();
    DOM.queueUpdate(() => {
      const grid = this.closest('.grid');
      if (!grid) {
        return;
      }
      const rowHeight = parseInt(
        window.getComputedStyle(grid)
        .getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(
        window.getComputedStyle(grid)
        .getPropertyValue('grid-row-gap'));
      const content = this.shadowRoot.querySelector('.content');
      if (!content) {
        return;
      }
      if (content) {
        const rowSpan = Math.ceil((content.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
        this.style.gridRowEnd = "span "+rowSpan;
      }
    });
    
  }
}