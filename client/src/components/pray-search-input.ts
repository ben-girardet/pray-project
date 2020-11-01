/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css, ref } from '@microsoft/fast-element';
import { accentFillRestBehavior, accentForegroundCutRestBehavior, accentFillHoverBehavior, accentFillActiveBehavior, neutralFocusInnerAccentBehavior, neutralFillRestBehavior, neutralForegroundRestBehavior, neutralFillHoverBehavior, neutralFillActiveBehavior, accentForegroundRestBehavior, accentForegroundHoverBehavior, accentForegroundActiveBehavior, neutralOutlineRestBehavior, neutralOutlineHoverBehavior } from "@microsoft/fast-components";

const template = html<PraySearchInput>`
<slot name="start" part="start">
  <pray-icon icon="Search"></pray-icon>
</slot>
<div class="content">
  <input 
    type="search" 
    part="control"
    :value="${x => x.value}"
    @input="${x => x.handleTextInput()}"
    @change="${x => x.handleChange()}"
    placeholder="${x => x.placeholder}"
    ${ref("control")}
    />
</div>
<slot name="end" part="end"></slot>`;

const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    contain: content;
    background: transparent;
    border: 1px solid ${neutralOutlineRestBehavior.var};
    border-radius: calc(var(--corner-radius) * 1px);
    border-radius: 20px;
    padding: 8px;
    margin: 0 1px;
  }
  :host(:hover),
  :host(:active) {
    border-color: ${neutralOutlineHoverBehavior.var};
  }
  ::slotted(part) > * {
    flex-shrink: 0;
  }
  .content {
    width: 100%;
    flex-shrink: 1;
    margin: 8px;
  }
  input {
    width: 100%;
    font-size: 16px;
    border: none;
    background: transparent;
    outline: none;
    color: ${neutralForegroundRestBehavior.var};
  }
  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance:none;
    display: none;
  }
`.withBehaviors(
  neutralFillRestBehavior,
  neutralFillHoverBehavior,
  neutralFillActiveBehavior,
  neutralForegroundRestBehavior,
  neutralOutlineRestBehavior,
  neutralOutlineHoverBehavior
);

@customElement({name: 'pray-search-input', template, styles})
export class PraySearchInput extends FASTElement {

  @attr()
  public value: string;

  /**
     * Sets the placeholder value of the element, generally used to provide a hint to the user.
     * @public
     * @remarks
     * HTML Attribute: placeholder
     * Using this attribute does is not a valid substitute for a labeling element.
     */
    @attr
    public placeholder = '';
    private placeholderChanged(): void {
        if (this.proxy instanceof HTMLElement) {
            this.proxy.placeholder = this.placeholder;
        }
    }

    /**
     * A reference to the internal input element
     * @internal
     */
    public control: HTMLInputElement;

    protected proxy = document.createElement("input");


  /**
   * Handles the internal control's `input` event
   * @internal
   */
  public handleTextInput(): void {
      this.value = this.control.value;
  }

  /**
   * Change event handler for inner control.
   * @remarks
   * "Change" events are not `composable` so they will not
   * permeate the shadow DOM boundary. This fn effectively proxies
   * the change event, emitting a `change` event whenever the internal
   * control emits a `change` event
   * @internal
   */
  public handleChange(): void {
      this.$emit("change");
  }

  
}