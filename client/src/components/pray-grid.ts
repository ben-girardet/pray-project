/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<PrayGrid>`
  <template class="grid ${x => x.size}">
    <slot></slot>
  </template>
`;

const styles = css`
  :host {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(150px,1fr));
    grid-auto-rows: 20px;
  }
`;

@customElement({name: 'pray-grid', template, styles})
export class PrayGrid extends FASTElement {

  @attr()
  public size: 'xs' | 'sm' | 'md' = 'md';

}