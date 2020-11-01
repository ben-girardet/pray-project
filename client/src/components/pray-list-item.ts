/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<PrayListItem>`
  <slot name="start" part="start"></slot>
  <div class="content">
    <slot part="content"></slot>
  </div>
  <slot name="end" part="end"></slot>
`;

const styles = css`
  :host {
    display: block;
    contain: content;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .content {
    padding: 16px 8px;
    width: 100%;
    flex-shrink: 1;
  }
  ::slotted([slot=start]) {
    margin: 8px;
  }
  ::slotted([slot=end]) {
    margin: 8px;
  }
`;

@customElement({name: 'pray-list-item', template, styles})
export class PrayListItem extends FASTElement {

  @attr()
  public selected = false;
}