import { AppNotification } from './../components/app-notification';
import { CryptingService } from './../services/crypting-service';
import { Topic } from 'shared/types/topic';
import { IViewModel, ILogger, bindable } from 'aurelia';
import { getTopic } from '../commands/topic';
import { createMessageInTopic } from '../commands/message';

export class TopicPraying implements IViewModel {

  public static parameters = ['topicId'];

  @bindable public topicId: string;
  public topic: Topic;

  private prayingHead: HTMLDivElement;
  private prayingContent: HTMLDivElement;
  private prayingBottom: HTMLDivElement;
  private textarea: HTMLTextAreaElement;
  public message: string = '';
  private logger: ILogger;

  public constructor(@ILogger iLogger: ILogger, private element: HTMLElement) {
    this.logger = iLogger.scopeTo('topic-praying');
  }

  public async binding(): Promise<void> {
    await this.topicIdChanged();
  }
  
  public async topicIdChanged(): Promise<void> {
    await this.getTopic();
  }

  public detached(): void {
    
  }

  public async getTopic(): Promise<void> {
    try {
      const topic = await getTopic(this.topicId);
      await CryptingService.decryptTopic(topic);
      this.topic = topic;
    } catch (error) {
      this.logger.error(error);
    }
  }

  public dispatchEvent(event: string) {
    this.element.dispatchEvent(new CustomEvent(event, {bubbles: true}));
  }

  public messageChanged() {
    this.fitTextContent();
  }

  public fitTextContent() {
    if (this.textarea instanceof HTMLTextAreaElement) {
      let currentHeight = this.textarea.offsetHeight;
      if (this.message) {
        this.textarea.style.height = 'auto';
        // TODO: fix this 94 value
        let h = Math.min(94, this.textarea.scrollHeight + 2);
        this.textarea.style.height = `${h}px`;
        // TODO: fix the following line to adjust the scroll of the content above
        // let newHeight = this.textarea.offsetHeight;
        // let diff = newHeight - currentHeight;
        // if (diff > 0) {
        //   this.contentElement.scrollTop += diff;
        // } 
      } else {
        this.textarea.style.height = '';
      }
      this.setHeights();
    }
  }

  private setHeights() {
    // this.prayingContent.style.height = `calc(100% - ${this.prayingHead.offsetHeight}px - ${this.prayingBottom.offsetHeight}px)`;
  }

  public async sendMessage(): Promise<void> {
    if (!this.message) {
      return;
    }
    try {
      await CryptingService.encryptNewMessage(this.topic, this.message);
      await createMessageInTopic(this.topicId, this.message);
      this.message = '';
      document.body.focus();
      AppNotification.notify('Message sent', 'success');
    } catch (error) {
      AppNotification.notify(error.message, 'error');
    }
  }

  public focusIfNot(event: Event) {
    this.stop(event);
    this.textarea.focus();
  }

  public stop(event: Event) {
    event.stopPropagation();
  }

}