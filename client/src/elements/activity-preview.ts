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

  public unbinding() {
    for (const sub of this.subscriptions) {
      sub.dispose();
    }
    this.subscriptions = [];
  }

  private setUnviewed() {
    // TODO: setUnviewed in activity
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true, detail: this.activity}));
  }

}
