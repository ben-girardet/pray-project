/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { attr } from "@microsoft/fast-element";
import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<PrayMiniUser>`
  <div class="avatar"><img src="${x => x.avatarSrc}"></div>
  <div class="name">${x => x.firstname} ${x => x.lastname}</div>
`;

const styles = css`
  :host {
    contain: content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .avatar {
    width: 25px;
    height: 25px;
    border-radius: 25px;
    overflow: hidden;
    margin-right: 8px;
  }
  .name {
    color: red;
  }
`;

@customElement({name: 'pray-mini-user', template, styles})
export class PrayMiniUser extends FASTElement {

  @attr()
  public userId: string;

  public userIdChanged(): void {

  }

  public avatarSrc = '';
  public firstname = '';
  public lastname = '';
}