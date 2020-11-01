/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<PrayList>`
  <template class="${x => x.border ? 'border' : ''} ${x => x.borderTopBottom ? 'border-top-bottom' : ''}">
    <slot></slot>
  </template>
`;

const styles = css`
  :host {
    display: block;
    contain: content;
  }
  :host(.border-top-bottom) {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
  ::slotted(pray-list-item) {
    border-bottom: 1px solid #ccc;
  }
  ::slotted(pray-list-item:last-of-type) {
    border-bottom: none;
  }
`;

@customElement({name: 'pray-list', template, styles})
export class PrayList extends FASTElement {

  @attr({ mode: 'boolean' })
  public border: boolean = true;

  @attr({ mode: 'boolean' })
  public borderTopBottom: boolean = false;

}