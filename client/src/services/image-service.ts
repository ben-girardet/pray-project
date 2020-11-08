import { ApiService } from './api-service';
import ImageBlobReduce from 'image-blob-reduce';
import Croppie from 'croppie';
import 'croppie/croppie.css';
const reducer = ImageBlobReduce();
import { transient } from 'aurelia';

@transient()
export class ImageService {

  public heightRatio = 1.2;
  public smallWidth = 40;
  public mediumWidth = 100;
  public largeWidth = 1000;
  public cropType: 'square' | 'circle' = 'square';

  private smallBlob: Blob;
  private mediumBlob: Blob;
  private largeBlob: Blob;
  public smallB64: string;
  public mediumB64: string;
  public largeB64: string;

  public cropping = false;
  public croppieElement: HTMLElement;
  public inputFileContainer: HTMLElement;
  public originalImageUrl: string;
  public croppie: Croppie;

  public onSelect: () => void;
  public onCancel: () => void;
  public onRemove: () => void;

  private imageChanged = false;

  public constructor(private apiService: ApiService) {

  }

  public selectImage(): void {
    const width = window.innerWidth;
    const input = document.createElement('input');
    this.inputFileContainer.append(input);
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.addEventListener('change', async () => {
      input.remove();
      
      if (input.files && input.files.length === 1) {
        const file = input.files[0];
        this.originalImageUrl = URL.createObjectURL(file);
        this.cropping = true;
        setTimeout(() => {
          this.croppie = new Croppie(this.croppieElement, {
            viewport: { width: width * 0.8, height: width * 0.8 * this.heightRatio, type: this.cropType }
          });
          this.croppie.bind({url: this.originalImageUrl});
        }, 100);
      }
    });
  }

  public cancelImage(): void {
    this.cropping = false;
    if (this.croppie) {
      this.croppie.destroy();
    }
    URL.revokeObjectURL(this.originalImageUrl);
    if (this.onCancel) {
      this.onCancel.call(null);
    }
  }

  public async saveCrop(): Promise<void> {
    const blob = await this.croppie.result({
      type: 'blob',
      size: 'original',
      format: 'jpeg',
      quality: 1,
      circle: false
    });

    this.smallBlob = await this.resizeBlob(blob, this.smallWidth);
    this.mediumBlob = await this.resizeBlob(blob, this.mediumWidth);
    this.largeBlob = await this.resizeBlob(blob, this.largeWidth);

    this.smallB64 = await this.blob2base64(this.smallBlob);
    this.mediumB64 = await this.blob2base64(this.mediumBlob);
    this.largeB64 = await this.blob2base64(this.largeBlob);

    this.cropping = false;
    this.croppie.destroy();
    URL.revokeObjectURL(this.originalImageUrl);

    this.imageChanged = true;

    if (this.onSelect) {
      this.onSelect.call(null);
    }
  }

  public async resizeBlob(blob: Blob, width: number): Promise<Blob> {
    const resizeRatio = this.heightRatio > 1 ? this.heightRatio : 1;
    return await reducer.toBlob(blob, {max: width * resizeRatio});
  }

  public async blob2base64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = (): void => {
        if (typeof reader.result === 'string') {
          return resolve(reader.result);
        }
        reject(new Error('Invalid image format'))
      }
      reader.onerror = (): void => {
        reject(reader.error);
      }
    });
  }

  public removeImage(): void {
    this.smallB64 = '';
    this.mediumB64 = '';
    this.largeB64 = '';
    delete this.smallBlob;
    delete this.mediumBlob;
    delete this.largeBlob;
    if (this.onRemove) {
      this.onRemove.call(null);
    }
  }

  public async publish(): Promise<{smallB64: string; small: string; medium: string; large: string} | 'no-change'> {
    if (!this.imageChanged) {
      return 'no-change';
    }
    const smallForm = new FormData();
    const mediumForm = new FormData();
    const largeForm = new FormData();
    smallForm.append('file', this.smallBlob);
    mediumForm.append('file', this.mediumBlob);
    largeForm.append('file', this.largeBlob);

    const smallSrc = await this.apiService.post('/images/add', smallForm);
    const mediumSrc = await this.apiService.post('/images/add', mediumForm);
    const largeSrc = await this.apiService.post('/images/add', largeForm);
    return {
      smallB64: this.smallB64,
      small: `api:${smallSrc.id}`,
      medium: `api:${mediumSrc.id}`,
      large: `api:${largeSrc.id}`
    };
  }

}