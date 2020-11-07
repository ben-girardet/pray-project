import { ImageService } from './../services/internals';
import { Topic } from 'shared/types/topic';
import { IRouteableComponent, IRouter } from '@aurelia/router';
import { IViewModel, inject } from 'aurelia';
import ImageBlobReduce from 'image-blob-reduce';
import Croppie from 'croppie';
import { parseColorString } from "@microsoft/fast-components";
import { ColorRGBA64, ColorHSL, rgbToHSL, hslToRGB } from "@microsoft/fast-colors";
import { apolloAuth, client } from './../apollo';
import { ApolloQueryResult, gql } from 'apollo-boost';
import { createTopic, getTopic } from '../commands/topic';
const reducer = ImageBlobReduce();



@inject()
export class TopicForm implements IRouteableComponent, IViewModel {

  public static parameters = ['topicId'];

  public topicId: string;
  public name: string;
  public description: string;
  public preview: string;
  public color = '#0000ff';

  private percent = 0;

  public cropping = false;
  private croppieElement: HTMLElement;
  public inputFileContainer: HTMLElement;
  public originalImageUrl: string;
  public croppie: Croppie;
  public illustrateWith: 'color' | 'picture' = 'color';
  public nameElement: HTMLElement;

  public constructor(@IRouter private router: IRouter, private imageService: ImageService) {
    this.imageService.heightRatio = 1.2;
    this.imageService.cropType = 'square';
    this.imageService.onCancel = () => {
      if (!this.imageService.mediumB64) {
        this.illustrateWith = 'color';
      }
    };
    this.imageService.onSelect = () => {
      this.preview = '';
      this.illustrateWith = 'picture';
    }
  }

  public async load(parameters: {topicId?: string}): Promise<void> {
    if (parameters.topicId) {
      const topic = await getTopic(parameters.topicId);
      this.topicId = topic.id;
      this.color = topic.color;
      this.preview = topic.image && topic.image.length ? topic.image.find(i => i.height > 50 && i.width > 50).fileId : '';
      if (this.preview) {
        this.illustrateWith = 'picture';
      }
      setTimeout(() => {
        this.name = topic.name;
        this.description = topic.description;
      }, 300);
    }
  }

  public bound(): void {
    this.computePercent(this.color);
  }

  public attached(): void {
    setTimeout(() => {
      this.nameElement.focus();
    }, 200);
    this.imageService.inputFileContainer = this.inputFileContainer;
    this.imageService.croppieElement = this.croppieElement;
  }

  public async save(): Promise<void> {
    const topic: Topic = {
      name: this.name,
      description: this.description,
      color: this.color,
      status: 'active'
    };
    if (this.topicId) topic.id = this.topicId;
    if (this.illustrateWith === 'picture') {
      const imageData = await this.imageService.publish();
      if (imageData !== 'no-change') {
        topic.image = [
          {fileId: imageData.smallB64, width: 40, height: 40},
          {fileId: imageData.small, width: 40, height: 40},
          {fileId: imageData.medium, width: 100, height: 1000},
          {fileId: imageData.large, width: 1000, height: 1000},
        ];
      }
    } else {
      topic.image = [];
    }
    const createdTopic = await createTopic(topic.name, topic.description, topic.color, topic.image, 'key');
    this.router.goto('../-@bottom');
  }
  
  public cancel(): void {
    console.log('cancel');
    this.router.goto('../-@bottom');
    console.log('here ok');
  }

  public removeImage(): void {
    this.imageService.removeImage();
    this.illustrateWith = 'color';
  }

  public colorPickerElement: HTMLElement;
  public colorPicking = false;
  public pickColor(event: MouseEvent | TouchEvent): void {
    if (event.type === 'click' || event.type === 'mousedown' || event.type === 'touchstart') {
      this.colorPicking = true;
      this.illustrateWith = 'color';
    }
    if (event.type === 'mouseup' || event.type === 'mouseleave' || event.type === 'touchend') {
      this.colorPicking = false;
    }
    if (!this.colorPicking) {
      return;
    }
    const pageX = event.type.substr(0, 5) === 'touch' ? (event as TouchEvent).touches[0].pageX : (event as MouseEvent).pageX;
    const rect = this.colorPickerElement.getBoundingClientRect();
    const percent = (pageX - rect.left) / rect.width;
    if (percent < 0 || percent > 1) {
      return;
    }
    // #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
    const col0 = '#ff0000';
    const col17 = '#ffff00';
    const col33 = '#00ff00';
    const col50 = '#00ffff';
    const col67 = '#0000ff';
    const col83 = '#ff00ff';
    const col100 = '#ff0000';

    let col1: ColorRGBA64;
    let col2: ColorRGBA64;
    let final: ColorRGBA64;
    if (percent >= 0 && percent <= 0.17) {
      col1 = parseColorString(col0);
      col2 = parseColorString(col17);
      final = mergeHueColor(col1, col2, percent / 0.17);
    } else if (percent >= 0.17 && percent <= 0.33) {
      col1 = parseColorString(col17);
      col2 = parseColorString(col33);
      final = mergeHueColor(col1, col2, (percent - 0.17) / (0.33 - 0.17));
    } else if (percent >= 0.33 && percent <= 0.50) {
      col1 = parseColorString(col33);
      col2 = parseColorString(col50);
      final = mergeHueColor(col1, col2, (percent - 0.33) / (0.50 - 0.33));
    } else if (percent >= 0.50 && percent <= 0.67) {
      col1 = parseColorString(col50);
      col2 = parseColorString(col67);
      final = mergeHueColor(col1, col2, (percent - 0.50) / (0.67 - 0.50));
    } else if (percent >= 0.67 && percent <= 0.83) {
      col1 = parseColorString(col67);
      col2 = parseColorString(col83);
      final = mergeHueColor(col1, col2, (percent - 0.67) / (0.83 - 0.67));
    } else if (percent >= 0.83 && percent <= 1) {
      col1 = parseColorString(col83); // TODO: fix this merge, could be wrong because the bigger hue is in inversed order
      col2 = parseColorString(col100);
      final = mergeHueColor(col1, col2, (percent - 0.83) / (1 - 0.83));
    }
    this.color = final.toStringHexRGB();
    this.computePercent(this.color);
  }

  private computePercent(color: string): void {
    const c = parseColorString(color);
    const hsl = rgbToHSL(c);
    this.percent = hsl.h / 360;
  }

}

export function mergeHueColor(bottom: ColorRGBA64, top: ColorRGBA64, percent = 0.5): ColorRGBA64 {
  const bottomHSL: ColorHSL = rgbToHSL(bottom);
  const topHSL: ColorHSL = rgbToHSL(top);
  let distance = topHSL.h - bottomHSL.h;
  if (distance < 0) {
    distance += 360;
  }
  const delta = distance * percent;
  return hslToRGB(new ColorHSL(bottomHSL.h + delta, topHSL.s, bottomHSL.l));
}