/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { neutralFillRestBehavior, neutralForegroundRestBehavior } from "@microsoft/fast-components";

const template = html<AppNotification>`
  <template class="${x => x.type}">
    <slot></slot>
  </template>
`;

const styles = css`
  :host {
    padding: calc((10 + (var(--design-unit) * 2 * var(--density))) * 1px) calc((10 + (var(--design-unit) * 2 * var(--density))) * 2px);
    display: flex;
    contain: content;
    position: fixed;
    top: 16px;
    top: calc(16px + env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
    border-radius: calc(var(--corner-radius) * 1px);
    background: ${neutralFillRestBehavior.var};
    color: ${neutralForegroundRestBehavior.var};
    z-index: 10;
  }
  :host(.success) {
    background: var(--accent-color);
    color: #FFFFFF;
  }
  :host(.error) {
    background: #BE2D39;
    color: #FFFFFF;
  }
`.withBehaviors(neutralFillRestBehavior, neutralForegroundRestBehavior);

export type NotificationTypes = 'info' | 'success' | 'error';

@customElement({name: 'pray-notification', template, styles})
export class AppNotification extends FASTElement {

  @attr()
  public type: 'info' | 'success' | 'error' = 'info';

  @attr()
  public timeout = 5000;

  @attr({mode: 'boolean'})
  public closeOnClick = true;

  private timeoutRef: NodeJS.Timeout;

  public closeOnClickChanged() {
    if (this.closeOnClick) {
      this.shadowRoot.addEventListener('click', this);
    } else {
      this.shadowRoot.removeEventListener('click', this);
    }
  }

  public handleEvent(_event: MouseEvent): void {
    clearTimeout(this.timeoutRef);
    this.remove();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.timeoutRef = setTimeout(() => {
      this.remove();
    }, this.timeout);
  }

  public static notify(message: string, type: NotificationTypes) {
    const notification = document.createElement('pray-notification');
    notification.innerText = message;
    notification.setAttribute('type', type);
    document.querySelector('fast-design-system-provider').append(notification);
  }

}
