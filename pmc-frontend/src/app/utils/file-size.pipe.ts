import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | string, decimals: number = 2): string {
    if (bytes === null || bytes === undefined || isNaN(Number(bytes))) {
      return '0 Bytes';
    }
    
    const bytesNum = Number(bytes);
    if (bytesNum === 0) {
      return '0 Bytes';
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytesNum) / Math.log(k));
    
    return parseFloat((bytesNum / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}
