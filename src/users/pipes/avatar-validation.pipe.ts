import {
  PipeTransform,
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
  private readonly MAX_SIZE = 2 * 1024 * 1024; 

  private isAllowedMagicNumber(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 12) return false;

    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    const isWebp =
      buffer.toString('utf8', 0, 4) === 'RIFF' &&
      buffer.toString('utf8', 8, 12) === 'WEBP';

    return isJpeg || isPng || isWebp;
  }

  transform(file: any) {
    if (!file) {
      throw new BadRequestException('กรุณาอัปโหลดไฟล์รูปภาพ');
    }

    if (file.size > this.MAX_SIZE) {
      throw new PayloadTooLargeException('ขนาดไฟล์ต้องไม่เกิน 2 MB');
    }

    if (!this.isAllowedMagicNumber(file.buffer)) {
      throw new UnsupportedMediaTypeException(
        'รองรับเฉพาะไฟล์ประเภท jpg, jpeg, png, webp เท่านั้น',
      );
    }

    return file;
  }
}