/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import * as outline from '../icons/outline';
import * as solid from '../icons/solid';
import { accentFillRestBehavior, accentForegroundCutRestBehavior, accentFillHoverBehavior, accentFillActiveBehavior, neutralFocusInnerAccentBehavior, neutralFillRestBehavior, neutralForegroundRestBehavior, neutralFillHoverBehavior, neutralFillActiveBehavior, accentForegroundRestBehavior, accentForegroundHoverBehavior, accentForegroundActiveBehavior } from "@microsoft/fast-components";

const template = html<PrayIcon>`<span class="${x => x.button ? 'button':''} ${x => x.accent ? 'accent':''} ${x => x.lightweight ? 'lightweight':''}"></span>`;

const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    contain: content;
    stroke-width: 1px;
  }
  span {
    display:inline-flex;
    align-items: center;
    justify-content: center;
    contain: content;
    stroke-width: 1px;
  }
  .button {
    margin: 4px;
    padding: 8px;
    background: ${neutralFillRestBehavior.var};
    color: ${neutralForegroundRestBehavior.var};
    border-radius: calc(var(--corner-radius) * 1px);
  }
  .button:hover {
    background: ${neutralFillHoverBehavior.var};
  }
  .button:active {
    background: ${neutralFillActiveBehavior.var};
  }
  .button.disabled {
    background: ${neutralFillRestBehavior.var};
  }
  .button.lightweight {
    background: transparent;
    color: ${accentForegroundRestBehavior.var};
  }
  .button.lightweight:hover {
    color: ${accentForegroundHoverBehavior.var};
  }
  .button.lightweight:active {
    color: ${accentForegroundActiveBehavior.var};
  }
  .button.accent {
    margin: 4px;
    padding: 8px;
    background: ${accentFillRestBehavior.var};
    color: ${accentForegroundCutRestBehavior.var};
    box-shadow: 0 0 0 calc(var(--focus-outline-width) * 1px) inset ${neutralFocusInnerAccentBehavior.var};
    border-radius: calc(var(--corner-radius) * 1px);
  }
  .button.accent:hover {
    background: ${accentFillHoverBehavior.var};
  }
  .button.accent:active {
    background: ${accentFillActiveBehavior.var};
  }
  .button.accent.disabled {
    background: ${accentFillRestBehavior.var};
  }
`.withBehaviors(
  neutralFillRestBehavior,
  neutralForegroundRestBehavior,
  neutralFillHoverBehavior,
  neutralFillActiveBehavior,
  accentFillRestBehavior,
  accentForegroundCutRestBehavior,
  accentForegroundHoverBehavior,
  accentForegroundActiveBehavior,
  neutralFocusInnerAccentBehavior,
  accentFillActiveBehavior,
  accentForegroundRestBehavior
);

@customElement({name: 'pray-icon', template, styles})
export class PrayIcon extends FASTElement {

  @attr({ mode: 'boolean' })
  public button: boolean = false;

  public buttonChanged(): void {
    this.setIcon();
  }

  @attr({ mode: 'boolean' })
  public lightweight: boolean = false;

  public lightweightChanged(): void {
    this.setIcon();
  }

  @attr({ mode: 'boolean' })
  public accent: boolean = false;

  public accentChanged(): void {
    this.setIcon();
  }

  @attr()
  public icon: string;

  public iconChanged(): void {
    this.setIcon();
  }

  private setIcon(): void {
    window.requestAnimationFrame(() => {
      if (!this.shadowRoot || !this.shadowRoot.querySelector('span')) {
        this.setIcon();
        return;
      }
      this.shadowRoot.querySelector('span').innerHTML = this[this.type][this.icon];
      const svg = this.shadowRoot.querySelector('svg');
      if (svg instanceof SVGElement) {
        // svg.classList.toggle('button', this.button);
        // svg.classList.toggle('lightweight', this.lightweight);
        // svg.classList.toggle('accent', this.accent);
        svg.setAttribute('part', 'svg');
        svg.style.width = `${this.sizeInPx()}px`;
        svg.style.height = `${this.sizeInPx()}px`;
      }
      const paths = this.shadowRoot.querySelectorAll('path');
      for (const path of paths) {
        path.setAttribute('stroke-width', `${this.weight}`);
      }
    });
  }

  @attr()
  public type: 'outline' | 'solid' = 'outline';

  public typeChanged(): void {
    if (this.type !== 'solid' && this.type !== 'outline') {
      this.type = 'outline';
    }
    this.setIcon();
  }

  @attr()
  public weight = 1;

  public weightChanged(): void {
    this.setIcon();
  }

  @attr()
  public size = 'lg';

  public sizeChanged(): void {
    this.setIcon();
  }

  private sizeInPx(): number {
    if (this.size === 'sm') {
      return 16;
    }
    if (this.size === 'md') {
      return 20;
    }
    if (this.size === 'lg') {
      return 24;
    }
    if (this.size === 'xl') {
      return 28;
    }
    return 24;
  }

  public solid = solid;
  public outline = outline;
}