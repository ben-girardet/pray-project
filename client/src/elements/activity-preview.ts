import { bindable, IDisposable, ICustomElementViewModel } from 'aurelia';
import { Activity } from 'shared/types/activity';
import { Topic } from 'shared/types/topic';
import { Message } from 'shared/types/message';
import { Global } from '../global';
import { getTopicName } from '../commands/topic';
import { getMessageText } from '../commands/message';
import { CryptingService } from './../services/crypting-service';

export class ActivityPreview implements ICustomElementViewModel {

  @bindable activity: Activity;

  private subscriptions: IDisposable[] = [];
  private topic: Partial<Topic>;
  private message?: Partial<Message>;
  private originalName: string = '';
  private newName: string = '';

  constructor(private element: HTMLElement, private global: Global) {

  }

  public binding() {
    this.subscriptions.push(this.global.eventAggregator.subscribe('unviewed:update', () => {
      this.setUnviewed();
    }));
    this.setUnviewed();
  }

  public async bound() {
    await this.getTopic();
    await this.getMessage();
    if (this.activity.action === 'topic:edit:name') {
      await this.setOriginalName();
      await this.setNewName();
    }
  }

  private async getTopic() {
    const topic = await getTopicName(this.activity.topicId, 'cache-first');
    await CryptingService.decryptTopic(topic);
    this.topic = topic;
  }

  private async getMessage() {
    if (!this.activity.messageId) {
      this.message = undefined;
      return;
    }
    const message = await getMessageText(this.activity.messageId, 'cache-first');
    const fakeTopic = Object.assign({}, this.topic, {messages: [message]});
    await CryptingService.decryptTopic(fakeTopic);
    this.message = fakeTopic.messages[0];
  }

  private async decryptStringWithTopic(text: string): Promise<string> {
    const fakeMessage = {text};
    const fakeTopic = Object.assign({}, this.topic, {messages: [fakeMessage]});
    await CryptingService.decryptTopic(fakeTopic);
    return fakeTopic.messages[0].text;
  }

  public unbinding() {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
  }

  private setUnviewed() {
    // TODO: setUnviewed in activity
  }

  public async setOriginalName(): Promise<string> {
    this.originalName = '';
    try {
      const data = JSON.parse(this.activity.data);
      if (!Array.isArray(data)) {
        return;
      }
      if (data[0]) {
        this.originalName = await this.decryptStringWithTopic(data[0]);
        return;
      }
    } catch (error) {
      return;
    }
  }

  public async setNewName(): Promise<string> {
    this.newName = '';
    try {
      const data = JSON.parse(this.activity.data);
      if (!Array.isArray(data)) {
        return;
      }
      if (data[1]) {
        this.newName = await this.decryptStringWithTopic(data[1]);
        return;
      }
    } catch (error) {
      return;
    }
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true, detail: this.activity}));
  }

}
