import conf from '../config';

export class FileValueConverter {
  public toView(filename: string): string {
    if (!filename) {
      return '';
    }
    if (filename.substr(0, 4) === 'api:') {
      //return `http://localhost:3000/api/images/get/${filename.substr(4)}`
      return `${conf.apiHost}/image/${filename.substr(4)}`
    } else if (filename.substr(0, 7) === 'static:') {
      return `/images/avatars/${filename.substr(7)}`;
    }
    return filename;
  }
}
