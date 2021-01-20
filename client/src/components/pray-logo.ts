/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { accentForegroundRestBehavior } from "@microsoft/fast-components";

const template = html<PrayLogo>`
<template class="${x => x.size}">sunago</template>`;

const styles = css`
  :host {
    display: inline;
    font-weight: bold;
    font-family: 'GFS Neohellenic', sans-serif;
    font-style: italic;
    color: var(--accent-color);
  }
  :host(.small) {
    font-size: 20px;
  }
  :host(.medium) {
    font-size: 30px;
  }
  :host(.large) {
    font-size: 40px;
  }
`.withBehaviors(accentForegroundRestBehavior);

@customElement({name: 'pray-logo', template, styles})
export class PrayLogo extends FASTElement {

  @attr()
  public size: 'small' | 'medium' | 'large' = 'small';

}
