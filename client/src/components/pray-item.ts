/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ITopic } from '../services/internals';
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css, when } from '@microsoft/fast-element';
import { neutralFillHoverBehavior, neutralFillActiveBehavior, neutralFillInput, neutralFillInputActive } from "@microsoft/fast-components";
import { parseColorString } from "@microsoft/fast-components";
import { darkenViaLAB, lightenViaLAB } from "@microsoft/fast-colors";

const template = html<PrayItem>`
${when(x => x.topic.imageSmallB64, html<PrayItem>`<img class="preview" src="${x => x.topic.imageSmallB64}">`)}
${when(x => !x.topic.imageSmallB64, html<PrayItem>`<div class="img-placeholder" style="background: ${x => x.gradient(x.topic.color)}"></div>`)}
<div class="content">
  <div class="author">
    <mini-user user-id="${x => x.topic.author}"></mini-user>
  </div>
  <div class="main-content">
    <div class="title">${x => x.topic.title}</div>
    <div class="description">${x => x.topic.description} ${x => x.topic.description} ${x => x.topic.description} ${x => x.topic.description} ${x => x.topic.description}</div>
  </div>
</div>
`;

const styles = css`
  :host {
    contain: content;
    display: flex;    
    align-items: center;
    justify-content: space-between;
    height: 120px;
    border-radius: calc(var(--corner-radius) * 1px);
    background: ${neutralFillActiveBehavior.var};
    overflow: hidden;
  }
  :host(:hover) {
    background: ${neutralFillHoverBehavior.var};
  }
  img.preview,
  .img-placeholder {
    width: 100px;
    height: 120px;
    flex-shrink: 0;
  }
  .content {
    box-sizing: border-box;
    width: 100%;
    height: 120px;
    flex-shrink: 1;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .main-content {
    margin-bottom: auto;
    max-height: 70px;
    overflow: hidden;
  }
  .author {
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-family: 'Montserrat', sans-serif;
  }
  .author img {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    margin-right: 8px;
  }
  .author span {
    opacity: 0.8;
  }
  .author {
    padding: 4px;
    font-size: 12px;
    font-weight: 100;
  }
  .title {
    font-size: 16px;
  }
  .description {
    font-size: 12px;
    font-weight: 100;
  }
  .title,
  .description {
    padding: 4px;
    line-height: 20px;
  }
`.withBehaviors(
  neutralFillActiveBehavior,
  neutralFillHoverBehavior
)

@customElement({name: 'pray-item', template, styles})
export class PrayItem extends FASTElement {

  @attr()
  public selected = false;

  @attr()
  public topic: ITopic;

  public gradient(original: string): string {
    try {
      const color = parseColorString(original);
      const dark = darkenViaLAB(color, 2);
      const light = lightenViaLAB(color, 2);
      return `linear-gradient(135deg, ${dark.toStringWebRGBA()} 0%, ${light.toStringWebRGBA()} 100%);`;
    } catch (error) {
      return original;
    }
  }
}