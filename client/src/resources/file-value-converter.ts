import conf from '../config';

export class FileValueConverter {
  public toView(filename: string | {fileId: string, width: number, height: number}[], imageWidth: string = '0', imageHeight: string = '0'): string {
    if (!filename || (Array.isArray(filename) && filename.length === 0)) {
      return '';
    }
    let maxImage = '';
    if (Array.isArray(filename)) {
      const width = imageWidth !== '0' ? parseInt(imageWidth, 10) : 10000;
      const height = imageHeight !== '0' ? parseInt(imageHeight, 10) : 10000;
      let maxWidth = 0;
      for (const image of filename) {
        if (image.width >= width && image.height >= height) {
          filename = image.fileId;
          break;
        }
        if (image.width > maxWidth) {
          maxWidth = image.width;
          maxImage = image.fileId;
        }
      }
    }
    if (Array.isArray(filename)) {
      if (maxImage) {
        filename = maxImage;
      } else {
        return '';
      }
    }
    if (typeof filename === 'string' && filename.substr(0, 4) === 'api:') {
      //return `http://localhost:3000/api/images/get/${filename.substr(4)}`
      return `${conf.apiHost}/image/${filename.substr(4)}`
    } else if (typeof filename === 'string' && filename.substr(0, 7) === 'static:') {
      return `images/avatars/${filename.substr(7)}`;
    }
    return filename;
  }
}
